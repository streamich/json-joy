import {Plugin, PluginKey} from 'prosemirror-state';
import {Decoration, DecorationSet} from 'prosemirror-view';
import {JsonCrdtDataType} from 'json-joy/lib/json-crdt-patch/constants';
import {peritext as peritextPresence} from '@jsonjoy.com/collaborative-presence';
import {SYNC_PLUGIN_KEY, TransactionOrigin} from '../constants';
import {pmPosToPoint, pointToPmPos} from '../util';
import {UserPresenceIdx} from '@jsonjoy.com/collaborative-presence';
import * as view from './view';
import {CursorManager} from './view';
import type {PresenceManager, PresenceEvent, PeerEntry} from '@jsonjoy.com/collaborative-presence/lib/PresenceManager';
import type {RgaSelection, UserPresence} from '@jsonjoy.com/collaborative-presence/lib/types';
import type {StablePeritextSelection} from '@jsonjoy.com/collaborative-presence/lib/peritext';
import type {PeritextRef} from '@jsonjoy.com/collaborative-peritext';
import type {EditorView, DecorationAttrs} from 'prosemirror-view';
import type {EditorState} from 'prosemirror-state';
import type {Peritext} from 'json-joy/lib/json-crdt-extensions';
import type {SyncPluginTransactionMeta} from '../sync/types';

const PRESENCE_PLUGIN_KEY = new PluginKey<DecorationSet>('jsonjoy.com/json-crdt/presence');

export interface PresencePluginOpts<Meta extends object = object> {
  /** The shared presence store. */
  manager: PresenceManager<Meta>;
  /** Accessor for the Peritext CRDT. */
  peritext: PeritextRef;
  /** Custom caret DOM factory. When omitted, the default label-style cursor
   * from `presence-styles.ts` is used. */
  renderCursor?: CursorRenderer<Meta>;
  /** Custom inline decoration attrs factory for selection highlights. When
   * omitted, a semi-transparent background is used. */
  renderSelection?: SelectionRenderer;
  /** Extracts a {@link PresenceUser} (name, color) from the `meta` payload of a
   * `UserPresence` tuple. When omitted, user info is not shown on carets. */
  userFromMeta?: (meta: Meta) => view.PresenceUser | undefined;
  /** Milliseconds after which the name label is faded (default 3000). */
  fadeAfterMs?: number;
  /** Milliseconds of inactivity after which the caret is dimmed (default 30000). */
  dimAfterMs?: number;
  /** Milliseconds of inactivity after which the selection highlight is hidden
   * and the caret is dimmed (default 60000). */
  hideAfterMs?: number;
  /** Interval in milliseconds for running {@link PresenceManager.removeOutdated}.
   * Pass `0` to disable internal GC. Default: 5000. */
  gcIntervalMs?: number;
}

export type CursorRenderer<Meta extends object = object> = (
  peerId: string,
  user: view.PresenceUser | undefined,
  opts: PresencePluginOpts<Meta>,
) => HTMLElement;

export type SelectionRenderer = (peerId: string, user?: view.PresenceUser) => DecorationAttrs;

export const createPlugin = <Meta extends object = object>(opts: PresencePluginOpts<Meta>): Plugin<DecorationSet> => {
  const {manager, peritext, gcIntervalMs = 5_000} = opts;

  // Shared cursor DOM cache — lives for the lifetime of the plugin so that
  // CSS animations survive decoration rebuilds.
  const cursorManager = new CursorManager<Meta>();

  return new Plugin<DecorationSet>({
    key: PRESENCE_PLUGIN_KEY,
    state: {
      init(_, state) {
        return buildDecorations(state, opts, cursorManager);
      },
      apply(tr, prevDecorations, _oldState, newState) {
        const syncMeta = tr.getMeta(SYNC_PLUGIN_KEY) as SyncPluginTransactionMeta | undefined;
        if (syncMeta?.orig === TransactionOrigin.REMOTE) return buildDecorations(newState, opts, cursorManager);
        const presenceMeta = tr.getMeta(PRESENCE_PLUGIN_KEY);
        if (presenceMeta?.presenceUpdated) return buildDecorations(newState, opts, cursorManager);
        // Local edit — efficiently remap through the mapping.
        return prevDecorations.map(tr.mapping, tr.doc);
      },
    },
    props: {
      decorations(state) {
        return PRESENCE_PLUGIN_KEY.getState(state);
      },
    },
    view(view: EditorView) {
      const unsubscribe = manager.onChange.listen((_evt: PresenceEvent) => {
        const tr = view.state.tr;
        tr.setMeta(PRESENCE_PLUGIN_KEY, {presenceUpdated: true});
        view.dispatch(tr);
      });
      let gcTimer: unknown;
      if (gcIntervalMs > 0) gcTimer = setInterval(() => manager.removeOutdated(opts.fadeAfterMs), gcIntervalMs);
      return {
        update(view, prevState) {
          const docChanged = !prevState.doc.eq(view.state.doc);
          const selectionChanged = !prevState.selection.eq(view.state.selection);
          const doSendPresence = docChanged || selectionChanged;
          if (doSendPresence) {
            const dto = buildLocalPresenceDto(view, peritext);
            if (dto) manager.setSelections([dto]);
          }
        },
        destroy() {
          unsubscribe();
          clearInterval(gcTimer as any);
          cursorManager.destroy();
        },
      };
    },
  });
};

