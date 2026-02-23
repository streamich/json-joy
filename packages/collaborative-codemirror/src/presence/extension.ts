import {ViewPlugin, Decoration, DecorationSet} from '@codemirror/view';
import {Annotation, RangeSetBuilder} from '@codemirror/state';
import {str as strPresence} from '@jsonjoy.com/collaborative-presence';
import {UserPresenceIdx} from '@jsonjoy.com/collaborative-presence';
import {JsonCrdtDataType} from 'json-joy/lib/json-crdt-patch/constants';
import * as view from './view';
import {CursorManager, CursorWidget} from './view';
import type {CursorRenderOpts} from './view';
import type {PresenceManager, PresenceEvent, PeerEntry} from '@jsonjoy.com/collaborative-presence/lib/PresenceManager';
import type {UserPresence, RgaSelection} from '@jsonjoy.com/collaborative-presence/lib/types';
import type {StrSelectionStrict} from '@jsonjoy.com/collaborative-presence/lib/str';
import type {Model, StrApi} from 'json-joy/lib/json-crdt';
import type {EditorView, ViewUpdate} from '@codemirror/view';
import type {Extension} from '@codemirror/state';

/** Accessor for the JSON CRDT `str` node — mirrors the `PeritextRef` pattern
 * used in the ProseMirror presence plugin. Return `null` / `undefined` when
 * the node is not yet available (e.g. loading state). */
export type StrRef = () => StrApi | null | undefined;

export interface PresenceExtensionOpts<Meta extends object = object> extends CursorRenderOpts {
  /** The shared presence store. */
  manager: PresenceManager<Meta>;
  /** Accessor for the JSON CRDT `str` node. */
  str: StrRef;
  /** Custom caret DOM factory. When omitted, the default label-style cursor
   * from `view.ts` is used. */
  renderCursor?: view.CursorRenderer;
  /** Custom inline decoration attrs factory for selection highlights. When
   * omitted, a semi-transparent background is used. */
  renderSelection?: view.SelectionRenderer;
  /** Extracts a {@link PresenceUser} (name, color) from the `meta` payload of a
   * `UserPresence` tuple. When omitted, user info is not shown on carets. */
  userFromMeta?: (meta: Meta) => view.PresenceUser | undefined;
  /** Interval in milliseconds for running {@link PresenceManager.removeOutdated}.
   * Pass `0` to disable internal GC. Default: 5000. */
  gcIntervalMs?: number;
}

/** Marks a transaction as a presence-triggered rebuild so the view plugin can
 * distinguish it from a local doc/selection change. */
const presenceAnnotation = Annotation.define<true>();

/**
 * Creates a CodeMirror 6 {@link Extension} that renders remote peer cursors
 * and selections using a {@link PresenceManager} backed by a JSON CRDT `str` node.
 *
 * @example
 * ```ts
 * const editor = new EditorView({
 *   extensions: [
 *     ...otherExtensions,
 *     createExtension({ manager, str: () => model.api.str('/path/to/string/node') }),
 *   ],
 *   parent: container,
 * });
 * ```
 */
export const presenceExtension = <Meta extends object = object>(opts: PresenceExtensionOpts<Meta>): Extension => {
  const {manager, gcIntervalMs = 5_000} = opts;

  // Shared cursor DOM cache — lives for the lifetime of the plugin so that
  // CSS animations survive decoration rebuilds.
  const cursorManager = new CursorManager();

  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet = Decoration.none;
      private readonly unsubscribe: () => void;
      private gcTimer: ReturnType<typeof setInterval> | undefined;

      constructor(editorView: EditorView) {
        this.decorations = buildDecorations(editorView, opts, cursorManager);
        this.unsubscribe = manager.onChange.listen((_evt: PresenceEvent) => {
          editorView.dispatch({annotations: [presenceAnnotation.of(true)]});
        });
        if (gcIntervalMs > 0)
          this.gcTimer = setInterval(() => manager.removeOutdated(opts.hideAfterMs), gcIntervalMs);
        sendLocalPresence(editorView, opts.str, manager);
      }

      update(update: ViewUpdate): void {
        const isPresenceUpdate = update.transactions.some((tr) => tr.annotation(presenceAnnotation));
        if (isPresenceUpdate) {
          this.decorations = buildDecorations(update.view, opts, cursorManager);
        } else if (update.docChanged) {
          // Local or remote document edit — remap existing decorations so that
          // CSS animations are not interrupted, then rebuild if remote changes
          // require it (will be triggered separately via onChange > dispatch).
          this.decorations = this.decorations.map(update.changes);
        }
        if (update.selectionSet || update.docChanged)
          sendLocalPresence(update.view, opts.str, manager);
      }

      destroy(): void {
        this.unsubscribe();
        clearInterval(this.gcTimer);
        cursorManager.destroy();
      }
    },
    {decorations: (v) => v.decorations},
  );
};

/**
 * Build a `DecorationSet` with widget (caret) and mark (selection highlight)
 * decorations for every remote peer tracked by the {@link PresenceManager}.
 */
