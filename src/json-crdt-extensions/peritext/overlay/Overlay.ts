import {printTree} from 'tree-dump/lib/printTree';
import {printBinary} from 'tree-dump/lib/printBinary';
import {first, insertLeft, insertRight, next, prev, remove} from 'sonic-forest/lib/util';
import {splay} from 'sonic-forest/lib/splay/util';
import {Anchor} from '../rga/constants';
import {Point} from '../rga/Point';
import {OverlayPoint} from './OverlayPoint';
import {MarkerOverlayPoint} from './MarkerOverlayPoint';
import {OverlayRefSliceEnd, OverlayRefSliceStart} from './refs';
import {equal, ITimestampStruct} from '../../../json-crdt-patch/clock';
import {CONST, updateNum} from '../../../json-hash';
import {MarkerSlice} from '../slice/MarkerSlice';
import {firstVis} from '../../../json-crdt/nodes/rga/util';
import type {Peritext} from '../Peritext';
import type {Stateful} from '../types';
import type {Printable} from 'tree-dump/lib/types';
import type {MutableSlice, Slice} from '../slice/types';
import type {Slices} from '../slice/Slices';

export class Overlay implements Printable, Stateful {
  public root: OverlayPoint | undefined = undefined;

  constructor(protected readonly txt: Peritext) {}

  /**
   * @todo Rename to .point().
   */
  protected overlayPoint(id: ITimestampStruct, anchor: Anchor): OverlayPoint {
    return new OverlayPoint(this.txt.str, id, anchor);
  }

  protected markerPoint(marker: MarkerSlice, anchor: Anchor): OverlayPoint {
    return new MarkerOverlayPoint(this.txt.str, marker.start.id, anchor, marker);
  }

  public first(): OverlayPoint | undefined {
    return this.root ? first(this.root) : undefined;
  }

  public iterator(): () => OverlayPoint | undefined {
    let curr = this.first();
    return () => {
      const ret = curr;
      if (curr) curr = next(curr);
      return ret;
    };
  }

  public splitIterator(): () => MarkerOverlayPoint | undefined {
    let curr = this.first();
    return () => {
      while (curr) {
        const ret = curr;
        if (curr) curr = next(curr);
        if (ret instanceof MarkerOverlayPoint) return ret;
      }
      return undefined;
    };
  }