/**
 * Build a `DecorationSet` with widget (caret) and inline (selection highlight)
 * decorations for every remote peer tracked by the {@link PresenceManager}.
 */
const buildDecorations = <Meta extends object>(
  state: EditorState,
  opts: PresencePluginOpts<Meta>,
  cursorMgr: CursorManager<Meta>,
): DecorationSet => {
  const {
    manager,
    peritext: peritextRef,
    renderCursor = view.renderCursor,
    renderSelection = view.renderSelection,
    userFromMeta,
    hideAfterMs = 60_000,
  } = opts;
  const localProcessId = manager.getProcessId();
  const decorations: Decoration[] = [];
  const api = peritextRef();
  if (!api) return DecorationSet.create(state.doc, []);
  const txt: Peritext = api.txt;
  const rootBlock = txt.blocks.root;
  const doc = state.doc;
  const maxPos = Math.max(doc.content.size - 1, 0);
  const now = Date.now();
  const peers = manager.peers;
  const activePeerIds = new Set<string>();
  for (const processId in peers) {
    if (processId === localProcessId) continue;
    const entry: PeerEntry<Meta> = peers[processId];
    const presence: UserPresence<Meta> = entry[0];
    const receivedAt: number = entry[1];
    const age = now - receivedAt;
    const hide = age >= hideAfterMs;
    if (hide) continue;
    const selections: unknown[] = presence[UserPresenceIdx.Selections] as unknown[];
    if (!selections) continue;
    const meta = presence[UserPresenceIdx.Meta];
    const user: view.PresenceUser | undefined = userFromMeta ? userFromMeta(meta) : undefined;
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
        let anchor: number;
        let focus: number;
        try {
          anchor = clamp(pointToPmPos(rootBlock, anchorPoint, doc), 0, maxPos);
          focus = clamp(pointToPmPos(rootBlock, focusPoint, doc), 0, maxPos);
        } catch {
          continue;
        }
        activePeerIds.add(processId);
        const caretElement = cursorMgr.getOrCreate(processId, focus, user, opts, receivedAt, renderCursor);
        const caretDecoration = Decoration.widget(focus, () => caretElement, {key: `presence-${processId}`, side: 10});
        decorations.push(caretDecoration);
        if (anchor !== focus) {
          const from = Math.min(anchor, focus);
          const to = Math.max(anchor, focus);
          const attrs = renderSelection(processId, user);
          const rangeDecoration = Decoration.inline(from, to, attrs, {inclusiveEnd: true, inclusiveStart: false});
          decorations.push(rangeDecoration);
        }
      }
    }
  }
  // Remove cached DOM elements for peers that are no longer active.
  cursorMgr.prune(activePeerIds);
  return DecorationSet.create(state.doc, decorations);
};

const clamp = (v: number, min: number, max: number): number => (v < min ? min : v > max ? max : v);

const isRgaSelection = (sel: unknown): sel is RgaSelection => {
  if (!Array.isArray(sel) || sel.length < 8) return false;
  const type = sel[5];
  return type === JsonCrdtDataType.str || type === JsonCrdtDataType.bin || type === JsonCrdtDataType.arr;
};

/**
 * Build an `RgaSelection` DTO from the current ProseMirror selection, for
 * broadcasting via the presence transport. Returns `null` when the view is
 * blurred or the Peritext ref is unavailable.
 */
const buildLocalPresenceDto = (view: EditorView, peritextRef: PeritextRef): RgaSelection | null => {
  if (!view.hasFocus()) return null;
  const api = peritextRef();
  if (!api) return null;
  const txt: Peritext = api.txt;
  const selection = view.state.selection;
  const p1 = pmPosToPoint(txt, selection.$anchor);
  const p2 = pmPosToPoint(txt, selection.$head);
  const range = txt.rangeFromPoints(p1, p2);
  const startIsAnchor = selection.anchor <= selection.head;
  const stableSelection: StablePeritextSelection = [range, startIsAnchor];
  return peritextPresence.toDto(txt, [stableSelection]);
};
