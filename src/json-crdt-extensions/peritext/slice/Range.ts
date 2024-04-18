import {Point} from '../point/Point';
import {Anchor} from '../constants';
import {StringChunk} from '../util/types';
import {type ITimestampStruct, tick} from '../../../json-crdt-patch/clock';
import type {Peritext} from '../Peritext';
import type {Printable} from '../../../util/print/types';

/**
 * A range is a pair of points that represent a selection in the text. A range
 * can be collapsed to a single point, then it is called a *marker*
 * (if it is stored in the text), or *caret* (if it is a cursor position).
 */
export class Range implements Printable {
  /**
   * Creates a range from two points. The points are ordered so that the
   * start point is before or equal to the end point.
   *
   * @param txt Peritext context.
   * @param p1 Some point.
   * @param p2 Another point.
   * @returns Range with points in correct order.
   */
  public static from(txt: Peritext, p1: Point, p2: Point) {
    return p1.compareSpatial(p2) > 0 ? new Range(txt, p2, p1) : new Range(txt, p1, p2);
  }

  /**
   * @param txt Peritext context.
   * @param start Start point of the range, must be before or equal to end.
   * @param end End point of the range, must be after or equal to start.
   */
  constructor(
    protected readonly txt: Peritext,
    public start: Point,
    public end: Point,
  ) {}

  /**
   * Clones the range.
   *
   * @returns A new range with the same start and end points.
   */
  public clone(): Range {
    return new Range(this.txt, this.start.clone(), this.end.clone());
  }

  /**
   * Determines if the range is collapsed to a single point. Handles special
   * cases where the range is collapsed, but the points are not equal, for
   * example, when the characters between the points are invisible.
   *
   * @returns True if the range is collapsed to a single point.
   */
  public isCollapsed(): boolean {
    const {start, end} = this;
    if (start.compareSpatial(end) === 0) return true;
    const start2 = start.clone();
    const end2 = end.clone();
    start2.refAfter();
    end2.refAfter();
    return start2.compare(end2) === 0;
  }

  /**
   * Collapse the range to the start point and sets the anchor position to be
   * "after" the character.
   */
  public collapseToStart(): void {
    this.start = this.start.clone();
    this.start.refAfter();
    this.end = this.start.clone();
  }

  /**
   * Collapse the range to the end point and sets the anchor position to be
   * "before" the character.
   */
  public collapseToEnd(): void {
    this.end = this.end.clone();
    this.end.refAfter();
    this.start = this.end.clone();
  }

  /**
   * Returns the range in the view coordinates as a position and length.
   *
   * @returns The range as a view position and length.
   */
  public views(): [at: number, len: number] {
    const start = this.start.viewPos();
    const end = this.end.viewPos();
    return [start, end - start];
  }

  public set(start: Point, end: Point = start): void {
    this.start = start;
    this.end = end === start ? end.clone() : end;
  }

  public setRange(range: Range): void {
    this.set(range.start, range.end);
  }

  public setAt(start: number, length: number = 0): void {
    // TODO: move implementation to here
    const range = this.txt.rangeAt(start, length);
    this.setRange(range);
  }

  /** @todo Can this be moved to Cursor? */
  public setCaret(after: ITimestampStruct, shift: number = 0): void {
    const id = shift ? tick(after, shift) : after;
    const caretAfter = new Point(this.txt, id, Anchor.After);
    this.set(caretAfter);
  }

  public contains(range: Range): boolean {
    return this.start.compareSpatial(range.start) <= 0 && this.end.compareSpatial(range.end) >= 0;
  }

  public containsPoint(range: Point): boolean {
    return this.start.compareSpatial(range) <= 0 && this.end.compareSpatial(range) >= 0;
  }

  /**
   * Expand range left and right to contain all invisible space: (1) tombstones,
   * (2) anchors of non-deleted adjacent chunks.
   */
  public expand(): void {
    this.expandStart();
    this.expandEnd();
  }

  public expandStart(): void {
    const start = this.start;
    const str = this.txt.str;
    let chunk = start.chunk();
    if (!chunk) return;
    if (!chunk.del) {
      if (start.anchor === Anchor.After) return;
      const pointIsStartOfChunk = start.id.time === chunk.id.time;
      if (!pointIsStartOfChunk) {
        start.id = tick(start.id, -1);
        start.anchor = Anchor.After;
        return;
      }
    }
    while (chunk) {
      const prev = str.prev(chunk);
      if (!prev) {
        start.id = chunk.id;
        start.anchor = Anchor.Before;
        break;
      } else {
        if (prev.del) {
          chunk = prev;
          continue;
        } else {
          start.id = prev.span > 1 ? tick(prev.id, prev.span - 1) : prev.id;
          start.anchor = Anchor.After;
          break;
        }
      }
    }
  }

  public expandEnd(): void {
    const end = this.end;
    const str = this.txt.str;
    let chunk = end.chunk();
    if (!chunk) return;
    if (!chunk.del) {
      if (end.anchor === Anchor.Before) return;
      const pointIsEndOfChunk = end.id.time === chunk.id.time + chunk.span - 1;
      if (!pointIsEndOfChunk) {
        end.id = tick(end.id, 1);
        end.anchor = Anchor.Before;
        return;
      }
    }
    while (chunk) {
      const next = str.next(chunk);
      if (!next) {
        end.id = chunk.span > 1 ? tick(chunk.id, chunk.span - 1) : chunk.id;
        end.anchor = Anchor.After;
        break;
      } else {
        if (next.del) {
          chunk = next;
          continue;
        } else {
          end.id = next.id;
          end.anchor = Anchor.Before;
          break;
        }
      }
    }
  }

  /**
   * Concatenates all text chunks in the range ignoring tombstones and returns
   * the result.
   *
   * @returns The text content of the range.
   */
  public text(): string {
    const isCaret = this.isCollapsed();
    if (isCaret) return '';
    const {start, end} = this;
    const str = this.txt.str;
    const startId = start.anchor === Anchor.Before ? start.id : start.nextId();
    const endId = end.anchor === Anchor.After ? end.id : end.prevId();
    if (!startId || !endId) return '';
    let result = '';
    str.range0(undefined, startId, endId, (chunk: StringChunk, from: number, length: number) => {
      if (chunk.data) result += chunk.data.slice(from, from + length);
    });
    return result;
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = '', lite: boolean = true): string {
    const name = lite ? '' : `${this.constructor.name} `;
    const start = this.start.toString(tab, lite);
    const end = this.end.toString(tab, lite);
    return `${name}${start} ↔ ${end}`;
  }
}
