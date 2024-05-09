import {printTree} from 'tree-dump/lib/printTree';
import {printBinary} from 'tree-dump/lib/printBinary';
import {first, insertLeft, insertRight, last, next, prev, remove} from 'sonic-forest/lib/util';
import {first2, insert2, next2, remove2} from 'sonic-forest/lib/util2';
import {splay} from 'sonic-forest/lib/splay/util';
import {Anchor} from '../rga/constants';
import {Point} from '../rga/Point';
import {OverlayPoint} from './OverlayPoint';
import {MarkerOverlayPoint} from './MarkerOverlayPoint';
import {OverlayRefSliceEnd, OverlayRefSliceStart} from './refs';
import {compare, ITimestampStruct} from '../../../json-crdt-patch/clock';
import {CONST, updateNum} from '../../../json-hash';
import {MarkerSlice} from '../slice/MarkerSlice';
import {Range} from '../rga/Range';
import {UndefEndIter, UndefIterator} from '../../../util/iterator';
import type {Chunk} from '../../../json-crdt/nodes/rga';
import type {Peritext} from '../Peritext';
import type {Stateful} from '../types';
import type {Printable} from 'tree-dump/lib/types';
import type {MutableSlice, Slice} from '../slice/types';
import type {Slices} from '../slice/Slices';
import type {OverlayPair, OverlayTuple} from './types';
import type {Comparator} from 'sonic-forest/lib/types';

const spatialComparator: Comparator<OverlayPoint> = (a: OverlayPoint, b: OverlayPoint) => a.cmpSpatial(b);

/**
 * Overlay is a tree structure that represents all the intersections of slices
 * in the text. It is used to quickly find all the slices that overlap a
 * given point in the text. The overlay is a read-only structure, its state
 * is changed only by calling the `refresh` method, which updates the overlay
 * based on the current state of the text and slices.
 */
export class Overlay<T = string> implements Printable, Stateful {
  public root: OverlayPoint<T> | undefined = undefined;
  public root2: MarkerOverlayPoint<T> | undefined = undefined;

  /** A virtual absolute start point, used when the absolute start is missing. */
  public readonly START: OverlayPoint<T>;

  /** A virtual absolute end point, used when the absolute end is missing. */
  public readonly END: OverlayPoint<T>;

  constructor(protected readonly txt: Peritext<T>) {
    const id = txt.str.id;
    this.START = this.point(id, Anchor.After);
    this.END = this.point(id, Anchor.Before);
  }

  private point(id: ITimestampStruct, anchor: Anchor): OverlayPoint<T> {
    return new OverlayPoint(this.txt.str, id, anchor);
  }

  private mPoint(marker: MarkerSlice<T>, anchor: Anchor): MarkerOverlayPoint<T> {
    return new MarkerOverlayPoint(this.txt.str, marker.start.id, anchor, marker);
  }

  public first(): OverlayPoint<T> | undefined {
    return this.root ? first(this.root) : undefined;
  }

  public last(): OverlayPoint<T> | undefined {
    return this.root ? last(this.root) : undefined;
  }

  /**
   * Retrieve overlay point or the previous one, measured in spacial dimension.
   */
  public getOrNextLower(point: Point<T>): OverlayPoint<T> | undefined {
    if (point.isAbsStart()) {
      const first = this.first();
      if (!first) return;
      if (first.isAbsStart()) return first;
      point = first;
    } else if (point.isAbsEnd()) return this.last();
    let curr: OverlayPoint<T> | undefined = this.root;
    let result: OverlayPoint<T> | undefined = undefined;
    while (curr) {
      const cmp = curr.cmpSpatial(point);
      if (cmp === 0) return curr;
      if (cmp > 0) curr = curr.l;
      else {
        const next = curr.r;
        result = curr;
        if (!next) return result;
        curr = next;
      }
    }
    return result;
  }