  /**
   * Retrieve overlay point or the previous one, measured in spacial dimension.
   */
  public getOrNextLower(point: Point): OverlayPoint | undefined {
    let curr: OverlayPoint | undefined = this.root;
    let result: OverlayPoint | undefined = undefined;
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

  public find(predicate: (point: OverlayPoint) => boolean): OverlayPoint | undefined {
    let point = this.first();
    while (point) {
      if (predicate(point)) return point;
      point = next(point);
    }
    return undefined;
  }

  // ----------------------------------------------------------------- Stateful

  public hash: number = 0;

  public refresh(slicesOnly: boolean = false): number {
    const txt = this.txt;
    let hash: number = CONST.START_STATE;
    hash = this.refreshSlices(hash, txt.savedSlices);
    hash = this.refreshSlices(hash, txt.localSlices);
    // hash = this.refreshCursor(hash);
    // TODO: refresh ephemeral slices
    // if (!slicesOnly) this.computeSplitTextHashes();
    return (this.hash = hash);
  }

  public readonly slices = new Map<Slice, [start: OverlayPoint, end: OverlayPoint]>();

  private refreshSlices(state: number, slices: Slices): number {
    const oldSlicesHash = slices.hash;
    const changed = oldSlicesHash !== slices.refresh();
    const sliceSet = this.slices;
    state = updateNum(state, slices.hash);
    if (changed) {
      slices.forEach((slice) => {
        let tuple: [start: OverlayPoint, end: OverlayPoint] | undefined = sliceSet.get(slice);
        if (tuple) {
          if ((slice as any).isDel && (slice as any).isDel()) {
            this.delSlice(slice, tuple);
            return;
          }
          const positionMoved = tuple[0].cmp(slice.start) !== 0 || tuple[1].cmp(slice.end) !== 0;
          if (positionMoved) this.delSlice(slice, tuple);
          else return;
        }
        tuple = this.insSlice(slice);
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

  private refreshCursor(state: number): number {
    const cursor = this.txt.editor.cursor;
    let tuple: [start: OverlayPoint, end: OverlayPoint] | undefined = this.slices.get(cursor);
    const positionMoved = tuple && (tuple[0].cmp(cursor.start) !== 0 || tuple[1].cmp(cursor.end) !== 0);
    if (tuple && positionMoved) {
      this.delSlice(cursor, tuple!);
    }
    if (!tuple || positionMoved) {
      tuple = this.insSlice(cursor);
      this.slices.set(cursor, tuple);
    }
    return state;
  }

  /**
   * Retrieve an existing {@link OverlayPoint} or create a new one, inserted
   * in the tree, sorted by spatial dimension.
   */
  protected upsertPoint(point: Point): [point: OverlayPoint, isNew: boolean] {
    const newPoint = this.overlayPoint(point.id, point.anchor);
    const pivot = this.insertPoint(newPoint);
    if (pivot) return [pivot, false];
    return [newPoint, true];
  }

  /**
   * Inserts a point into the tree, sorted by spatial dimension.
   * @param point Point to insert.
   * @returns Returns the existing point if it was already in the tree.
   */
  protected insertPoint(point: OverlayPoint): OverlayPoint | undefined {
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
    return undefined;
  }

  protected delPoint(point: OverlayPoint): void {
    this.root = remove(this.root, point);
  }

  protected insSplit(slice: MarkerSlice): [start: OverlayPoint, end: OverlayPoint] {
    const point = this.markerPoint(slice, Anchor.Before);
    const pivot = this.insertPoint(point);
    if (!pivot) {
      point.refs.push(slice);
      const prevPoint = prev(point);
      if (prevPoint) point.layers.push(...prevPoint.layers);
    }
    return [point, point];
  }

  private insSlice(slice: Slice): [start: OverlayPoint, end: OverlayPoint] {
    if (slice instanceof MarkerSlice) return this.insSplit(slice);
    const txt = this.txt;
    const str = txt.str;
    let startPoint = slice.start;
    let endPoint = slice.end;
    const startIsStringRoot = equal(startPoint.id, str.id);
    if (startIsStringRoot) {
      const firstVisibleChunk = firstVis(txt.str);
      if (firstVisibleChunk) {
        startPoint = txt.point(firstVisibleChunk.id, Anchor.Before);
        const endIsStringRoot = equal(endPoint.id, str.id);
        if (endIsStringRoot) {
          endPoint = txt.point(firstVisibleChunk.id, Anchor.Before);
        }
      }
    }
    const [start, isStartNew] = this.upsertPoint(startPoint);
    const [end, isEndNew] = this.upsertPoint(endPoint);
    start.refs.push(new OverlayRefSliceStart(slice));
    end.refs.push(new OverlayRefSliceEnd(slice));
    if (isStartNew) {
      const beforeStartPoint = prev(start);
      if (beforeStartPoint) start.layers.push(...beforeStartPoint.layers);
    }
    if (isEndNew) {
      const beforeEndPoint = prev(end);
      if (beforeEndPoint) end.layers.push(...beforeEndPoint.layers);
    }
    const isCollapsed = startPoint.cmp(endPoint) === 0;
    let curr: OverlayPoint | undefined = start;
    while (curr !== end && curr) {
      curr.addLayer(slice);
      curr = next(curr);
    }
    if (!isCollapsed) {
    } else {
      start.addMarker(slice);
    }
    return [start, end];
  }

  private delSlice(slice: Slice, [start, end]: [start: OverlayPoint, end: OverlayPoint]): void {
    this.slices.delete(slice);
    let curr: OverlayPoint | undefined = start;
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

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = ''): string {
    const printPoint = (tab: string, point: OverlayPoint): string => {
      return (
        point.toString(tab) +
        printBinary(tab, [
          !point.l ? null : (tab) => printPoint(tab, point.l!),
          !point.r ? null : (tab) => printPoint(tab, point.r!),
        ])
      );
    };
    return `${this.constructor.name} #${this.hash.toString(36)}` + printTree(tab, [!this.root ? null : (tab) => printPoint(tab, this.root!)]);
  }
}
