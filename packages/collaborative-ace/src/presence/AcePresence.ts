import {str as strPresence} from '@jsonjoy.com/collaborative-presence';
import {UserPresenceIdx} from '@jsonjoy.com/collaborative-presence';
import {JsonCrdtDataType} from 'json-joy/lib/json-crdt-patch/constants';
import {CursorManager, selectionColor} from './view';
import * as view from './view';
import type {CursorRenderOpts} from './view';
import type {PresenceManager, PresenceEvent, PeerEntry} from '@jsonjoy.com/collaborative-presence/lib/PresenceManager';
import type {UserPresence, RgaSelection} from '@jsonjoy.com/collaborative-presence/lib/types';
import type {StrSelectionStrict} from '@jsonjoy.com/collaborative-presence/lib/str';
import type {Model, StrApi} from 'json-joy/lib/json-crdt';
import type {Ace} from 'ace-builds';

/** Accessor for the JSON CRDT `str` node. */
export type StrRef = () => StrApi | null | undefined;

export interface AcePresenceOpts<Meta extends object = object> extends CursorRenderOpts {
  /** The shared presence store. */
  manager: PresenceManager<Meta>;
  /** Accessor for the JSON CRDT `str` node. */
  str: StrRef;
  /** Custom caret DOM factory. */
  renderCursor?: view.CursorRenderer;
  /** Extracts a {@link PresenceUser} (name, color) from the `meta` payload. */
  userFromMeta?: (meta: Meta) => view.PresenceUser | undefined;
  /**
   * Interval in milliseconds for running {@link PresenceManager.removeOutdated}.
   * Pass `0` to disable internal GC. Default: 5000.
   */
  gcIntervalMs?: number;
}

/**
 * Renders remote peer carets and selection highlights inside an Ace Editor
 * instance.
 *
 * **Carets** — absolutely positioned `<div>` elements placed inside the Ace
 * scroller container.  Positioned via `session.documentToScreenPosition()` +
 * `renderer.lineHeight` / `renderer.characterWidth`.
 *
 * **Selections** — Ace `session.addMarker()` with per-peer CSS class that
 * sets a semi-transparent background.
 */
export class AcePresence<Meta extends object = object> {
  private readonly cursorManager: CursorManager;
  private readonly unsubscribe: () => void;
  private gcTimer: ReturnType<typeof setInterval> | undefined;
  private selectionMarkerIds: number[] = [];
  /** Container for cursor overlays — the Ace `.ace_content` layer. */
  private cursorLayer: HTMLElement | null = null;
  private disposed = false;

  constructor(
    private readonly editor: Ace.Editor,
    private readonly opts: AcePresenceOpts<Meta>,
  ) {
    this.cursorManager = new CursorManager();

    // Cursor overlay parent — the scroller has overflow:hidden so cursors
    // that scroll out of view are clipped automatically. Positions are
    // computed viewport-relative via textToScreenCoordinates each render,
    // so we never need to track document scroll offsets manually.
    this.cursorLayer = editor.renderer.scroller;

    this.unsubscribe = opts.manager.onChange.listen((_evt: PresenceEvent) => {
      this.rebuild();
    });

    const gcIntervalMs = opts.gcIntervalMs ?? 5_000;
    if (gcIntervalMs > 0)
      this.gcTimer = setInterval(() => opts.manager.removeOutdated(opts.hideAfterMs), gcIntervalMs);

    // Re-render cursors when the editor scrolls or resizes so pixel positions
    // stay correct. `afterRender` fires after every paint cycle.
    editor.renderer.on('afterRender', this.onAfterRender);

    // Re-resolve CRDT coordinates on every local document change so that
    // remote selections track insertions/deletions correctly.
    editor.on('change', this.rebuild);

    // Broadcast the local caret/selection whenever it changes.
    editor.selection.on('changeCursor', this.sendLocal);
    editor.selection.on('changeSelection', this.sendLocal);
    editor.on('focus', this.sendLocal);

    // Initial render + broadcast.
    this.rebuild();
    this.sendLocal();
  }

