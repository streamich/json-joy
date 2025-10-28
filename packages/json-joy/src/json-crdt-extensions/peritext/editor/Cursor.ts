import {printTs} from '../../../json-crdt-patch';
import {CursorAnchor} from '../slice/constants';
import {Slice} from '../slice/Slice';
import type {Point} from '../rga/Point';

/**
 * Cursor is a slice that represents an explicitly highlighted place in the
 * text to the user. The {@link Cursor} is a {@link Range}, it has a `start`
 * {@link Point} and an `end` {@link Point}.
 *
 * The {@link Cursor} can be a caret (collapsed cursor) or a selection (range
 * expanded cursor). The caret is said to be "collapsed", its `start` and `end`
 * {@link Point}s are the same. When the selection is said to be "expanded", its
 * `start` and `end` {@link Point}s are different.
 *
 * The `start` {@link Point} is always the one that comes first in the text, it
 * is less then or equal to the `end` {@link Point} in the spatial (text) order.
 *
 * An expanded selection cursor has a *focus* and an *anchor* side. The *focus*
 * side is the one that moves when the user presses the arrow keys. The *anchor*
 * side is the one that stays in place when the user presses the arrow keys. The
 * side of the anchor is determined by the {@link Cursor#anchorSide} property.
 */
export class Cursor<T = string> extends Slice<T> {
  /**
   * @todo Remove getter `get` here.
   */
  public get anchorSide(): CursorAnchor {
    return this.type() as CursorAnchor;
  }

  public isStartFocused(): boolean {
    return this.type() === CursorAnchor.End || this.start.cmp(this.end) === 0;
  }

  public isEndFocused(): boolean {
    return this.type() === CursorAnchor.Start || this.start.cmp(this.end) === 0;
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
    const isCaret = start.cmp(end) === 0;
    start.step(move);
    if (isCaret) this.set(start);
    else {
      end.step(move);
      this.set(start, end);
    }
  }

  public collapseToStart(anchorSide: CursorAnchor = CursorAnchor.Start): void {
    const start = this.start.clone();
    start.refAfter();
    const end = start.clone();
    this.set(start, end, anchorSide);
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
