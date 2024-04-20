import {Point} from '../rga/Point';
import {CursorAnchor, SliceBehavior, Tags} from './constants';
import {Range} from '../rga/Range';
import {printTree} from '../../../util/print/printTree';
import {updateNum} from '../../../json-hash';
import type {ITimestampStruct} from '../../../json-crdt-patch/clock';
import type {Peritext} from '../Peritext';
import type {Slice} from './types';

export class Cursor<T = string> extends Range<T> implements Slice<T> {
  public readonly behavior = SliceBehavior.Overwrite;
  public readonly type = Tags.Cursor;

  /**
   * Specifies whether the start or the end of the cursor is the "anchor", e.g.
   * the end which does not move when user changes selection. The other
   * end is free to move, the moving end of the cursor is "focus". By default
   * "anchor" is the start of the cursor.
   */
  public anchorSide: CursorAnchor = CursorAnchor.Start;

  constructor(
    public readonly id: ITimestampStruct,
    protected readonly txt: Peritext,
    public start: Point<T>,
    public end: Point<T>,
  ) {
    super(txt.str as any, start, end);
  }

  public anchor(): Point<T> {
    return this.anchorSide === CursorAnchor.Start ? this.start : this.end;
  }

  public focus(): Point<T> {
    return this.anchorSide === CursorAnchor.Start ? this.end : this.start;
  }

  public set(start: Point<T>, end?: Point<T>, base: CursorAnchor = CursorAnchor.Start): void {
    if (!end || end === start) end = start.clone();
    super.set(start, end);
    this.anchorSide = base;
  }

  public setAt(start: number, length: number = 0): void {
    let at = start;
    let len = length;
    if (len < 0) {
      at += len;
      len = -len;
    }
    super.setAt(at, len);
    this.anchorSide = length < 0 ? CursorAnchor.End : CursorAnchor.Start;
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
    if (edge === 0) focus = point;
    else anchor = point;
    if (focus.cmpSpatial(anchor) < 0) {
      this.anchorSide = CursorAnchor.End;
      this.start = focus;
      this.end = anchor;
    } else {
      this.anchorSide = CursorAnchor.Start;
      this.start = anchor;
      this.end = focus;
    }
  }

  public data() {
    return undefined;
  }

  public move(move: number): void {
    const {start, end} = this;
    start.move(move);
    if (start === end) return;
    end.move(move);
  }

  // ----------------------------------------------------------------- Stateful

  public hash: number = 0;

  public refresh(): number {
    let state = super.refresh();
    state = updateNum(state, this.anchorSide);
    this.hash = state;
    return state;
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = ''): string {
    const text = JSON.stringify(this.text());
    const focusIcon = this.anchorSide === CursorAnchor.Start ? '.→|' : '|←.';
    const main = `${this.constructor.name} ${super.toString(tab + '  ', true)} ${focusIcon}`;
    return main + printTree(tab, [() => text]);
  }
}