  /**
   * Re-read all remote peers from the presence manager and update DOM carets
   * + selection markers.
   */
  private rebuild = (): void => {
    if (this.disposed) return;
    const {
      manager,
      str: strRef,
      renderCursor: renderCursorFn = view.renderCursor,
      userFromMeta,
      hideAfterMs = 60_000,
    } = this.opts;
    const strApi = strRef();
    if (!strApi) return;
    const model = strApi.api.model as Model<any>;
    const session = this.editor.session;
    const doc = session.doc;
    const localProcessId = manager.getProcessId();
    const docLength = doc.positionToIndex(doc.indexToPosition(Infinity, 0), 0);
    const now = Date.now();
    const peers = manager.peers;
    for (const mid of this.selectionMarkerIds) session.removeMarker(mid);
    this.selectionMarkerIds = [];
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
          const caretPoint = doc.indexToPosition(caretPos, 0);
          const isFirstLine = caretPoint.row === 0;
          const lineLen = Math.max((doc.getLine(caretPoint.row) || '').length, 40);
          const side: view.LabelSide = caretPoint.column < lineLen / 2 ? 'left' : 'right';
          const el = this.cursorManager.getOrCreate(
            processId,
            caretPos,
            isFirstLine,
            side,
            user,
            this.opts,
            receivedAt,
            renderCursorFn,
          );

          // Position the cursor element.
          this.positionCursorEl(el, caretPoint);

          // Append to the overlay layer if not yet in the DOM.
          if (!el.parentNode && this.cursorLayer) this.cursorLayer.appendChild(el);

          // Selection highlighting
          if (anchorPos !== caretPos) {
            const from = Math.min(anchorPos, caretPos);
            const to = Math.max(anchorPos, caretPos);
            const fromPoint = doc.indexToPosition(from, 0);
            const toPoint = doc.indexToPosition(to, 0);
            const RangeConstructor = this.getRangeConstructor();
            if (RangeConstructor) {
              const range = new RangeConstructor(fromPoint.row, fromPoint.column, toPoint.row, toPoint.column);
              const color = selectionColor(processId, user);
              // Inject a per-peer style rule for the selection marker.
              const className = this.getSelectionClassName(processId, color);
              const markerId = session.addMarker(range, className, 'text', false);
              this.selectionMarkerIds.push(markerId);
            }
          }
        }
      }
    }

    // Remove stale cursor elements.
    this.cursorManager.prune(activePeerIds);
  };

  /** Set pixel position on a cursor `<div>` based on a document Point. */
  private positionCursorEl(el: HTMLElement, point: Ace.Point): void {
    const renderer = this.editor.renderer;
    const lineHeight = renderer.lineHeight || 14;
    const pageCoords = renderer.textToScreenCoordinates(point.row, point.column);
    const scrollerRect = renderer.scroller.getBoundingClientRect();
    const top = pageCoords.pageY - scrollerRect.top;
    const left = pageCoords.pageX - scrollerRect.left;
    el.style.top = top + 'px';
    el.style.left = left + 'px';
    el.style.height = lineHeight + 'px';
    el.style.width = '2px';
  }

  private selectionStyles = new Map<string, string>();

  /**
   * Returns a CSS class name that paints the selection background for a peer.
   * A `<style>` tag is lazily injected into `<head>` per peer color.
   */
  private getSelectionClassName(processId: string, color: string): string {
    let className = this.selectionStyles.get(processId);
    if (className) return className;
    className = `ace-presence-sel-${processId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    const style = document.createElement('style');
    style.textContent = `.${className} { position: absolute; background-color: ${color}; z-index: 3; }`;
    document.head.appendChild(style);
    this.selectionStyles.set(processId, className);
    return className;
  }

  /** Re-position all caret elements when Ace re-renders (scroll, resize). */
  private onAfterRender = (): void => {
    if (this.disposed) return;
    const strApi = this.opts.str();
    if (!strApi) return;
    const doc = this.editor.session.doc;
    const cache = (this.cursorManager as any).cache as Map<string, {el: HTMLElement; pos: number}>;
    for (const entry of cache.values()) {
      const point = doc.indexToPosition(entry.pos, 0);
      this.positionCursorEl(entry.el, point);
    }
  };

  private _RangeConstructor: (new (
    startRow: number,
    startColumn: number,
    endRow: number,
    endColumn: number,
  ) => Ace.Range) | null | undefined = undefined;

  /** Lazily resolve the Ace `Range` constructor from the session. */
  private getRangeConstructor() {
    if (this._RangeConstructor !== undefined) return this._RangeConstructor;
    try {
      const sel = this.editor.session.selection.getRange();
      this._RangeConstructor = sel.constructor as any;
    } catch {
      this._RangeConstructor = null;
    }
    return this._RangeConstructor;
  }

  private sendLocal = (): void => {
    if (this.disposed) return;
    const strApi = this.opts.str();
    if (!strApi) return;
    if (!this.editor.isFocused()) return;
    const sel = this.editor.getSelectionRange();
    const doc = this.editor.session.doc;
    const anchor = doc.positionToIndex(sel.start, 0);
    const head = doc.positionToIndex(sel.end, 0);
    // Determine actual anchor/focus direction from the `selection` object.
    const selection = this.editor.selection;
    const cursorPos = doc.positionToIndex(selection.getCursor(), 0);
    const isReversed = cursorPos === anchor;
    const anchorOffset = isReversed ? head : anchor;
    const focusOffset = isReversed ? anchor : head;
    const dto = strPresence.toDto(strApi, [[anchorOffset, focusOffset]]);
    this.opts.manager.setSelections([dto]);
  };

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.unsubscribe();
    clearInterval(this.gcTimer);
    this.editor.renderer.off('afterRender', this.onAfterRender);
    this.editor.off('change', this.rebuild);
    this.editor.off('focus', this.sendLocal);
    this.editor.selection.off('changeCursor', this.sendLocal);
    this.editor.selection.off('changeSelection', this.sendLocal);
    // Remove selection markers.
    const session = this.editor.session;
    for (const mid of this.selectionMarkerIds) session.removeMarker(mid);
    this.selectionMarkerIds = [];
    // Remove caret DOM elements.
    this.cursorManager.destroy();
  }
}

const clamp = (v: number, min: number, max: number): number => (v < min ? min : v > max ? max : v);

const isRgaSelection = (sel: unknown): sel is RgaSelection => {
  if (!Array.isArray(sel) || sel.length < 8) return false;
  return sel[5] === JsonCrdtDataType.str || sel[5] === JsonCrdtDataType.bin || sel[5] === JsonCrdtDataType.arr;
};
