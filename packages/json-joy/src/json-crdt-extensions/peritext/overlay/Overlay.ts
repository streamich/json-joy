import {printTree} from 'tree-dump/lib/printTree';
import {printBinary} from 'tree-dump/lib/printBinary';
import {first, insertLeft, insertRight, last, next, prev, remove} from 'sonic-forest/lib/util';
import {first2, insert2, last2, next2, prev2, remove2} from 'sonic-forest/lib/util2';
import {splay} from 'sonic-forest/lib/splay/util';
import {Anchor} from '../rga/constants';
import {OverlayPoint} from './OverlayPoint';
import {OverlayRefSliceEnd, OverlayRefSliceStart} from './refs';
import {compare, type ITimestampStruct} from '../../../json-crdt-patch/clock';
import {CONST, updateNum} from '../../../json-hash/hash';
import {Slice} from '../slice/Slice';
import {UndEndIterator, type UndEndNext} from '../../../util/iterator';
import {SliceStacking} from '../slice/constants';
import type {Point} from '../rga/Point';
import type {Range} from '../rga/Range';
import type {Chunk} from '../../../json-crdt/nodes/rga';
import type {Peritext} from '../Peritext';
import type {Stateful} from '../types';
import type {Printable} from 'tree-dump/lib/types';
import type {OverlayPair, OverlayTuple} from './types';
import type {Comparator, HeadlessNode} from 'sonic-forest/lib/types';
import type {SliceType} from '../slice';
import type {HeadlessNode2} from 'sonic-forest/lib/types2';

const find = <T, N extends HeadlessNode & T>(
  root: N | undefined,
  comparison: T,
  comparator: Comparator<T>,
): N | undefined => {
  let curr: N | undefined = root;
  while (curr) {
    const cmp = comparator(comparison, curr);
    if (cmp === 0) return curr;
    curr = cmp < 0 ? (curr.l as N | undefined) : (curr.r as N | undefined);
  }
  return curr;
};

const find2 = <T, N extends HeadlessNode2 & T>(
  root: N | undefined,
  comparison: T,
  comparator: Comparator<T>,
): N | undefined => {
  let curr: N | undefined = root;
  while (curr) {
    const cmp = comparator(comparison, curr);
    if (cmp === 0) return curr;
    curr = cmp < 0 ? (curr.l2 as N | undefined) : (curr.r2 as N | undefined);
  }
  return curr;
};

export const insert = <T, N extends HeadlessNode & T>(
  root: N | undefined,
  node: N,
  comparator: Comparator<T>,
): N | undefined => {
  if (!root) return node;
  let curr: N | undefined = root;
  while (curr) {
    const cmp = comparator(node, curr);
    const next: N | undefined = cmp < 0 ? (curr.l as N | undefined) : (curr.r as N | undefined);
    if (!next) {
      if (cmp < 0) insertLeft(node, curr);
      else insertRight(node, curr);
      break;
    } else curr = next;
  }
  return root;
};

const spatialComparator: Comparator<OverlayPoint<any>> = (a: OverlayPoint, b: OverlayPoint) => a.cmpSpatial(b);

/**
 * Overlay is a tree structure that represents all the intersections of slices
 * in the text. It is used to quickly find all the slices that overlap a
 * given point in the text. The overlay is a read-only structure, its state
 * is changed only by calling the `refresh` method, which updates the overlay
 * based on the current state of the text and slices.
 */
export class Overlay<T = string> implements Printable, Stateful {
  /**
   * @todo Make it an AVL tree.
   */
  public root: OverlayPoint<T> | undefined = undefined;
  public root2: OverlayPoint<T> | undefined = undefined;

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

  public first(): OverlayPoint<T> | undefined {
    return this.root ? first(this.root) : undefined;
  }

  public last(): OverlayPoint<T> | undefined {
    return this.root ? last(this.root) : undefined;
  }

