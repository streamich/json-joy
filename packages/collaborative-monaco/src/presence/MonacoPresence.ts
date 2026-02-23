import {str as strPresence} from '@jsonjoy.com/collaborative-presence';
import {UserPresenceIdx} from '@jsonjoy.com/collaborative-presence';
import {JsonCrdtDataType} from 'json-joy/lib/json-crdt-patch/constants';
import {CursorManager, renderCursor as defaultRenderCursor, renderSelection as defaultRenderSelection} from './view';
import type {CursorRenderer, CursorRenderOpts, LabelSide, PresenceUser, SelectionRenderer} from './view';
import type {PresenceManager, PresenceEvent, PeerEntry} from '@jsonjoy.com/collaborative-presence/lib/PresenceManager';
import type {UserPresence, RgaSelection} from '@jsonjoy.com/collaborative-presence/lib/types';
import type {StrSelectionStrict} from '@jsonjoy.com/collaborative-presence/lib/str';
import type {Model, StrApi} from 'json-joy/lib/json-crdt';
import * as monaco from 'monaco-editor';

/** Accessor for the JSON CRDT `str` node — return `null` / `undefined` when
 * the node is not yet available (e.g. loading state). */
export type StrRef = () => StrApi | null | undefined;

export interface MonacoPresenceOpts<Meta extends object = object> extends CursorRenderOpts {
  /** The Monaco editor instance. */
  editor: monaco.editor.IStandaloneCodeEditor;
  /** The shared presence store. */
  manager: PresenceManager<Meta>;
  /** Accessor for the JSON CRDT `str` node. */
  str: StrRef;
  /** Custom caret DOM factory. When omitted, the default label-style cursor
   * from `view.ts` is used. */
  renderCursor?: CursorRenderer;
  /** Custom selection class name factory. When omitted, a semi-transparent
   * background is used via dynamically injected `<style>`. */
  renderSelection?: SelectionRenderer;
  /** Extracts a {@link PresenceUser} (name, color) from the `meta` payload of a
   * `UserPresence` tuple. When omitted, user info is not shown on carets. */
  userFromMeta?: (meta: Meta) => PresenceUser | undefined;
  /** Interval in milliseconds for running {@link PresenceManager.removeOutdated}.
   * Pass `0` to disable internal GC. Default: 5000. */
  gcIntervalMs?: number;
}

/**
 * A Monaco Content Widget wrapper for a remote peer's cursor.
 *
 * Uses Monaco's `IContentWidget` API to position the cursor DOM node at the
 * correct editor position. The backing `HTMLElement` is managed by
 * {@link CursorManager} so CSS animations survive position updates.
 */
class CursorContentWidget {
  private static _counter = 0;
  public readonly id: string;
  public position: monaco.editor.IContentWidgetPosition | null;

  constructor(
    public readonly processId: string,
    public readonly domNode: HTMLElement,
    private readonly editor: monaco.editor.IStandaloneCodeEditor,
    offset: number,
  ) {
    this.id = `json-joy-presence-cursor-${CursorContentWidget._counter++}`;
    this.position = this.makePosition(offset);
  }

  getId(): string {
    return this.id;
  }

  getDomNode(): HTMLElement {
    return this.domNode;
  }

  getPosition(): monaco.editor.IContentWidgetPosition | null {
    return this.position;
  }

  setOffset(offset: number): void {
    this.position = this.makePosition(offset);
  }

  private makePosition(offset: number): monaco.editor.IContentWidgetPosition {
    const model = this.editor.getModel()!;
    const pos = model.getPositionAt(offset);
    return {
      position: pos,
      preference: [monaco.editor.ContentWidgetPositionPreference.EXACT],
    };
  }
}

/**
 * Connects a Monaco editor's cursor/selection rendering to a
 * {@link PresenceManager} using Content Widgets (carets) and
 * `deltaDecorations` (selection highlights).
 *
 * @example
 * ```ts
 * const presence = new MonacoPresence({
 *   editor,
 *   manager,
 *   str: () => model.s.$,
 *   userFromMeta: (m) => m,
 * });
 * // ...
 * presence.destroy();
 * ```
 */
export class MonacoPresence<Meta extends object = object> {
  private readonly opts: MonacoPresenceOpts<Meta>;
  private readonly cursorManager = new CursorManager();
  /** Content widgets keyed by processId. */
  private readonly widgets = new Map<string, CursorContentWidget>();
  /** Tracked selection decoration IDs (returned by `deltaDecorations`). */
  private decorationIds: string[] = [];
  private readonly disposables: monaco.IDisposable[] = [];
  private gcTimer: ReturnType<typeof setInterval> | undefined;
  private readonly unsub: () => void;
  private destroyed = false;

  constructor(opts: MonacoPresenceOpts<Meta>) {
    this.opts = opts;
    const {editor, manager, gcIntervalMs = 5_000} = opts;
    this.unsub = manager.onChange.listen((_evt: PresenceEvent) => {
      if (!this.destroyed) this.updateRemote();
    });
    this.disposables.push(editor.onDidChangeCursorSelection(() => this.sendLocal()));
    this.disposables.push(editor.onDidChangeModelContent(() => this.updateRemote()));
    if (gcIntervalMs > 0)
      this.gcTimer = setInterval(() => manager.removeOutdated(opts.hideAfterMs), gcIntervalMs);

    // Initial render.
    this.updateRemote();
  }

