import {Point} from '../point/Point';
import {Anchor, SliceBehavior, Tags} from '../constants';
import {Range} from './Range';
import {printTree} from '../../../util/print/printTree';
import type {ITimestampStruct} from '../../../json-crdt-patch/clock';
import type {Peritext} from '../Peritext';
import type {Slice} from './types';

export class Cursor extends Range implements Slice {
  public readonly behavior = SliceBehavior.Overwrite;
  public readonly type = Tags.Cursor;

  /**
   * Specifies whether the start or the end of the cursor is the "anchor", e.g.
   * the end which does not move when user changes selection. The other
   * end is free to move, the moving end of the cursor is "focus". By default
   * "anchor" is the start of the cursor.
   *
   * @todo Create a custom enum for this, instead of using `Anchor`.
   */
  public base: Anchor = Anchor.Before;

  constructor(
    public readonly id: ITimestampStruct,
    protected readonly txt: Peritext,
    public start: Point,
    public end: Point,
  ) {
    super(txt, start, end);
  }

  public anchor(): Point {
    return this.base === Anchor.Before ? this.start : this.end;
  }

  public focus(): Point {
    return this.base === Anchor.Before ? this.end : this.start;
  }

  public set(start: Point, end?: Point, base: Anchor = Anchor.Before): void {
    if (!end || end === start) end = start.clone();
    super.set(start, end);
    this.base = base;
  }

  public setAt(start: number, length: number = 0): void {
    let at = start;
    let len = length;
    if (len < 0) {
      at += len;
      len = -len;
    }
    super.setAt(at, len);
    this.base = length < 0 ? Anchor.After : Anchor.Before;
  }

  /**
   * Move one of the edges of the cursor to a new point.
   *
   * @param point Point to set the edge to.
   * @param edge 0 for "focus", 1 for "anchor."
   */
  public setEdge(point: Point, edge: 0 | 1 = 0): void {
    if (this.start === this.end) this.end = this.end.clone();
    let anchor = this.anchor();
    let focus = this.focus();
    if (edge === 0) focus = point;
    else anchor = point;
    if (focus.compareSpatial(anchor) < 0) {
      this.base = Anchor.After;
      this.start = focus;
      this.end = anchor;
    } else {
      this.base = Anchor.Before;
      this.start = anchor;
      this.end = focus;
    }
  }

  /** @todo Maybe move it to another interface? */
  public del(): boolean {
    return false;
  }

  public data(): unknown {
    return 1;
  }

  public move(move: number): void {
    const {start, end} = this;
    start.move(move);
    if (start === end) return;
    end.move(move);
  }

  public toString(tab: string = ''): string {
    const text = JSON.stringify(this.text());
    const focusIcon = this.base === Anchor.Before ? '.⇨|' : '|⇦.';
    const main = `${this.constructor.name} ${super.toString(tab + '  ', true)} ${focusIcon}`;
    return main + printTree(tab, [() => text]);
  }

  // ----------------------------------------------------------------- Stateful

  public hash: number = 0;

  public refresh(): number {
    // TODO: implement this ...
    return this.hash;
  }
}