  /**
   * Retrieve overlay point or the next one, measured in spacial dimension.
   */
  public getOrNextHigher(point: Point<T>): OverlayPoint<T> | undefined {
    if (point.isAbsEnd()) {
      const last = this.last();
      if (!last) return;
      if (last.isAbsEnd()) return last;
      point = last;
    } else if (point.isAbsStart()) return this.first();
    let curr: OverlayPoint<T> | undefined = this.root;
    let result: OverlayPoint<T> | undefined = undefined;
    while (curr) {
      const cmp = curr.cmpSpatial(point);
      if (cmp === 0) return curr;
      if (cmp < 0) curr = curr.r;
      else {
        const next = curr.l;
        result = curr;
        if (!next) return result;
        curr = next;
      }
    }
    return result;
  }

  /** @todo Rename to `chunks()`. */
  public chunkSlices0(
    chunk: Chunk<T> | undefined,
    p1: Point<T>,
    p2: Point<T>,
    callback: (chunk: Chunk<T>, off: number, len: number) => void,
  ): Chunk<T> | undefined {
    const rga = this.txt.str;
    const strId = rga.id;
    let checkFirstAnchor = p1.anchor === Anchor.After;
    const adjustForLastAnchor = p2.anchor === Anchor.Before;
    let id1 = p1.id;
    const id1IsStr = !compare(id1, strId);
    if (id1IsStr) {
      const first = rga.first();
      if (!first) return;
      id1 = first.id;
      checkFirstAnchor = false;
    }
    const id2 = p2.id;
    if (!checkFirstAnchor && !adjustForLastAnchor) {
      return rga.range0(chunk, id1, id2, callback) as Chunk<T>;
    }
    const sid1 = id1.sid;
    const time1 = id1.time;
    const sid2 = id2.sid;
    const time2 = id2.time;
    return rga.range0(undefined, id1, id2, (chunk: Chunk<T>, off: number, len: number) => {
      if (checkFirstAnchor) {
        checkFirstAnchor = false;
        const chunkId = chunk.id;
        if (chunkId.sid === sid1 && chunkId.time + off === time1) {
          if (len <= 1) return;
          off += 1;
          len -= 1;
        }
      }
      if (adjustForLastAnchor) {
        const chunkId = chunk.id;
        if (chunkId.sid === sid2 && chunkId.time + off + len - 1 === time2) {
          if (len <= 1) return;
          len -= 1;
        }
      }
      callback(chunk, off, len);
    }) as Chunk<T>;
  }

  public points0(after: undefined | OverlayPoint<T>): UndefIterator<OverlayPoint<T>> {
    let curr = after ? next(after) : this.first();
    return () => {
      const ret = curr;
      if (curr) curr = next(curr);
      return ret;
    };
  }

  public points(after?: undefined | OverlayPoint<T>): IterableIterator<OverlayPoint<T>> {
    return new UndefEndIter(this.points0(after));
  }

  public markers0(after: undefined | MarkerOverlayPoint<T>): UndefIterator<MarkerOverlayPoint<T>> {
    let curr = after ? next2(after) : first2(this.root2);
    return () => {
      const ret = curr;
      if (curr) curr = next2(curr);
      return ret;
    };
  }

  public markers(): IterableIterator<MarkerOverlayPoint<T>> {
    return new UndefEndIter(this.markers0(undefined));
  }

  public pairs0(after: undefined | OverlayPoint<T>): UndefIterator<OverlayPair<T>> {
    const isEmpty = !this.root;
    if (isEmpty) {
      const u = undefined;
      let closed = false;
      return () => (closed ? u : ((closed = true), [u, u]));
    }
    let p1: OverlayPoint<T> | undefined;
    let p2: OverlayPoint<T> | undefined = after;
    const iterator = this.points0(after);
    return () => {
      const next = iterator();
      const isEnd = !next;
      if (isEnd) {
        if (!p2 || p2.isAbsEnd()) return;
        p1 = p2;
        p2 = undefined;
        return [p1, p2];
      }
      p1 = p2;
      p2 = next;
      if (!p1) {
        if (p2 && p2.isAbsStart()) {
          p1 = p2;
          p2 = iterator();
        }
      }
      return p1 || p2 ? [p1, p2] : undefined;
    };
  }

