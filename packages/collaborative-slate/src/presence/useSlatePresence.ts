import * as React from 'react';
import {JsonCrdtDataType} from 'json-joy/lib/json-crdt-patch/constants';
import {peritext as peritextPresence, UserPresenceIdx} from '@jsonjoy.com/collaborative-presence';
import {generateColor} from './styles';
import {pointToSlatePoint, slatePointToPoint} from '../positions';
import {deepEqual} from '@jsonjoy.com/json-equal';
import type {NodeEntry, Range as SlateRange, Editor, BaseRange} from 'slate';
import type {PresenceManager, PeerEntry, PresenceEvent} from '@jsonjoy.com/collaborative-presence/lib/PresenceManager';
import type {RgaSelection, UserPresence} from '@jsonjoy.com/collaborative-presence/lib/types';
import type {StablePeritextSelection} from '@jsonjoy.com/collaborative-presence/lib/peritext';
import type {Peritext} from 'json-joy/lib/json-crdt-extensions';
import type {PeritextRef} from '@jsonjoy.com/collaborative-peritext';
import type {PresenceDecoration, PresenceCaretInfo, PresenceUser} from './types';
import type {SlatePath, SlatePoint} from '../types';

const isRgaSelection = (sel: unknown): sel is RgaSelection => {
  if (!Array.isArray(sel) || sel.length < 8) return false;
  const type = sel[5];
  return type === JsonCrdtDataType.str || type === JsonCrdtDataType.bin || type === JsonCrdtDataType.arr;
};

const pathsEqual = (a: SlatePath, b: SlatePath): boolean => deepEqual(a, b);

/** Lexicographic comparison of two Slate paths: -1 | 0 | 1. */
const comparePaths = (a: SlatePath, b: SlatePath): number => {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const cmp = a[i] - b[i];
    if (cmp !== 0) return cmp;
  }
  return a.length - b.length;
};

/** Order two Slate points so that start <= end. */
const orderPoints = (a: SlatePoint, b: SlatePoint): [SlatePoint, SlatePoint] => {
  const cmp = comparePaths(a.path, b.path);
  if (cmp < 0) return [a, b];
  if (cmp > 0) return [b, a];
  return a.offset <= b.offset ? [a, b] : [b, a];
};

export interface UseSlatePresenceOpts<Meta extends object = object> {
  /** The shared presence store. When undefined, presence is disabled. */
  manager?: PresenceManager<Meta>;
  /** Accessor for the Peritext CRDT. */
  peritext: PeritextRef;
  /** The Slate editor instance. Needed for position conversion. */
  editor: Editor;
  /** Extracts a {@link PresenceUser} (name, color) from the `meta` payload of a
   * `UserPresence` tuple. When omitted, user info is not available on carets. */
  userFromMeta?: (meta: Meta) => PresenceUser | undefined;
  /** Milliseconds after which the name label fades (default 3000). */
  fadeAfterMs?: number;
  /** Milliseconds of inactivity after which the caret dims (default 30000). */
  dimAfterMs?: number;
  /** Milliseconds of inactivity after which the presence is hidden (default 60000). */
  hideAfterMs?: number;
  /** Interval in ms for running {@link PresenceManager.removeOutdated}.
   * Pass `0` to disable internal GC. Default: 5000. */
  gcIntervalMs?: number;
}

/**
 * React hook that integrates remote-peer presence rendering into Slate.js.
 *
 * Returns:
 *
 * - `decorate` — a function to pass to `<Editable decorate={decorate}>`.
 * - `sendLocalPresence` — call this after selection/doc changes to broadcast
 *   the local selection to remote peers.
 *
 * The hook subscribes to `manager.onChange` and triggers re-renders when remote
 * presence data arrives. It also sets up a GC timer to remove stale peers.
 *
 * Usage:
 *
 * ```tsx
 * const {decorate, sendLocalPresence} = useSlatePresence({
 *   manager, peritext, editor,
 * });
 * <Editable decorate={decorate} ... />
 * ```
 */
