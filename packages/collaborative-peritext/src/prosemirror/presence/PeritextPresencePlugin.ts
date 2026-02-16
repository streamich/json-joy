import {Plugin, PluginKey} from 'prosemirror-state';
import {Decoration, DecorationSet} from 'prosemirror-view';
import {JsonCrdtDataType} from 'json-joy/lib/json-crdt-patch/constants';
import {peritext as peritextPresence} from '@jsonjoy.com/collaborative-presence';
import {SYNC_PLUGIN_KEY, TransactionOrigin} from '../constants';
import {pmPosToPoint, pointToPmPos} from '../util';
import {UserPresenceIdx} from '@jsonjoy.com/collaborative-presence';
import {defaultCursorBuilder, defaultSelectionBuilder} from './styles';
import type {PresenceManager, PresenceEvent, PeerEntry} from '@jsonjoy.com/collaborative-presence/lib/PresenceManager';
import type {RgaSelection, UserPresence} from '@jsonjoy.com/collaborative-presence/lib/types';
import type {StablePeritextSelection} from '@jsonjoy.com/collaborative-presence/lib/peritext';
import type {PresenceUser} from './styles';
import type {PeritextRef} from '../../types';
import type {EditorView, DecorationAttrs} from 'prosemirror-view';
import type {EditorState} from 'prosemirror-state';
import type {Peritext} from 'json-joy/lib/json-crdt-extensions';

export const PRESENCE_KEY = new PluginKey<DecorationSet>('jsonjoy.com/presence');

/**
 * Options for the ProseMirror presence plugin.
 */
export interface PresencePluginOpts<Meta extends object = object> {
  /** The shared presence store. */
  manager: PresenceManager<Meta>;

  /** Accessor for the Peritext CRDT. */
  peritext: PeritextRef;

  /** The local peer's process ID — used to skip self when rendering. */
  localProcessId: string;

  /**
   * Custom caret DOM factory. When omitted, the default label-style cursor
   * from `presence-styles.ts` is used.
   */
  cursorBuilder?: (peerId: string, user?: PresenceUser) => HTMLElement;

  /**
   * Custom inline decoration attrs factory for selection highlights. When
   * omitted, a semi-transparent background is used.
   */
  selectionBuilder?: (peerId: string, user?: PresenceUser) => DecorationAttrs;

  /**
   * Extracts a {@link PresenceUser} (name, color) from the `meta` payload of a
   * `UserPresence` tuple. When omitted, user info is not shown on carets.
   */
  userFromMeta?: (meta: Meta) => PresenceUser | undefined;

  /** Milliseconds after which the name label is faded (default 3 000). */
  fadeAfterMs?: number;

  /**
   * Milliseconds of inactivity after which the selection highlight is hidden
   * and the caret is dimmed (default 60 000).
   */
  hideAfterMs?: number;

  /**
   * Interval in milliseconds for running {@link PresenceManager.removeOutdated}.
   * Pass `0` to disable internal GC. Default: 5 000.
   */
  gcIntervalMs?: number;
}

// ------------------------------------------------------------------- helpers

interface TransactionMeta {
  orig?: TransactionOrigin;
}

/**
 * Build a `DecorationSet` with widget (caret) and inline (selection highlight)
 * decorations for every remote peer tracked by the {@link PresenceManager}.
 */
const buildDecorations = <Meta extends object>(
  state: EditorState,
  opts: PresencePluginOpts<Meta>,
): DecorationSet => {
  const {manager, peritext: peritextRef, localProcessId, cursorBuilder, selectionBuilder, userFromMeta, fadeAfterMs = 3_000, hideAfterMs = 60_000} = opts;
  const decorations: Decoration[] = [];
  const api = peritextRef();
  if (!api) return DecorationSet.create(state.doc, []);
  const txt: Peritext = api.txt;
  const rootBlock = txt.blocks.root;
  const doc = state.doc;
  const maxPos = Math.max(doc.content.size - 1, 0);
  const now = Date.now();
  const peers = manager.peers;

  for (const processId in peers) {
    if (processId === localProcessId) continue;
    const entry: PeerEntry<Meta> = peers[processId];
    const presence: UserPresence<Meta> = entry[0];
    const receivedAt: number = entry[1];
    const age = now - receivedAt;
    const selections: unknown[] = presence[UserPresenceIdx.Selections] as unknown[];
    if (!selections) continue;
    const meta = presence[UserPresenceIdx.Meta];
    const user: PresenceUser | undefined = userFromMeta ? userFromMeta(meta) : undefined;
    const dimmed = age >= hideAfterMs;

    for (const sel of selections) {
      if (!isRgaSelection(sel)) continue;

      // Decode the RGA DTO into Peritext StablePeritextSelection[]
      let stableSelections: StablePeritextSelection[];
      try {
        stableSelections = peritextPresence.fromDto(txt, sel);
      } catch {
        continue;
      }
      if (!stableSelections.length) continue;

      for (const [range, startIsAnchor] of stableSelections) {
        const anchorPoint = startIsAnchor ? range.start : range.end;
        const headPoint = startIsAnchor ? range.end : range.start;

        let anchor: number;
        let head: number;
        try {
          anchor = clamp(pointToPmPos(rootBlock, anchorPoint, doc), 0, maxPos);
          head = clamp(pointToPmPos(rootBlock, headPoint, doc), 0, maxPos);
        } catch {
          continue;
        }

        // --- Caret widget at head position ---
        const caretEl = cursorBuilder
          ? cursorBuilder(processId, user)
          : defaultCursorBuilder(processId, user, fadeAfterMs);
        if (dimmed) caretEl.classList.add('prtxt-cursor--dimmed');
        decorations.push(
          Decoration.widget(head, () => caretEl, {key: `presence-${processId}`, side: 10}),
        );

        // --- Selection highlight (if non-collapsed and not hidden) ---
        if (anchor !== head && !dimmed) {
          const from = Math.min(anchor, head);
          const to = Math.max(anchor, head);
          const attrs = selectionBuilder
            ? selectionBuilder(processId, user)
            : defaultSelectionBuilder(processId, user);
          decorations.push(
            Decoration.inline(from, to, attrs, {
              inclusiveEnd: true,
              inclusiveStart: false,
            }),
          );
        }
      }
    }
  }

  return DecorationSet.create(state.doc, decorations);
};