  public pairs(after?: undefined | OverlayPoint<T>): IterableIterator<OverlayPair<T>> {
    return new UndefEndIter(this.pairs0(after));
  }

  public tuples0(after: undefined | OverlayPoint<T>): UndefIterator<OverlayTuple<T>> {
    const iterator = this.pairs0(after);
    return () => {
      const pair = iterator();
      if (!pair) return;
      if (pair[0] === undefined) pair[0] = this.START;
      if (pair[1] === undefined) pair[1] = this.END;
      return pair as OverlayTuple<T>;
    };
  }

  public tuples(after?: undefined | OverlayPoint<T>): IterableIterator<OverlayTuple<T>> {
    return new UndefEndIter(this.tuples0(after));
  }

  /**
   * Finds the first point that satisfies the given predicate function.
   *
   * @param predicate Predicate function to find the point, returns true if the
   *     point is found.
   * @returns The first point that satisfies the predicate, or undefined if no
   *     point is found.
   */
  public find(predicate: (point: OverlayPoint<T>) => boolean): OverlayPoint<T> | undefined {
    let point = this.first();
    while (point) {
      if (predicate(point)) return point;
      point = next(point);
    }
    return;
  }

  /**
   * Finds all slices that are contained within the given range. A slice is
   * considered contained if its start and end points are within the range,
   * inclusive (uses {@link Range#contains} method to check containment).
   *
   * @param range The range to search for contained slices.
   * @returns A set of slices that are contained within the given range.
   */
  public findContained(range: Range<T>): Set<Slice<T>> {
    const result = new Set<Slice<T>>();
    let point = this.getOrNextLower(range.start);
    if (!point) return result;
    do {
      if (!range.containsPoint(point)) continue;
      const slices = point.layers;
      const length = slices.length;
      for (let i = 0; i < length; i++) {
        const slice = slices[i];
        if (!result.has(slice) && range.contains(slice)) result.add(slice);
      }
      if (point instanceof MarkerOverlayPoint) {
        const marker = point.marker;
        if (marker && !result.has(marker) && range.contains(marker)) result.add(marker);
      }
    } while (point && (point = next(point)) && range.containsPoint(point));
    return result;
  }

  /**
   * Finds all slices that overlap with the given range. A slice is considered
   * overlapping if its start or end point is within the range, inclusive
   * (uses {@link Range#containsPoint} method to check overlap).
   *
   * @param range The range to search for overlapping slices.
   * @returns A set of slices that overlap with the given range.
   */
  public findOverlapping(range: Range<T>): Set<Slice<T>> {
    const result = new Set<Slice<T>>();
    let point = this.getOrNextLower(range.start);
    if (!point) return result;
    do {
      const slices = point.layers;
      const length = slices.length;
      for (let i = 0; i < length; i++) result.add(slices[i]);
      if (point instanceof MarkerOverlayPoint) {
        const marker = point.marker;
        if (marker) result.add(marker);
      }
    } while (point && (point = next(point)) && range.containsPoint(point));
    return result;
  }

  /**
   * Returns `true` if the current character is a marker sentinel.
   *
   * @param id ID of the point to check.
   * @returns Whether the point is a marker point.
   */
  public isMarker(id: ITimestampStruct): boolean {
    const p = this.txt.point(id, Anchor.Before);
    const op = this.getOrNextLower(p);
    return op instanceof MarkerOverlayPoint && op.id.time === id.time && op.id.sid === id.sid;
  }

  // ----------------------------------------------------------------- Stateful

  public hash: number = 0;

  public refresh(slicesOnly: boolean = false): number {
    const txt = this.txt;
    let hash: number = CONST.START_STATE;
    hash = this.refreshSlices(hash, txt.savedSlices);
    hash = this.refreshSlices(hash, txt.extraSlices);
    hash = this.refreshSlices(hash, txt.localSlices);

    // TODO: Move test hash calculation out of the overlay.
    if (!slicesOnly) {
      // hash = updateRga(hash, txt.str);
      hash = this.refreshTextSlices(hash);
    }
    return (this.hash = hash);
  }

