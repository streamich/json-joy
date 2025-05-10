import {AvlMap} from 'sonic-forest/lib/avl/AvlMap';
import {printTree} from 'tree-dump/lib/printTree';
import {PersistedSlice} from './PersistedSlice';
import {Timespan, compare, tss} from '../../../json-crdt-patch/clock';
import {updateRga} from '../../../json-crdt/hash';
import {CONST, updateNum} from '../../../json-hash/hash';
import {SliceBehavior, SliceHeaderShift, SliceTupleIndex} from './constants';
import {MarkerSlice} from './MarkerSlice';
import {VecNode} from '../../../json-crdt/nodes';
import {Chars} from '../constants';
import {Anchor} from '../rga/constants';
import type {Range} from '../rga/Range';
import type {Slice, SliceType} from './types';
import type {ITimespanStruct, ITimestampStruct} from '../../../json-crdt-patch/clock';
import type {Stateful} from '../types';
import type {Printable} from 'tree-dump/lib/types';
import type {ArrChunk, ArrNode} from '../../../json-crdt/nodes';
import type {AbstractRga} from '../../../json-crdt/nodes/rga';
import type {Peritext} from '../Peritext';
import type {UndefIterator} from '../../../util/iterator';

export class Slices<T = string> implements Stateful, Printable {
  private list = new AvlMap<ITimestampStruct, PersistedSlice<T>>(compare);

  protected readonly rga: AbstractRga<T>;

  constructor(
    /** The text RGA. */
    protected readonly txt: Peritext<T>,
    /** The `arr` node, used as a set, where slices are stored. */
    public readonly set: ArrNode,
  ) {
    this.rga = txt.str as unknown as AbstractRga<T>;
  }

  public ins<
    S extends PersistedSlice<T>,
    K extends new (
      ...args: ConstructorParameters<typeof PersistedSlice<T>>
    ) => S,
  >(
    range: Range<T>,
    behavior: SliceBehavior,
    type: SliceType,
    data?: unknown,
    Klass: K = behavior === SliceBehavior.Marker ? <any>MarkerSlice : PersistedSlice,
  ): S {
    const slicesModel = this.set.doc;
    const set = this.set;
    const api = slicesModel.api;
    const builder = api.builder;
    const tupleId = builder.vec();
    const start = range.start.clone();
    const end = range.end.clone();
    behavior = behavior & 0b111;
    const header =
      (behavior << SliceHeaderShift.Behavior) +
      ((start.anchor & 0b1) << SliceHeaderShift.X1Anchor) +
      ((end.anchor & 0b1) << SliceHeaderShift.X2Anchor);
    const headerId = builder.const(header);
    const x1Id = builder.const(start.id);
    const x2Id = builder.const(compare(start.id, end.id) === 0 ? 0 : end.id);
    const subtypeId = builder.const(type);
    const tupleKeysUpdate: [key: number, value: ITimestampStruct][] = [
      [SliceTupleIndex.Header, headerId],
      [SliceTupleIndex.X1, x1Id],
      [SliceTupleIndex.X2, x2Id],
      [SliceTupleIndex.Type, subtypeId],
    ];
    if (data !== undefined) tupleKeysUpdate.push([SliceTupleIndex.Data, builder.json(data)]);
    builder.insVec(tupleId, tupleKeysUpdate);
    const chunkId = builder.insArr(set.id, set.id, [tupleId]);
    // TODO: Consider using `s` schema here.
    api.apply();
    const tuple = slicesModel.index.get(tupleId) as VecNode;
    const chunk = set.findById(chunkId)!;
    // TODO: Need to check if split slice text was deleted
    const slice = new Klass(slicesModel, this.txt, chunk, tuple, behavior, type, start, end);
    this.list.set(chunk.id, slice);
    return slice;
  }

  public insMarker(range: Range<T>, type: SliceType, data?: unknown | ITimestampStruct): MarkerSlice<T> {
    return this.ins(range, SliceBehavior.Marker, type, data) as MarkerSlice<T>;
  }