const clamp = (v: number, min: number, max: number): number =>
  v < min ? min : v > max ? max : v;

/**
 * Minimal runtime check: an `RgaSelection` is an array of length 8 whose
 * `type` element (index 5) is one of the RGA data types.
 */
const isRgaSelection = (sel: unknown): sel is RgaSelection => {
  if (!Array.isArray(sel) || sel.length < 8) return false;
  const type = sel[5];
  return type === JsonCrdtDataType.str || type === JsonCrdtDataType.bin || type === JsonCrdtDataType.arr;
};

// -------------------------------------------------------------- Plugin factory

/**
 * Creates a ProseMirror plugin that renders remote peers' caret and selection
 * decorations via `PresenceManager`.
 *
 * The plugin is **read-only** with respect to presence — it consumes remote
 * state and renders decorations. The app is responsible for publishing the
 * local user's selection via {@link buildLocalPresenceDto} and feeding it into
 * the transport layer.
 */
export const createPresencePlugin = <Meta extends object = object>(
  opts: PresencePluginOpts<Meta>,
): Plugin<DecorationSet> => {
  const {manager, gcIntervalMs = 5_000} = opts;

  return new Plugin<DecorationSet>({
    key: PRESENCE_KEY,

    state: {
      init(_, state) {
        return buildDecorations(state, opts);
      },

      apply(tr, prevDecos, _oldState, newState) {
        // Full rebuild on remote doc changes.
        const syncMeta = tr.getMeta(SYNC_PLUGIN_KEY) as TransactionMeta | undefined;
        if (syncMeta?.orig === TransactionOrigin.REMOTE) {
          return buildDecorations(newState, opts);
        }

        // Full rebuild on presence changes.
        const presenceMeta = tr.getMeta(PRESENCE_KEY);
        if (presenceMeta?.presenceUpdated) {
          return buildDecorations(newState, opts);
        }

        // Local edit — efficiently remap through the mapping.
        return prevDecos.map(tr.mapping, tr.doc);
      },
    },

    props: {
      decorations(state) {
        return PRESENCE_KEY.getState(state);
      },
    },

    view(view: EditorView) {
      // Subscribe to PresenceManager changes and dispatch a PM transaction.
      const unsub = manager.onChange.listen((_evt: PresenceEvent) => {
        setTimeout(() => {
          if ((view as any).isDestroyed ?? false) return;
          try {
            const tr = view.state.tr;
            tr.setMeta(PRESENCE_KEY, {presenceUpdated: true});
            view.dispatch(tr);
          } catch {
            // View may have been destroyed between setTimeout and dispatch.
          }
        }, 0);
      });

      // Optional internal GC interval.
      let gcTimer: ReturnType<typeof setInterval> | undefined;
      if (gcIntervalMs > 0) {
        gcTimer = setInterval(() => manager.removeOutdated(), gcIntervalMs);
      }

      return {
        update() {
          // Nothing — local selection publishing is the app's responsibility.
        },
        destroy() {
          unsub();
          if (gcTimer !== undefined) clearInterval(gcTimer);
        },
      };
    },
  });
};

// ------------------------------------------------ Local selection DTO helper

/**
 * Build an `RgaSelection` DTO from the current ProseMirror selection, suitable
 * for broadcasting via the presence transport.
 *
 * Returns `null` when the view is blurred or the Peritext ref is unavailable.
 */
export const buildLocalPresenceDto = (
  view: EditorView,
  peritextRef: PeritextRef,
): RgaSelection | null => {
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