  public readonly slices = new Map<Slice<T>, [start: OverlayPoint<T>, end: OverlayPoint<T>]>();

  private refreshSlices(state: number, slices: Slices<T>): number {
    const oldSlicesHash = slices.hash;
    const changed = oldSlicesHash !== slices.refresh();
    const sliceSet = this.slices;
    state = updateNum(state, slices.hash);
    if (changed) {
      slices.forEach((slice) => {
        let tuple: [start: OverlayPoint<T>, end: OverlayPoint<T>] | undefined = sliceSet.get(slice);
        if (tuple) {
          if ((slice as any).isDel && (slice as any).isDel()) {
            this.delSlice(slice, tuple);
            return;
          }
          const positionMoved = tuple[0].cmp(slice.start) !== 0 || tuple[1].cmp(slice.end) !== 0;
          if (positionMoved) this.delSlice(slice, tuple);
          else return;
        }
        tuple = slice instanceof MarkerSlice ? this.insMarker(slice) : this.insSlice(slice);
        this.slices.set(slice, tuple);
      });
      if (slices.size() < sliceSet.size) {
        sliceSet.forEach((tuple, slice) => {
          const mutSlice = slice as Slice | MutableSlice;
          if ((<MutableSlice>mutSlice).isDel) {
            if (!(<MutableSlice>mutSlice).isDel()) return;
            this.delSlice(slice, tuple);
          }
        });
      }
    }
    return state;
  }

  private insSlice(slice: Slice<T>): [start: OverlayPoint<T>, end: OverlayPoint<T>] {
    // TODO: Test cases where the inserted slice is collapsed to one point.
    const x0 = slice.start;
    const x1 = slice.end;
    const [start, isStartNew] = this.upsertPoint(x0);
    const [end, isEndNew] = this.upsertPoint(x1);
    const isCollapsed = x0.cmp(x1) === 0;
    start.refs.push(new OverlayRefSliceStart(slice));
    end.refs.push(new OverlayRefSliceEnd(slice));
    if (isStartNew) {
      const beforeStartPoint = prev(start);
      if (beforeStartPoint) start.layers.push(...beforeStartPoint.layers);
    }
    if (!isCollapsed) {
      if (isEndNew) {
        const beforeEndPoint = prev(end);
        if (beforeEndPoint) end.layers.push(...beforeEndPoint.layers);
      }
      let curr: OverlayPoint<T> | undefined = start;
      do curr.addLayer(slice);
      while ((curr = next(curr)) && curr !== end);
    } else {
      // TODO: review if this is needed:
      start.addMarker(slice);
    }
    return [start, end];
  }

  private insMarker(slice: MarkerSlice<T>): [start: OverlayPoint<T>, end: OverlayPoint<T>] {
    const point = this.mPoint(slice, Anchor.Before);
    const pivot = this.insPoint(point);
    if (!pivot) {
      point.refs.push(slice);
      const prevPoint = prev(point);
      if (prevPoint) point.layers.push(...prevPoint.layers);
    }
    return [point, point];
  }

  private delSlice(slice: Slice<T>, [start, end]: [start: OverlayPoint<T>, end: OverlayPoint<T>]): void {
    this.slices.delete(slice);
    let curr: OverlayPoint<T> | undefined = start;
    do {
      curr.removeLayer(slice);
      curr.removeMarker(slice);
      curr = next(curr);
    } while (curr && curr !== end);
    start.removeRef(slice);
    end.removeRef(slice);
    if (!start.refs.length) this.delPoint(start);
    if (!end.refs.length && start !== end) this.delPoint(end);
  }

  /**
   * Retrieve an existing {@link OverlayPoint} or create a new one, inserted
   * in the tree, sorted by spatial dimension.
   */
  private upsertPoint(point: Point<T>): [point: OverlayPoint<T>, isNew: boolean] {
    const newPoint = this.point(point.id, point.anchor);
    const pivot = this.insPoint(newPoint);
    if (pivot) return [pivot, false];
    return [newPoint, true];
  }