  public firstMarker(): OverlayPoint<T> | undefined {
    return this.root2 ? first2(this.root2) : undefined;
  }

  public lastMarker(): OverlayPoint<T> | undefined {
    return this.root2 ? last2(this.root2) : undefined;
  }

  public get(point: Point<T>): OverlayPoint<T> | undefined {
    return find<Point<T>, OverlayPoint<T>>(this.root, point, spatialComparator as Comparator<Point<T>>);
  }

  public getMarker(point: Point<T>): OverlayPoint<T> | undefined {
    return find2<Point<T>, OverlayPoint<T>>(this.root2, point, spatialComparator as Comparator<Point<T>>);
  }

  /**
   * Retrieve overlay point or the previous one, measured in spacial dimension.
   */
  public getOrNextLower(point: Point<T>): OverlayPoint<T> | undefined {
    if (point.isAbsStart()) {
      const first = this.first();
      if (!first) return;
      return first.isAbsStart() ? first : void 0;
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
      return last.isAbsEnd() ? last : void 0;
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

  /**
   * Retrieve a {@link OverlayPoint} at the specified point or the
   * previous one, measured in spacial dimension.
   */
  public getOrNextLowerMarker(point: Point<T>): OverlayPoint<T> | undefined {
    if (point.isAbsStart()) {
      const first = this.firstMarker();
      if (!first) return;
      return first.isAbsStart() ? first : void 0;
    } else if (point.isAbsEnd()) return this.lastMarker();
    let curr: OverlayPoint<T> | undefined = this.root2;
    let result: OverlayPoint<T> | undefined = undefined;
    while (curr) {
      const cmp = curr.cmpSpatial(point);
      if (cmp === 0) return curr;
      if (cmp > 0) curr = curr.l2;
      else {
        const next = curr.r2;
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
    callback: (chunk: Chunk<T>, off: number, len: number) => boolean | void,
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
    return rga.range0(undefined, id1, id2, (chunk: Chunk<T>, off: number, len: number): boolean | void => {
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
      if (callback(chunk, off, len)) return true;
    }) as Chunk<T>;
  }

  public points0(after: undefined | OverlayPoint<T>, inclusive?: boolean): UndEndNext<OverlayPoint<T>> {
    let curr = after ? (inclusive ? after : next(after)) : this.first();
    return () => {
      const ret = curr;
      if (curr) curr = next(curr);
      return ret;
    };
  }

  public points(after?: undefined | OverlayPoint<T>, inclusive?: boolean): IterableIterator<OverlayPoint<T>> {
    return new UndEndIterator(this.points0(after, inclusive));
  }

  /**
   * Returns all {@link OverlayPoint} instances in the overlay, starting
   * from the given marker point, not including the marker point itself.
   *
   * If the `after` parameter is not provided, the iteration starts from the
   * first marker point in the overlay.
   *
   * @param after The marker point after which to start the iteration.
   * @returns All marker points in the overlay, starting from the given marker
   *     point.
   */
  public markers0(after: undefined | OverlayPoint<T>): UndEndNext<OverlayPoint<T>> {
    let curr = after ? next2(after) : first2(this.root2);
    return () => {
      const ret = curr;
      if (curr) curr = next2(curr);
      return ret;
    };
  }

  public markers(after?: undefined | OverlayPoint<T>): UndEndIterator<OverlayPoint<T>> {
    return new UndEndIterator(this.markers0(after));
  }

  /**
   * Returns all {@link OverlayPoint} instances in the overlay, starting
   * from a give {@link Point}, including any marker overlay points that are
   * at the same position as the given point.
   *
   * @param point Point (inclusive) from which to return all markers.
   * @returns All marker points in the overlay, starting from the given marker
   *     point.
   */
  public markersFrom0(point: Point<T>): UndEndNext<OverlayPoint<T>> {
    if (point.isAbsStart()) return this.markers0(undefined);
    let after = this.getOrNextLowerMarker(point);
    if (after && after.cmp(point) === 0) after = prev2(after);
    return this.markers0(after);
  }

  /**
   * Returns a pair of overlay marker points for each pair of adjacent marker
   * points in the overlay, starting from a given point (which may not be a
   * marker). The very first point in the first pair might be `undefined`, if
   * the given point is not a marker. Similarly, the very last point in the last
   * pair might be `undefined`, if the iteration end point is not a marker.
   *
   * @param start Start point of the iteration, inclusive.
   * @param end End point of the iteration. If not provided, the iteration
   *     continues until the end of the overlay.
   * @returns Iterator that returns pairs of overlay points.
   */
  public markerPairs0(start: Point<T>, end?: Point<T>): UndEndNext<OverlayPair<T>> {
    const i = this.markersFrom0(start);
    let closed = false;
    let p1: OverlayPoint<T> | undefined;
    let p2: OverlayPoint<T> | undefined = i();
    if (p2) {
      if (p2.isAbsStart() || !p2.cmp(start)) {
        p1 = p2;
        p2 = i();
      }
      if (end && p2) {
        const cmp = end.cmpSpatial(p2);
        if (cmp <= 0) return () => (closed ? void 0 : ((closed = true), [p1, cmp ? void 0 : p2]));
      }
    }
    return () => {
      if (closed) return;
      if (!p2 || p2.isAbsEnd()) return (closed = true), [p1, p2];
      else if (p2 && end) {
        const cmp = end.cmpSpatial(p2);
        if (cmp <= 0) {
          closed = true;
          return [p1, cmp ? void 0 : p2];
        }
      }
      const result: OverlayPair<T> = [p1, p2];
      p1 = p2;
      p2 = i();
      return result;
    };
  }

  public pairs0(after: undefined | OverlayPoint<T>, inclusive?: boolean): UndEndNext<OverlayPair<T>> {
    const isEmpty = !this.root;
    if (isEmpty) {
      const u = undefined;
      let closed = false;
      return () => (closed ? u : ((closed = true), [u, u]));
    }
    let p1: OverlayPoint<T> | undefined;
    let p2: OverlayPoint<T> | undefined = after;
    const iterator = this.points0(after, inclusive);
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

  public pairs(after?: undefined | OverlayPoint<T>, inclusive?: boolean): IterableIterator<OverlayPair<T>> {
    return new UndEndIterator(this.pairs0(after, inclusive));
  }

  public tuples0(after: undefined | OverlayPoint<T>, inclusive?: boolean): UndEndNext<OverlayTuple<T>> {
    const iterator = this.pairs0(after, inclusive);
    return () => {
      const pair = iterator();
      if (!pair) return;
      pair[0] ??= this.START;
      pair[1] ??= this.END;
      return pair as OverlayTuple<T>;
    };
  }

  public tuples(after?: undefined | OverlayPoint<T>, inclusive?: boolean): IterableIterator<OverlayTuple<T>> {
    return new UndEndIterator(this.tuples0(after, inclusive));
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
    let point = this.getOrNextLower(range.start) ?? this.first();
    if (!point) return result;
    do {
      if (!range.containsPoint(point)) continue;
      const slices = point.layers;
      const length = slices.length;
      for (let i = 0; i < length; i++) {
        const slice = slices[i];
        if (!result.has(slice) && range.contains(slice)) result.add(slice);
      }
      if (point instanceof OverlayPoint && point.isMarker()) {
        const marker = point.markers[0];
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
    let point: OverlayPoint<T> | undefined = this.getOrNextLower(range.start) ?? this.first();
    if (!point) return result;
    do {
      const slices = point.layers;
      const length = slices.length;
      for (let i = 0; i < length; i++) result.add(slices[i]);
      if (point instanceof OverlayPoint && point.isMarker()) {
        const marker = point.markers[0];
        if (marker) result.add(marker);
      }
    } while (point && (point = next(point)) && range.containsPoint(point));
    return result;
  }

  /**
   * Returns a summary of how different slice types overlap with the given range.
   *
   * @param range Range over which to search for slices.
   * @param endOnMarker If set to a positive number, the search will stop after
   *     the given number of marker points have been observed.
   * @returns Summary of the slices in this range. `complete` contains all
   *     "Overwrite" slice types, which overlay the full range, which have not
   *     been removed by "Erase" slice type. `partial` contains all "Overwrite"
   *     slice types, which mark a part of the range, and have not been removed
   *     by "Erase" slice type.
   */
  public stat(
    range: Range<T>,
    endOnMarker = 10,
  ): [complete: Set<SliceType>, partial: Set<SliceType>, markerCount: number] {
    const {start, end: end_} = range;
    let end = end_;
    const isSamePoint = start.cmp(end_) === 0;
    if (isSamePoint) {
      end = end.clone();
      end.halfstep(1);
    }
    const after = this.getOrNextLower(start);
    const hasLeadingPoint = !!after;
    const iterator = this.points0(after, true);
    let complete: Set<SliceType> = new Set<SliceType>();
    let partial: Set<SliceType> = new Set<SliceType>();
    let isFirst = true;
    let markerCount = 0;
    OVERLAY: for (let point = iterator(); point && point.cmpSpatial(end) < 0; point = iterator()) {
      if (point instanceof OverlayPoint && point.isMarker()) {
        markerCount++;
        if (markerCount >= endOnMarker) break;
        continue OVERLAY;
      }
      const current = new Set<SliceType>();
      const layers = point.layers;
      const length = layers.length;
      LAYERS: for (let i = 0; i < length; i++) {
        const slice = layers[i];
        const type = slice.type();
        if (typeof type === 'object') continue LAYERS;
        const stacking = slice.stacking;
        STACKING: switch (stacking) {
          case SliceStacking.One:
            current.add(type);
            break STACKING;
          case SliceStacking.Erase:
            current.delete(type);
            break STACKING;
        }
      }
      if (isFirst) {
        isFirst = false;
        if (hasLeadingPoint) complete = current;
        else partial = current;
        continue OVERLAY;
      }
      for (const type of complete)
        if (!current.has(type)) {
          complete.delete(type);
          partial.add(type);
        }
      for (const type of current) if (!complete.has(type)) partial.add(type);
    }
    return [complete, partial, markerCount];
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
    return op instanceof OverlayPoint && op.isMarker() && op.id.time === id.time && op.id.sid === id.sid;
  }

  public skipMarkers(point: Point<T>, direction: -1 | 1): boolean {
    while (true) {
      const isMarker = this.isMarker(point.id);
      if (!isMarker) return true;
      const end = point.step(direction);
      if (end) break;
    }
    return false;
  }

  /** ------------------------------------------------------ {@link Stateful} */

  public hash: number = 0;

  private clear(): void {
    this.root = void 0;
    this.root2 = void 0;
    this.slices.clear();
  }

  public refresh(slicesOnly: boolean = false): number {
    const {txt, slices} = this;
    let hash: number = CONST.START_STATE;
    {
      const {savedSlices, extraSlices, localSlices} = txt;
      const savedSlicesOldHash = savedSlices.hash;
      const savedSlicesHash = savedSlices.refresh();
      const savedSlicesChanged = savedSlicesOldHash !== savedSlicesHash;
      hash = updateNum(hash, savedSlicesHash);
      const extraSlicesOldHash = extraSlices.hash;
      const extraSlicesHash = extraSlices.refresh();
      const extraSlicesChanged = extraSlicesOldHash !== extraSlicesHash;
      hash = updateNum(hash, extraSlicesHash);
      const localSlicesOldHash = localSlices.hash;
      const localSlicesHash = localSlices.refresh();
      const localSlicesChanged = localSlicesOldHash !== localSlicesHash;
      hash = updateNum(hash, localSlicesHash);
      if (savedSlicesChanged || extraSlicesChanged || localSlicesChanged) {
        // this.clear();
        // savedSlices.forEach((slice) => {
        //   if (slice.isSplit()) this.insMarker(slice);
        //   else this.insSlice(slice);
        // });
        // extraSlices.forEach((slice) => {
        //   if (slice.isSplit()) this.insMarker(slice);
        //   else this.insSlice(slice);
        // });
        // localSlices.forEach((slice) => {
        //   if (slice.isSplit()) this.insMarker(slice);
        //   else this.insSlice(slice);
        // });

        if (savedSlicesChanged || extraSlicesChanged) {
          this.clear();
          // TODO: Implement complete rebuild routine from scratch. It should
          //       be efficient and fast: (1) retrieve all slices from all
          //       sources, (2) sort them by start point, (3) insert them into
          //       the overlay and update hashes in one go.
        } else if (localSlicesChanged) {
          slices.forEach((tuple, slice) => {
            const mutSlice = slice as Slice<T>;
            if (mutSlice.isDel?.()) this.delSlice(slice, tuple);
          });
        }
        if (savedSlicesChanged || extraSlicesChanged) {
          // biome-ignore lint: .forEach() is the way to iterate here.
          savedSlices.forEach((slice) => {
            if (slice.isMarker()) this.upsertSlice(slice);
            else this.upsertSlice(slice);
          });
          // biome-ignore lint: .forEach() is the way to iterate here.
          extraSlices.forEach((slice) => {
            if (slice.isMarker()) this.upsertSlice(slice);
            else this.upsertSlice(slice);
          });
        }
        if (localSlicesChanged || savedSlicesChanged || extraSlicesChanged) {
          const sliceSet = this.slices;
          // biome-ignore lint: .forEach() is the way to iterate here.
          localSlices.forEach((slice) => {
            const tuple = sliceSet.get(slice);
            if (tuple) {
              const positionMoved = tuple[0].cmp(slice.start) !== 0 || tuple[1].cmp(slice.end) !== 0;
              if (positionMoved) this.delSlice(slice, tuple);
            }
          });
          // biome-ignore lint: .forEach() is the way to iterate here.
          localSlices.forEach((slice) => {
            const tuple = slice.isMarker() ? this.upsertSlice(slice) : this.upsertSlice(slice);
            this.slices.set(slice, tuple);
          });
        }
      }
    }
    // TODO: Move text hash calculation out of the overlay.
    if (!slicesOnly) {
      // hash = updateRga(hash, txt.str);
      hash = this.refreshTextSlices(hash);
    }
    return (this.hash = hash);
  }

  public readonly slices = new Map<Slice<T>, [start: OverlayPoint<T>, end: OverlayPoint<T>]>();

  private upsertSlice(slice: Slice<T>): [start: OverlayPoint<T>, end: OverlayPoint<T>] {
    if (slice.isMarker()) {
      const start = slice.start;
      const overlayPointOrLower = this.getOrNextLower(start);
      if (overlayPointOrLower) {
        const isStart = !overlayPointOrLower.cmp(start);
        if (isStart) {
          overlayPointOrLower.addMarkerRef(slice);
          const markerOverlayPoint = this.getMarker(start);
          if (!markerOverlayPoint) this.root2 = insert2(this.root2, overlayPointOrLower, spatialComparator);
          return [overlayPointOrLower, overlayPointOrLower];
        }
      }
      const markerOverlayPointOrLower = this.getOrNextLowerMarker(start);
      if (markerOverlayPointOrLower) {
        const isStart = !markerOverlayPointOrLower.cmp(start);
        if (isStart) {
          markerOverlayPointOrLower.addMarkerRef(slice);
          this.root = insert(this.root, markerOverlayPointOrLower, spatialComparator);
          return [markerOverlayPointOrLower, markerOverlayPointOrLower];
        }
      }
      const point = new OverlayPoint(this.txt.str, start.id, Anchor.Before);
      point.addMarkerRef(slice);
      this.root = insert(this.root, point, spatialComparator);
      this.root2 = insert2(this.root2, point, spatialComparator);
      const prevPoint = prev(point);
      if (prevPoint) point.layers.push(...prevPoint.layers);
      return [point, point];
    }
    const x0 = slice.start;
    const x1 = slice.end;
    const [start, isStartNew] = this.upsertPoint(slice.start);
    const [end, isEndNew] = this.upsertPoint(slice.end);
    const isCollapsed = x0.cmp(x1) === 0;
    start.upsertStartRef(slice);
    end.upsertEndRef(slice);
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
    } else start.addMarker(slice);
    return [start, end];
  }

  private delSlice(slice: Slice<T>, [start, end]: [start: OverlayPoint<T>, end: OverlayPoint<T>]): void {
    if (slice instanceof Slice && slice.isMarker()) {
      this.slices.delete(slice);
      this.root2 = remove2(this.root2, start as OverlayPoint<T>);
      this.root = remove(this.root, start);
    } else {
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
  }

  /**
   * Inserts a point into the tree, sorted by spatial dimension.
   * Retrieve an existing {@link OverlayPoint} or create a new one, inserted
   * in the tree, sorted by spatial dimension.
   *
   * @param point Point to insert.
   * @returns Returns the existing point if it was already in the tree.
   */
  private upsertPoint(point: Point<T>): [point: OverlayPoint<T>, isNew: boolean] {
    let overlayPointOrLower = this.getOrNextLower(point);
    overlayPointOrLower ??= first(this.root);
    if (!overlayPointOrLower) return [(this.root = this.point(point.id, point.anchor)), true];
    if (overlayPointOrLower.cmp(point) === 0) return [overlayPointOrLower, false];
    const cmp = overlayPointOrLower.cmpSpatial(point);
    const overlayPoint = this.getMarker(point) ?? this.point(point.id, point.anchor);
    if (cmp < 0) insertRight(overlayPoint, overlayPointOrLower);
    else insertLeft(overlayPoint, overlayPointOrLower);
    if (this.root !== overlayPoint) this.root = splay(this.root!, overlayPoint, 10);
    return [overlayPoint, true];
  }

  private delPoint(point: OverlayPoint<T>): void {
    if (point.p2) this.root2 = remove2(this.root2, point);
    this.root = remove(this.root, point);
  }

  public leadingTextHash: number = 0;

  protected refreshTextSlices(stateTotal: number): number {
    const txt = this.txt;
    const str = txt.str;
    const firstChunk = str.first();
    if (!firstChunk) return stateTotal;
    let chunk: Chunk<T> | undefined = firstChunk;
    let marker: OverlayPoint<T> | undefined = undefined;
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
      for (const slice of p1.layers) state = updateNum(state, slice.hash);
      for (const slice of p1.markers) state = updateNum(state, slice.hash);
      p1.hash = overlayPointHash;
      stateTotal = updateNum(stateTotal, overlayPointHash);
      if (p2 && p2.isMarker()) {
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
    if (marker && marker.isMarker()) {
      marker.textHash = state;
    } else {
      this.leadingTextHash = state;
    }
    return stateTotal;
  }

  /** ----------------------------------------------------- {@link Printable} */

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
    const printMarkerPoint = (tab: string, point: OverlayPoint<T>): string => {
      return (
        point.toString(tab) +
        printBinary(tab, [
          !point.l2 ? null : (tab) => printMarkerPoint(tab, point.l2!),
          !point.r2 ? null : (tab) => printMarkerPoint(tab, point.r2!),
        ])
      );
    };
    return (
      `Overlay #${this.hash.toString(36)}` +
      printTree(tab, [
        !this.root ? null : (tab) => printPoint(tab, this.root!),
        !this.root2 ? null : (tab) => printMarkerPoint(tab, this.root2!),
      ])
    );
  }
}
