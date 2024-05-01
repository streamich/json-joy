import {Point} from '../rga/Point';
import {Range} from '../rga/Range';
import {CursorAnchor} from '../slice/constants';
import {PersistedSlice} from '../slice/PersistedSlice';

export class Cursor<T = string> extends PersistedSlice<T> {
  public get anchorSide(): CursorAnchor {
    return this.type as CursorAnchor;
  }

  public set anchorSide(value: CursorAnchor) {
    this.update({type: value});
  }

  public anchor(): Point<T> {
    return this.anchorSide === CursorAnchor.Start ? this.start : this.end;
  }

  public focus(): Point<T> {
    return this.anchorSide === CursorAnchor.Start ? this.end : this.start;
  }

  public set(start: Point<T>, end?: Point<T>, anchorSide: CursorAnchor = this.anchorSide): void {
    if (!end || end === start) end = start.clone();
    super.set(start, end);
    this.update({
      range: this,
      type: anchorSide,
    });
  }

  /** TODO: Move to {@link PersistedSlice}. */
  public setAt(start: number, length: number = 0): void {
    let at = start;
    let len = length;
    if (len < 0) {
      at += len;
      len = -len;
    }
    const range = Range.at<T>(this.rga, start, length);
    const anchorSide = this.anchorSide;
    this.update({
      range,
      type: anchorSide !== this.anchorSide ? anchorSide : undefined,
    });
  }

  /**
   * Move one of the edges of the cursor to a new point.
   *
   * @param point Point to set the edge to.
   * @param edge 0 for "focus", 1 for "anchor."
   */
  public setEdge(point: Point<T>, edge: 0 | 1 = 0): void {
    if (this.start === this.end) this.end = this.end.clone();
    let anchor = this.anchor();
    let focus = this.focus();
    if (edge === 0) focus = point; else anchor = point;
    if (focus.cmpSpatial(anchor) < 0) this.set(focus, anchor, CursorAnchor.End);
    else this.set(anchor, focus, CursorAnchor.Start);
  }

  public move(move: number): void {
    const {start, end} = this;
    start.move(move);
    if (start !== end) {
      end.move(move);
    }
    this.set(start, end);
  }

  // ---------------------------------------------------------------- Printable

  public toStringName(): string {
    const focusIcon = this.anchorSide === CursorAnchor.Start ? '.→|' : '|←.';
    return `${super.toStringName()}, ${focusIcon}`;
  }
}