  /**
   * Inserts a point into the tree, sorted by spatial dimension.
   * @param point Point to insert.
   * @returns Returns the existing point if it was already in the tree.
   */
  private insPoint(point: OverlayPoint<T>): OverlayPoint<T> | undefined {
    if (point instanceof MarkerOverlayPoint) {
      this.root2 = insert2(this.root2, point, spatialComparator);
      // if (this.root2 !== point) this.root2 = splay2(this.root2!, point, 10);
    }
    let pivot = this.getOrNextLower(point);
    if (!pivot) pivot = first(this.root);
    if (!pivot) {
      this.root = point;
      return;
    } else {
      if (pivot.cmp(point) === 0) return pivot;
      const cmp = pivot.cmpSpatial(point);
      if (cmp < 0) insertRight(point, pivot);
      else insertLeft(point, pivot);
    }
    if (this.root !== point) this.root = splay(this.root!, point, 10);
    return;
  }

  private delPoint(point: OverlayPoint<T>): void {
    if (point instanceof MarkerOverlayPoint) this.root2 = remove2(this.root2, point);
    this.root = remove(this.root, point);
  }

  public leadingTextHash: number = 0;

  protected refreshTextSlices(stateTotal: number): number {
    const txt = this.txt;
    const str = txt.str;
    const firstChunk = str.first();
    if (!firstChunk) return stateTotal;
    let chunk: Chunk<T> | undefined = firstChunk;
    let marker: MarkerOverlayPoint<T> | undefined = undefined;
    const i = this.tuples0(undefined);
    let state: number = CONST.START_STATE;
    for (let pair = i(); pair; pair = i()) {
      const [p1, p2] = pair;
      const id1 = p1.id;
      state = (state << 5) + state + (id1.sid >>> 0) + id1.time;
      let overlayPointHash = CONST.START_STATE;
      chunk = this.chunkSlices0(chunk || firstChunk, p1, p2, (chunk, off, len) => {
        const id = chunk.id;
        overlayPointHash =
          (overlayPointHash << 5) + overlayPointHash + ((((id.sid >>> 0) + id.time) << 8) + (off << 4) + len);
      });
      state = updateNum(state, overlayPointHash);
      p1.hash = overlayPointHash;
      stateTotal = updateNum(stateTotal, overlayPointHash);
      if (p2 instanceof MarkerOverlayPoint) {
        if (marker) {
          marker.textHash = state;
        } else {
          this.leadingTextHash = state;
        }
        stateTotal = updateNum(stateTotal, state);
        state = CONST.START_STATE;
        marker = p2;
      }
    }
    if ((marker as any) instanceof MarkerOverlayPoint) {
      (marker as any as MarkerOverlayPoint<T>).textHash = state;
    } else {
      this.leadingTextHash = state;
    }
    return stateTotal;
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = ''): string {
    const printPoint = (tab: string, point: OverlayPoint<T>): string => {
      return (
        point.toString(tab) +
        printBinary(tab, [
          !point.l ? null : (tab) => printPoint(tab, point.l!),
          !point.r ? null : (tab) => printPoint(tab, point.r!),
        ])
      );
    };
    const printMarkerPoint = (tab: string, point: MarkerOverlayPoint<T>): string => {
      return (
        point.toString(tab) +
        printBinary(tab, [
          !point.l2 ? null : (tab) => printMarkerPoint(tab, point.l2!),
          !point.r2 ? null : (tab) => printMarkerPoint(tab, point.r2!),
        ])
      );
    };
    return (
      `${this.constructor.name} #${this.hash.toString(36)}` +
      printTree(tab, [
        !this.root ? null : (tab) => printPoint(tab, this.root!),
        !this.root2 ? null : (tab) => printMarkerPoint(tab, this.root2!),
      ])
    );
  }
}
