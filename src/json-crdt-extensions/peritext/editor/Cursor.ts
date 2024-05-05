import {ITimestampStruct} from '../../../json-crdt-patch';
import {Anchor} from '../rga/constants';
import {Point} from '../rga/Point';
import {CursorAnchor} from '../slice/constants';
import {PersistedSlice} from '../slice/PersistedSlice';

export class Cursor<T = string> extends PersistedSlice<T> {
  public get anchorSide(): CursorAnchor {
    return this.type as CursorAnchor;
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
   * @param endpoint 0 for "focus", 1 for "anchor."
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
    start.move(move);
    if (start !== end) end.move(move);
    this.set(start, end);
  }

  /**
   * Ensures there is no range selection. If user has selected a range,
   * the contents is removed and the cursor is set at the start of the range as cursor.
   *
   * @todo If block boundaries are withing the range, remove the blocks.
   *
   * @returns Returns the cursor position after the operation.
   */
  public collapseSelection(): ITimestampStruct {
    const isCaret = this.isCollapsed();
    if (!isCaret) {
      const {start, end} = this;
      const deleteStartId = start.anchor === Anchor.Before ? start.id : start.nextId();
      const deleteEndId = end.anchor === Anchor.After ? end.id : end.prevId();
      const rga = this.rga;
      if (!deleteStartId || !deleteEndId) throw new Error('INVALID_RANGE');
      const range = rga.findInterval2(deleteStartId, deleteEndId);
      const model = this.model;
      const api = model.api;
      api.builder.del(rga.id, range);
      api.apply();
      if (start.anchor === Anchor.After) this.setAfter(start.id);
      else this.setAfter(start.prevId() || rga.id);
    }
    return this.start.id;
  }

  // ---------------------------------------------------------------- Printable

  public toStringName(): string {
    const focusIcon = this.anchorSide === CursorAnchor.Start ? '.→|' : '|←.';
    return `${super.toStringName()}, ${focusIcon}`;
  }
}