  /** Destroy all subscriptions, widgets, and decorations. */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.unsub();
    for (const d of this.disposables) d.dispose();
    clearInterval(this.gcTimer);
    const editor = this.opts.editor;
    for (const w of this.widgets.values()) editor.removeContentWidget(w);
    this.widgets.clear();
    this.opts.editor.deltaDecorations(this.decorationIds, []);
    this.decorationIds = [];
    this.cursorManager.destroy();
  }

  /** Rebuild remote cursor widgets and selection decorations. */
  private updateRemote(): void {
    const {
      editor,
      manager,
      str: strRef,
      renderCursor: renderCursorFn = defaultRenderCursor,
      renderSelection: renderSelectionFn = defaultRenderSelection,
      userFromMeta,
      hideAfterMs = 60_000,
    } = this.opts;
    const strApi = strRef();
    if (!strApi) return;
    const model = strApi.api.model as Model<any>;
    const editorModel = editor.getModel();
    if (!editorModel) return;
    const localProcessId = manager.getProcessId();
    const docLength = editorModel.getValueLength();
    const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight);
    const now = Date.now();
    const peers = manager.peers;

    const activePeerIds = new Set<string>();
    const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];

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
      const user: PresenceUser | undefined = userFromMeta ? userFromMeta(meta) : undefined;
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
          const caretPosition = editorModel.getPositionAt(caretPos);
          const isFirstLine = caretPosition.lineNumber === 1;
          const lineContent = editorModel.getLineContent(caretPosition.lineNumber);
          const lineLen = Math.max(lineContent.length, 40);
          const colPos = caretPosition.column - 1;
          const side: LabelSide = colPos < lineLen / 2 ? 'left' : 'right';

          const cursorEl = this.cursorManager.getOrCreate(
            processId,
            caretPos,
            lineHeight,
            isFirstLine,
            side,
            user,
            this.opts,
            receivedAt,
            renderCursorFn,
          );

          const existing = this.widgets.get(processId);
          if (existing) {
            existing.setOffset(caretPos);
            existing.domNode === cursorEl
              ? editor.layoutContentWidget(existing)
              : this.replaceWidget(processId, cursorEl, caretPos);
          } else {
            const widget = new CursorContentWidget(processId, cursorEl, editor, caretPos);
            this.widgets.set(processId, widget);
            editor.addContentWidget(widget);
          }
          if (anchorPos !== caretPos) {
            const from = Math.min(anchorPos, caretPos);
            const to = Math.max(anchorPos, caretPos);
            const cls = renderSelectionFn(processId, user);
            const startPos = editorModel.getPositionAt(from);
            const endPos = editorModel.getPositionAt(to);
            newDecorations.push({
              range: {
                startLineNumber: startPos.lineNumber,
                startColumn: startPos.column,
                endLineNumber: endPos.lineNumber,
                endColumn: endPos.column,
              },
              options: {
                className: cls,
                stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
              },
            });
          }
        }
      }
    }

    // Prune widgets for peers that are no longer visible.
    for (const [pid, w] of this.widgets) {
      if (!activePeerIds.has(pid)) {
        editor.removeContentWidget(w);
        this.widgets.delete(pid);
      }
    }
    this.cursorManager.prune(activePeerIds);

    // Apply delta decorations (selections).
    this.decorationIds = editor.deltaDecorations(this.decorationIds, newDecorations);
  }

  /** Replace a content widget (when the backing DOM node changed). */
  private replaceWidget(processId: string, domNode: HTMLElement, offset: number): void {
    const editor = this.opts.editor;
    const old = this.widgets.get(processId);
    if (old) editor.removeContentWidget(old);
    const w = new CursorContentWidget(processId, domNode, editor, offset);
    this.widgets.set(processId, w);
    editor.addContentWidget(w);
  }

  /** Broadcast the local selection to the presence manager. */
  private sendLocal(): void {
    const {editor, manager, str: strRef} = this.opts;
    if (!editor.hasTextFocus()) return;
    const strApi = strRef();
    if (!strApi) return;
    const selection = editor.getSelection();
    if (!selection) return;
    const editorModel = editor.getModel();
    if (!editorModel) return;
    const anchor = editorModel.getOffsetAt(selection.getSelectionStart());
    const head = editorModel.getOffsetAt(selection.getPosition());
    const dto = strPresence.toDto(strApi, [[anchor, head]]);
    manager.setSelections([dto]);
  }
}

const clamp = (v: number, min: number, max: number): number => (v < min ? min : v > max ? max : v);

const isRgaSelection = (sel: unknown): sel is RgaSelection => {
  if (!Array.isArray(sel) || sel.length < 8) return false;
  return sel[5] === JsonCrdtDataType.str || sel[5] === JsonCrdtDataType.bin || sel[5] === JsonCrdtDataType.arr;
};