const buildDecorations = <Meta extends object>(
  editorView: EditorView,
  opts: PresenceExtensionOpts<Meta>,
  cursorMgr: CursorManager,
): DecorationSet => {
  const {
    manager,
    str: strRef,
    renderCursor: renderCursorFn = view.renderCursor,
    renderSelection: renderSelectionFn = view.renderSelection,
    userFromMeta,
    hideAfterMs = 60_000,
  } = opts;
  const strApi = strRef();
  if (!strApi) return Decoration.none;
  const model = strApi.api.model as Model<any>;
  const localProcessId = manager.getProcessId();
  const docLength = editorView.state.doc.length;
  const now = Date.now();
  const peers = manager.peers;

  // Collect all decoration positions so we can sort them (RangeSetBuilder
  // requires ranges in document order).
  type PendingMark = {from: number; to: number; attrs: {style: string}};
  type PendingWidget = {pos: number; widget: CursorWidget};
  const pendingMarks: PendingMark[] = [];
  const pendingWidgets: PendingWidget[] = [];
  const activePeerIds = new Set<string>();
  for (const processId in peers) {
    if (processId === localProcessId) continue;
    const entry: PeerEntry<Meta> = peers[processId];
    const presence: UserPresence<Meta> = entry[0];
    const receivedAt: number = entry[1];
    const age = now - receivedAt;
    if (age >= hideAfterMs) continue;
    const selections: unknown[] = presence[UserPresenceIdx.Selections] as unknown[];
    if (!selections) continue;
    const meta = presence[UserPresenceIdx.Meta];
    const user: view.PresenceUser | undefined = userFromMeta ? userFromMeta(meta) : undefined;
    for (const sel of selections) {
      if (!isRgaSelection(sel)) continue;
      let strSelections: StrSelectionStrict[];
      try {
        strSelections = strPresence.fromDto(model, sel);
      } catch {
        continue;
      }
      if (!strSelections.length) continue;

      for (const strSelection of strSelections) {
        const [anchor, focus = anchor] = strSelection;
        const caretPos = clamp(focus, 0, docLength);
        const anchorPos = clamp(anchor, 0, docLength);

        activePeerIds.add(processId);

        // Determine label placement from document position (computed once on
        // render; no reactivity needed).  Assume a minimum line width of 40
        // characters so short lines don't flip unexpectedly.
        const line = editorView.state.doc.lineAt(caretPos);
        const isFirstLine = line.number === 1;
        const lineLen = Math.max(line.length, 40);
        const colPos = caretPos - line.from;
        const side: view.LabelSide = colPos < lineLen / 2 ? 'left' : 'right';

        const el = cursorMgr.getOrCreate(processId, caretPos, isFirstLine, side, user, opts, receivedAt, renderCursorFn);
        pendingWidgets.push({pos: caretPos, widget: new CursorWidget(el)});

        if (anchorPos !== caretPos) {
          const from = Math.min(anchorPos, caretPos);
          const to = Math.max(anchorPos, caretPos);
          const attrs = renderSelectionFn(processId, user);
          pendingMarks.push({from, to, attrs});
        }
      }
    }
  }

  // Remove cached DOM elements for peers that are no longer active.
  cursorMgr.prune(activePeerIds);

  if (pendingMarks.length === 0 && pendingWidgets.length === 0) return Decoration.none;

  // Build the RangeSet. RangeSetBuilder requires ranges in ascending order of
  // `from`, and marks before widgets at the same position.
  const builder = new RangeSetBuilder<Decoration>();
  pendingMarks.sort((a, b) => a.from - b.from || a.to - b.to);
  pendingWidgets.sort((a, b) => a.pos - b.pos);

  // Merge marks and widgets in order.
  // IMPORTANT: when mark.from === widget.pos the widget must be added first.
  // RangeSetBuilder tracks `lastTo` of the previously added range.  If the
  // mark is added first its `to` advances `lastTo` beyond the widget's `pos`,
  // causing a "Ranges must be added sorted by `from` position" error when the
  // widget is then added at that same (earlier) position.  By adding the
  // zero-width widget first we keep `lastTo` at the shared position, allowing
  // the mark (which starts at the same point but ends later) to follow legally.
  let mi = 0;
  let wi = 0;
  while (mi < pendingMarks.length || wi < pendingWidgets.length) {
    const mark = pendingMarks[mi];
    const widget = pendingWidgets[wi];
    const markFirst = !widget || (mark && mark.from < widget.pos);
    if (markFirst) {
      builder.add(mark.from, mark.to, Decoration.mark({attributes: mark.attrs, inclusive: false}));
      mi++;
    } else {
      builder.add(widget.pos, widget.pos, Decoration.widget({widget: widget.widget, side: 1}));
      wi++;
    }
  }

  return builder.finish();
};

/**
 * Convert the current ProseMirror-style selection in the CodeMirror view to
 * an `RgaSelection` DTO and publish it via the {@link PresenceManager}.
 */
const sendLocalPresence = (editorView: EditorView, strRef: StrRef, manager: PresenceManager<any>): void => {
  if (!editorView.hasFocus) return;
  const strApi = strRef();
  if (!strApi) return;
  const sel = editorView.state.selection.main;
  const anchor = sel.anchor;
  const head = sel.head;
  const dto = strPresence.toDto(strApi, [[anchor, head]]);
  manager.setSelections([dto]);
};

const clamp = (v: number, min: number, max: number): number => (v < min ? min : v > max ? max : v);

const isRgaSelection = (sel: unknown): sel is RgaSelection => {
  if (!Array.isArray(sel) || sel.length < 8) return false;
  return sel[5] === JsonCrdtDataType.str || sel[5] === JsonCrdtDataType.bin || sel[5] === JsonCrdtDataType.arr;
};