export const useSlatePresence = <Meta extends object = object>(opts: UseSlatePresenceOpts<Meta>) => {
  const {
    manager,
    peritext: peritextRef,
    editor,
    userFromMeta,
    fadeAfterMs = 3_000,
    dimAfterMs = 30_000,
    hideAfterMs = 60_000,
    gcIntervalMs = 5_000,
  } = opts;
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    if (!manager) return;
    const unsubscribe = manager.onChange.listen((_evt: PresenceEvent) => {
      setTick((t) => t + 1);
    });
    let gcTimer: ReturnType<typeof setInterval> | undefined;
    if (gcIntervalMs > 0) gcTimer = setInterval(() => manager.removeOutdated(hideAfterMs), gcIntervalMs);
    return () => {
      unsubscribe();
      clearInterval(gcTimer);
    };
  }, [manager, gcIntervalMs, hideAfterMs]);

  // Slate calls `decorate` for every node in the tree. `Text.decorations()`
  // only uses the *offset* from returned ranges — it ignores the path. This
  // means we MUST only return ranges that belong to the text node identified
  // by `path`, and clip cross-node highlight ranges to this node's bounds.
  const decorate = React.useCallback(
    (entry: NodeEntry): BaseRange[] => {
      if (!manager) return [];
      const [node, path] = entry;
      if (typeof (node as any).text !== 'string') return [];
      const textLen: number = (node as any).text.length;
      const api = peritextRef();
      if (!api) return [];
      const txt: Peritext = api.txt;
      const rootBlock = txt.blocks.root;
      const localProcessId = manager.getProcessId();
      const now = Date.now();
      const peers = manager.peers;
      const ranges: (SlateRange & PresenceDecoration)[] = [];
      for (const processId in peers) {
        if (processId === localProcessId) continue;
        const peerEntry: PeerEntry<Meta> = peers[processId];
        const presence: UserPresence<Meta> = peerEntry[0];
        const receivedAt: number = peerEntry[1];
        const age = now - receivedAt;
        if (age >= hideAfterMs) continue;
        const selections: unknown[] = presence[UserPresenceIdx.Selections] as unknown[];
        if (!selections) continue;
        const meta = presence[UserPresenceIdx.Meta];
        const user: PresenceUser | undefined = userFromMeta ? userFromMeta(meta) : undefined;
        const color = user?.color ?? generateColor(processId);
        const name = user?.name ?? processId.slice(0, 4);
        for (const sel of selections) {
          if (!isRgaSelection(sel)) continue;
          let stableSelections: StablePeritextSelection[];
          try {
            stableSelections = peritextPresence.fromDto(txt, sel);
          } catch {
            continue;
          }
          if (!stableSelections.length) continue;
          for (const [range, startIsAnchor] of stableSelections) {
            const anchorPoint = startIsAnchor ? range.start : range.end;
            const focusPoint = startIsAnchor ? range.end : range.start;
            let anchor: SlatePoint;
            let focus: SlatePoint;
            try {
              anchor = pointToSlatePoint(rootBlock, anchorPoint, editor);
              focus = pointToSlatePoint(rootBlock, focusPoint, editor);
            } catch {
              continue;
            }
            if (pathsEqual(focus.path, path)) {
              const caretInfo: PresenceCaretInfo = {
                peerId: processId,
                color,
                name,
                fadeAfterMs,
                dimAfterMs,
                hideAfterMs,
                receivedAt,
              };
              ranges.push({
                anchor: {path, offset: focus.offset},
                focus: {path, offset: focus.offset},
                presenceCaret: caretInfo,
              });
            }
            const isCollapsed = pathsEqual(anchor.path, focus.path) && anchor.offset === focus.offset;
            if (!isCollapsed) {
              const [start, end] = orderPoints(anchor, focus);
              // Check if this text node intersects the [start, end] range.
              const afterEnd = comparePaths(path, end.path) > 0;
              const beforeStart = comparePaths(path, start.path) < 0;
              if (!afterEnd && !beforeStart) {
                const clipStart = pathsEqual(path, start.path) ? start.offset : 0;
                const clipEnd = pathsEqual(path, end.path) ? end.offset : textLen;
                if (clipStart < clipEnd) {
                  const highlightColor = generateColor(processId, 0.3);
                  ranges.push({
                    anchor: {path, offset: clipStart},
                    focus: {path, offset: clipEnd},
                    presenceHighlight: highlightColor,
                  });
                }
              }
            }
          }
        }
      }
      return ranges;
    },
    [manager, peritextRef, editor, userFromMeta, fadeAfterMs, dimAfterMs, hideAfterMs],
  );

  const sendLocalPresence = React.useCallback(() => {
    if (!manager) return;
    const selection = editor.selection;
    if (!selection) return;
    const api = peritextRef();
    if (!api) return;
    const txt: Peritext = api.txt;
    try {
      const p1 = slatePointToPoint(txt, editor, selection.anchor);
      const p2 = slatePointToPoint(txt, editor, selection.focus);
      const range = txt.rangeFromPoints(p1, p2);
      const startIsAnchor =
        comparePaths(selection.anchor.path, selection.focus.path) < 0 ||
        (comparePaths(selection.anchor.path, selection.focus.path) === 0 &&
          selection.anchor.offset <= selection.focus.offset);
      const stableSelection: StablePeritextSelection = [range, startIsAnchor];
      const dto = peritextPresence.toDto(txt, [stableSelection]);
      manager.setSelections([dto]);
    } catch {}
  }, [editor, peritextRef, manager]);

  return {decorate, sendLocalPresence} as const;
};
