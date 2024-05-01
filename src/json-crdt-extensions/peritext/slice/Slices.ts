import {AvlMap} from 'sonic-forest/lib/avl/AvlMap';
import {printTree} from 'tree-dump/lib/printTree';
import {PersistedSlice} from './PersistedSlice';
import {Timespan, compare, tss} from '../../../json-crdt-patch/clock';
import {Range} from '../rga/Range';
import {updateRga} from '../../../json-crdt/hash';
import {CONST, updateNum} from '../../../json-hash';
import {SliceBehavior, SliceHeaderShift, SliceTupleIndex} from './constants';
import {MarkerSlice} from './MarkerSlice';
import {VecNode} from '../../../json-crdt/nodes';
import type {Slice} from './types';
import type {ITimespanStruct, ITimestampStruct} from '../../../json-crdt-patch/clock';
import type {SliceType, Stateful} from '../types';
import type {Peritext} from '../Peritext';
import type {Printable} from 'tree-dump/lib/types';
import type {ArrChunk, ArrNode} from '../../../json-crdt/nodes';

export class Slices implements Stateful, Printable {
  private list = new AvlMap<ITimestampStruct, PersistedSlice>(compare);

  constructor(
    public readonly txt: Peritext,
    public readonly set: ArrNode,
  ) {}

  public ins(range: Range, behavior: SliceBehavior, type: SliceType, data?: unknown): PersistedSlice {
    const peritext = this.txt;
    const model = peritext.model;
    const set = this.set;
    const api = model.api;
    const builder = api.builder;
    const tupleId = builder.vec();
    const start = range.start.clone();
    const end = range.end.clone();
    const header =
      (behavior << SliceHeaderShift.Behavior) +
      (start.anchor << SliceHeaderShift.X1Anchor) +
      (end.anchor << SliceHeaderShift.X2Anchor);
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
    api.apply();
    const tuple = model.index.get(tupleId) as VecNode;
    const chunk = set.findById(chunkId)!;
    // TODO: Need to check if split slice text was deleted
    const txt = this.txt;
    const slice =
      behavior === SliceBehavior.Marker
        ? new MarkerSlice(txt, txt.str, chunk, tuple, behavior, type, start, end)
        : new PersistedSlice(txt, txt.str, chunk, tuple, behavior, type, start, end);
    this.list.set(chunk.id, slice);
    return slice;
  }

  public insMarker(range: Range, type: SliceType, data?: unknown): MarkerSlice {
    return this.ins(range, SliceBehavior.Marker, type, data) as MarkerSlice;
  }

  public insStack(range: Range, type: SliceType, data?: unknown): PersistedSlice {
    return this.ins(range, SliceBehavior.Stack, type, data);
  }

  public insOverwrite(range: Range, type: SliceType, data?: unknown): PersistedSlice {
    return this.ins(range, SliceBehavior.Overwrite, type, data);
  }

  public insErase(range: Range, type: SliceType, data?: unknown): PersistedSlice {
    return this.ins(range, SliceBehavior.Erase, type, data);
  }

  protected unpack(chunk: ArrChunk): PersistedSlice {
    const txt = this.txt;
    const rga = txt.str;
    const model = txt.model;
    const tupleId = chunk.data ? chunk.data[0] : undefined;
    if (!tupleId) throw new Error('SLICE_NOT_FOUND');
    const tuple = model.index.get(tupleId);
    if (!(tuple instanceof VecNode)) throw new Error('NOT_TUPLE');
    let slice = PersistedSlice.deserialize(txt, rga, chunk, tuple);
    if (slice.isSplit())
      slice = new MarkerSlice(txt, rga, chunk, tuple, slice.behavior, slice.type, slice.start, slice.end);
    return slice;
  }

  public get(id: ITimestampStruct): PersistedSlice | undefined {
    return this.list.get(id);
  }

  public del(id: ITimestampStruct): void {
    this.list.del(id);
    const api = this.txt.model.api;
    api.builder.del(this.set.id, [tss(id.sid, id.time, 1)]);
    api.apply();
  }

  public delSlices(slices: Slice[]): void {
    const api = this.txt.model.api;
    const spans: ITimespanStruct[] = [];
    const length = slices.length;
    for (let i = 0; i < length; i++) {
      const slice = slices[i];
      if (slice instanceof PersistedSlice) {
        const id = slice.id;
        spans.push(new Timespan(id.sid, id.time, 1));
      }
    }
    api.builder.del(this.set.id, spans);
    api.apply();
  }

  public size(): number {
    return this.list._size;
  }

  public forEach(callback: (item: Slice) => void): void {
    this.list.forEach((node) => callback(node.v));
    callback(this.txt.editor.cursor);
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
    this.list.forEach(({v: item}) => {
      item.refresh();
      hash = updateNum(hash, item.hash);
    });
    return (this.hash = hash);
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = ''): string {
    return (
      this.constructor.name +
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
