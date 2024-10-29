import {printTs, tick} from '../../../json-crdt-patch';
import {Point} from '../rga/Point';
import {CursorAnchor} from '../slice/constants';
import {PersistedSlice} from '../slice/PersistedSlice';

export class Cursor<T = string> extends PersistedSlice<T> {
  public get anchorSide(): CursorAnchor {
    return this.type as CursorAnchor;
  }

  public isStartFocused(): boolean {
    return this.type === CursorAnchor.End || this.start.cmp(this.end) === 0;
  }

  public isEndFocused(): boolean {
    return this.type === CursorAnchor.Start || this.start.cmp(this.end) === 0;
  }

  // ---------------------------------------------------------------- mutations

  public set anchorSide(value: CursorAnchor) {
    this.update({type: value});
  }

  public anchor(): Point<T> {
    return this.anchorSide === CursorAnchor.Start ? this.start : this.end;
  }

  public focus(): Point<T> {
    return this.anchorSide === CursorAnchor.Start ? this.end : this.start;
  }

  public set(start: Point<T>, end: Point<T> = start, anchorSide: CursorAnchor = this.anchorSide): void {
    let hasChange = false;
    if (start.cmp(this.start)) hasChange = true;
    if (!hasChange && end.cmp(this.end)) hasChange = true;
    if (!hasChange && anchorSide !== this.anchorSide) hasChange = true;
    if (!hasChange) return;
    this.start = start;
    this.end = end === start ? end.clone() : end;
    this.update({
      range: this,
      type: anchorSide,
    });
  }

  /**
   * Move one of the edges of the cursor to a new point.
   *
   * @param point Point to set the edge to.
   * @param endpoint 0 for "focus", 1 for "anchor".
   */
  public setEndpoint(point: Point<T>, endpoint: 0 | 1 = 0): void {
    if (this.start === this.end) this.end = this.end.clone();
    let anchor = this.anchor();
    let focus = this.focus();
    if (endpoint === 0) focus = point;
    else anchor = point;
    if (focus.cmpSpatial(anchor) < 0) this.set(focus, anchor, CursorAnchor.End);
    else this.set(anchor, focus, CursorAnchor.Start);
  }

  public move(move: number): void {
    const {start, end} = this;
    start.step(move);
    if (start !== end) end.step(move);
    this.set(start, end);
  }

  /**
   * Ensures there is no range selection. If user has selected a range,
   * the contents is removed and the cursor is set at the start of the range as cursor.
   *
   * @todo If block boundaries are withing the range, remove the blocks.
   * @todo Stress test this method.
   *
   * @returns Returns the cursor position after the operation.
   */
  public collapse(): void {
    const deleted = this.txt.delStr(this);
    if (deleted) this.collapseToStart();
  }

  /**
   * Insert inline text at current cursor position. If cursor selects a range,
   * the range is removed and the text is inserted at the start of the range.
   */
  public insert(text: string): void {
    if (!text) return;
    this.collapse();
    const after = this.start.clone();
    after.refAfter();
    const textId = this.txt.ins(after.id, text);
    const shift = text.length - 1;
    this.setAfter(shift ? tick(textId, shift) : textId);
  }

  /**
   * Deletes the given number of characters from the current caret position.
   * Negative values delete backwards. If the cursor selects a range, the
   * range is removed and the cursor is set at the start of the range.
   *
   * @param step Number of characters to delete. Negative values delete
   *     backwards.
   */
  public del(step: number = -1): void {
    if (!this.isCollapsed()) {
      this.collapse();
      return;
    }
    const point1 = this.start.clone();
    const point2 = point1.clone();
    if (step > 0) point2.step(1);
    else if (step < 0) point1.step(-1);
    else if (step === 0) {
      point1.step(-1);
      point2.step(1);
    }
    const txt = this.txt;
    const range = txt.range(point1, point2);
    txt.delStr(range);
    point1.refAfter();
    this.set(point1);
  }

  // ---------------------------------------------------------------- Printable

  public toStringName(): string {
    const focusIcon = this.anchorSide === CursorAnchor.Start ? '.→|' : '|←.';
    return 'Cursor ' + focusIcon + ' ' + printTs(this.chunk.id) + ' #' + this.hash.toString(36);
  }

  public toStringHeaderName(): string {
    const focusIcon = this.anchorSide === CursorAnchor.Start ? '.→|' : '|←.';
    return `${super.toStringHeaderName()}, ${focusIcon}`;
  }
}