  public insMarkerAfter(
    after: ITimestampStruct,
    type: SliceType,
    data?: unknown,
    separator: string = Chars.BlockSplitSentinel,
  ): MarkerSlice<T> {
    // TODO: test condition when cursors is at absolute or relative starts
    const txt = this.txt;
    const api = txt.model.api;
    const builder = api.builder;
    /**
     * We skip one clock cycle to prevent Block-wise RGA from merging adjacent
     * characters. We want the marker chunk to always be its own distinct chunk.
     */
    builder.nop(1);
    // TODO: Handle case when marker is inserted at the abs start, prevent abs start/end inserts.
    const textId = builder.insStr(txt.str.id, after, separator);
    api.apply();
    const point = txt.point(textId, Anchor.Before);
    const range = txt.range(point, point.clone());
    return this.insMarker(range, type, data);
  }

  public insStack(range: Range<T>, type: SliceType, data?: unknown | ITimestampStruct): PersistedSlice<T> {
    return this.ins(range, SliceBehavior.Many, type, data);
  }

  public insOne(range: Range<T>, type: SliceType, data?: unknown | ITimestampStruct): PersistedSlice<T> {
    return this.ins(range, SliceBehavior.One, type, data);
  }

  public insErase(range: Range<T>, type: SliceType, data?: unknown | ITimestampStruct): PersistedSlice<T> {
    return this.ins(range, SliceBehavior.Erase, type, data);
  }

  protected unpack(chunk: ArrChunk): PersistedSlice<T> {
    const txt = this.txt;
    const model = this.set.doc;
    const tupleId = chunk.data ? chunk.data[0] : undefined;
    if (!tupleId) throw new Error('SLICE_NOT_FOUND');
    const tuple = model.index.get(tupleId);
    if (!(tuple instanceof VecNode)) throw new Error('NOT_TUPLE');
    let slice = PersistedSlice.deserialize<T>(model, txt, chunk, tuple);
    if (slice.isSplit())
      slice = new MarkerSlice<T>(model, txt, chunk, tuple, slice.behavior, slice.type, slice.start, slice.end);
    return slice;
  }

  public get(id: ITimestampStruct): PersistedSlice<T> | undefined {
    return this.list.get(id);
  }

  public del(id: ITimestampStruct): void {
    this.list.del(id);
    const set = this.set;
    const api = set.doc.api;
    if (!set.findById(id)) return;
    // TODO: Is it worth checking if the slice is already deleted?
    api.builder.del(set.id, [tss(id.sid, id.time, 1)]);
    api.apply();
  }

  public delSlices(slices: Iterable<Slice<T>>): boolean {
    const set = this.set;
    const doc = set.doc;
    const api = doc.api;
    const spans: ITimespanStruct[] = [];
    for (const slice of slices) {
      if (slice instanceof PersistedSlice) {
        const id = slice.id;
        if (!set.findById(id)) continue;
        spans.push(new Timespan(id.sid, id.time, 1));
      }
    }
    if (!spans.length) return false;
    api.builder.del(this.set.id, spans);
    api.apply();
    return true;
  }

  public size(): number {
    return this.list._size;
  }

  public iterator0(): UndefIterator<Slice<T>> {
    const iterator = this.list.iterator0();
    return () => iterator()?.v;
  }

  public forEach(callback: (item: Slice<T>) => void): void {
    // biome-ignore lint: list is not iterable
    this.list.forEach((node) => callback(node.v));
  }

  // ----------------------------------------------------------------- Stateful

  private _topologyHash: number = 0;
  public hash: number = 0;

  public refresh(): number {
    const topologyHash = updateRga(CONST.START_STATE, this.set);
    if (topologyHash !== this._topologyHash) {
      this._topologyHash = topologyHash;
      let chunk: ArrChunk | undefined;
      for (const iterator = this.set.iterator(); (chunk = iterator()); ) {
        const item = this.list.get(chunk.id);
        if (chunk.del) {
          if (item) this.list.del(chunk.id);
        } else {
          if (!item) this.list.set(chunk.id, this.unpack(chunk));
        }
      }
    }
    let hash: number = topologyHash;
    // biome-ignore lint: slices is not iterable
    this.list.forEach(({v: item}) => {
      item.refresh();
      hash = updateNum(hash, item.hash);
    });
    return (this.hash = hash);
  }

  // ---------------------------------------------------------------- Printable

  public toStringName(): string {
    return 'Slices';
  }

  public toString(tab: string = ''): string {
    return (
      this.toStringName() +
      printTree(
        tab,
        [...this.list.entries()].map(
          ({v}) =>
            (tab) =>
              v.toString(tab),
        ),
      )
    );
  }
}
