import {Point} from './Point';
import {Anchor} from './constants';
import {updateNum} from '../../../json-hash/hash';
import type {ITimestampStruct} from '../../../json-crdt-patch/clock';
import type {Printable} from 'tree-dump/lib/types';
import type {AbstractRga, Chunk} from '../../../json-crdt/nodes/rga';
import type {Stateful} from '../types';

/**
 * A range is a pair of points that represent a selection in the text. A range
 * can be collapsed to a single point, then it is called a *marker*
 * (if it is stored in the text), or *caret* (if it is a cursor position).
 */
export class Range<T = string> implements Pick<Stateful, 'refresh'>, Printable {
  /**
   * Creates a range from two points. The points are ordered so that the
   * start point is before or equal to the end point.
   *
   * @param rga Peritext context.
   * @param p1 Some point.
   * @param p2 Another point.
   * @returns Range with points in correct order.
   */
  public static from<T = string>(rga: AbstractRga<T>, p1: Point<T>, p2: Point<T>): Range<T> {
    return p1.cmpSpatial(p2) > 0 ? new Range(rga, p2, p1) : new Range(rga, p1, p2);
  }

  /**
   * A convenience method for creating a range from a view position and a length.
   * The `start` argument specifies the position between characters, where
   * the range should start. The `size` argument specifies the number of
   * characters in the range. If `size` is zero or not specified, the range
   * will be collapsed to a single point.
   *
   * When the range is collapsed, the anchor position is set to "after" the
   * character. When the range is expanded, the anchor positions are set to
   * "before" for the start point and "after" for the end point.
   *
   * The `size` argument can be negative, in which case the range is selected
   * backwards.
   *
   * @param rga Peritext context.
   * @param start Position in the text between characters.
   * @param size Length of the range. Can be negative, in which case the range
   *             is selected backwards.
   * @returns A range from the given position with the given length.
   */
  public static at<T = string>(rga: AbstractRga<T>, start: number, size: number = 0): Range<T> {
    const length = rga.length();
    if (!size) {
      if (start > length) start = length;
      const startId = !start ? rga.id : rga.find(start - 1) || rga.id;
      const point = new Point(rga, startId, Anchor.After);
      return new Range<T>(rga, point, point.clone());
    }
    if (size < 0) {
      size = -size;
      start -= size;
    }
    if (start < 0) {
      size += start;
      start = 0;
      if (size < 0) return Range.at(rga, start, 0);
    }
    if (start >= length) {
      start = length;
      size = 0;
    }
    if (start + size > length) size = length - start;
    const startId = rga.find(start) || rga.id;
    const endId = rga.find(start + size - 1) || startId;
    const startEndpoint = new Point(rga, startId, Anchor.Before);
    const endEndpoint = new Point(rga, endId, Anchor.After);
    return new Range(rga, startEndpoint, endEndpoint);
  }

  /**
   * @param rga Peritext context.
   * @param start Start point of the range, must be before or equal to end.
   * @param end End point of the range, must be after or equal to start.
   */
  constructor(
    protected readonly rga: AbstractRga<T>,
    public start: Point<T>,
    public end: Point<T>,
  ) {}

  /**
   * Clones the range.
   *
   * @returns A new range with the same start and end points.
   */
  public range(): Range<T> {
    return new Range(this.rga, this.start.clone(), this.end.clone());
  }

  public cmp(range: Range<T>): -1 | 0 | 1 {
    return this.start.cmp(range.start) || this.end.cmp(range.end);
  }

  public cmpSpatial(range: Range<T>): number {
    return this.start.cmpSpatial(range.start) || this.end.cmpSpatial(range.end);
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
    if (start.cmpSpatial(end) === 0) return true;
    const start2 = start.clone();
    const end2 = end.clone();
    start2.refAfter();
    end2.refAfter();
    return start2.cmp(end2) === 0;
  }

  public contains(range: Range<T>): boolean {
    return this.start.cmpSpatial(range.start) <= 0 && this.end.cmpSpatial(range.end) >= 0;
  }

  public containsPoint(point: Point<T>): boolean {
    return this.start.cmpSpatial(point) <= 0 && this.end.cmpSpatial(point) >= 0;
  }

  // ---------------------------------------------------------------- mutations

  public set(start: Point<T>, end: Point<T> = start): void {
    this.start = start;
    this.end = end === start ? end.clone() : end;
  }

  public setRange(range: Range<T>): void {
    this.set(range.start, range.end);
  }

  public setAt(start: number, length: number = 0): void {
    const range = Range.at<T>(this.rga, start, length);
    this.setRange(range);
  }

  public setAfter(id: ITimestampStruct): void {
    const point = new Point(this.rga, id, Anchor.After);
    this.set(point);
  }

  /**
   * Collapse the range to the start point and sets the anchor position to be
   * "after" the character.
   */
  public collapseToStart(): void {
    const start = this.start.clone();
    start.refAfter();
    const end = start.clone();
    this.set(start, end);
  }

  /**
   * Collapse the range to the end point and sets the anchor position to be
   * "before" the character.
   */
  public collapseToEnd(): void {
    const end = this.end.clone();
    end.refAfter();
    const start = this.end.clone();
    this.set(start, end);
  }

  /**
   * Expand range left and right to contain all invisible space: (1) tombstones,
   * (2) anchors of non-deleted adjacent chunks.
   */
  public expand(): void {
    this.start.refAfter();
    this.end.refBefore();
  }

  /**
   * The reverse of {@link expand}. Shrink the range's start and end points to
   * still contain the same visible text, but narrow the range in the CRDT-space
   * as much as possible.
   */
  public shrink(): void {
    this.start.refBefore();
    this.end.refAfter();
  }

  // -------------------------------------------------- View coordinate methods

  /**
   * Returns the range in the view coordinates as a position and length.
   *
   * @returns The range as a view position and length.
   */
  public view(): [start: number, size: number] {
    const start = this.start.viewPos();
    const end = this.end.viewPos();
    return [start, end - start];
  }

  /**
   * @returns The length of the range in view coordinates.
   */
  public length(): number {
    return this.end.viewPos() - this.start.viewPos();
  }

  /**
   * Returns plain text view of the range. Concatenates all text chunks in the
   * range ignoring tombstones and returns the result.
   *
   * @returns The text content of the range.
   */
  public text(): string {
    const isCaret = this.isCollapsed();
    if (isCaret) return '';
    const {start, end} = this;
    const rga = this.rga;
    const startId = start.anchor === Anchor.Before ? start.id : start.nextId();
    const endId = end.anchor === Anchor.After ? end.id : end.prevId();
    if (!startId || !endId) return '';
    let result = '';
    rga.range0(start.chunk(), startId, endId, (chunk: Chunk<T>, from: number, length: number) => {
      const data = chunk.data as string;
      if (data) result += data.slice(from, from + length);
    });
    return result;
  }

  // ----------------------------------------------------------------- Stateful

  public refresh(): number {
    let state = this.start.refresh();
    state = updateNum(state, this.end.refresh());
    return state;
  }

  // ---------------------------------------------------------------- Printable

  public toStringName(): string {
    return 'Range';
  }

  public toString(tab: string = '', lite: boolean = true): string {
    const name = this.toStringName();
    const start = this.start.toString(tab, lite);
    const end = this.end.toString(tab, lite);
    let text = this.text();
    if (text.length > 16) text = text.slice(0, 16) + '...';
    return `${name} ${JSON.stringify(text)} ${start} ↔ ${end}`;
  }
}
