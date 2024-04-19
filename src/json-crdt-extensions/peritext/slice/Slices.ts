import {PersistedSlice} from './PersistedSlice';
import {ITimespanStruct, ITimestampStruct, Timespan, Timestamp, compare, tss} from '../../../json-crdt-patch/clock';
import {Range} from './Range';
import {updateRga} from '../../../json-crdt/hash';
import {CONST, updateNum} from '../../../json-hash';
import {printTree} from '../../../util/print/printTree';
import {Anchor, SliceBehavior, SliceHeaderMask, SliceHeaderShift} from '../constants';
import {SplitSlice} from './SplitSlice';
import {Point} from '../rga/Point';
import {Slice} from './types';
import {VecNode} from '../../../json-crdt/nodes';
import type {SliceDto, SliceType, Stateful} from '../types';
import type {Peritext} from '../Peritext';
import type {Printable} from '../../../util/print/types';
import type {ArrChunk, ArrNode} from '../../../json-crdt/nodes';

export class Slices implements Stateful, Printable {
  private list = new Map<ArrChunk, PersistedSlice>();

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
    const start = range.start;
    const end = range.end;
    const header =
      (behavior << SliceHeaderShift.Behavior) +
      (start.anchor << SliceHeaderShift.X1Anchor) +
      (end.anchor << SliceHeaderShift.X2Anchor);
    const headerId = builder.const(header);
    const x1Id = builder.const(start.id);
    const x2Id = builder.const(compare(start.id, end.id) === 0 ? 0 : end.id);
    const subtypeId = builder.const(type);
    const tupleKeysUpdate: [key: number, value: ITimestampStruct][] = [
      [0, headerId],
      [1, x1Id],
      [2, x2Id],
      [3, subtypeId],
    ];
    if (data !== undefined) tupleKeysUpdate.push([4, builder.json(data)]);
    builder.insVec(tupleId, tupleKeysUpdate);
    const chunkId = builder.insArr(set.id, set.id, [tupleId]);
    api.apply();
    const tuple = model.index.get(tupleId) as VecNode;
    const chunk = set.findById(chunkId)!;
    // TODO: Need to check if split slice text was deleted
    const txt = this.txt;
    const slice =
      behavior === SliceBehavior.Split
        ? new SplitSlice(txt, txt.str, chunk, tuple, behavior, start, end, type)
        : new PersistedSlice(txt, txt.str, chunk, tuple, behavior, start, end, type);
    this.list.set(chunk, slice);
    return slice;
  }

  protected unpack(chunk: ArrChunk): PersistedSlice {
    const txt = this.txt;
    const model = txt.model;
    const tupleId = chunk.data ? chunk.data[0] : undefined;
    if (!tupleId) throw new Error('MARKER_NOT_FOUND');
    const tuple = model.index.get(tupleId);
    if (!(tuple instanceof VecNode)) throw new Error('NOT_TUPLE');
    const header = +(tuple.get(0)!.view() as SliceDto[0]);
    const anchor1: Anchor = (header & SliceHeaderMask.X1Anchor) >>> SliceHeaderShift.X1Anchor;
    const anchor2: Anchor = (header & SliceHeaderMask.X2Anchor) >>> SliceHeaderShift.X2Anchor;
    const behavior: SliceBehavior = (header & SliceHeaderMask.Behavior) >>> SliceHeaderShift.Behavior;
    const id1 = tuple.get(1)!.view() as ITimestampStruct;
    const id2 = (tuple.get(2)!.view() || id1) as ITimestampStruct;
    if (!(id1 instanceof Timestamp)) throw new Error('INVALID_ID');
    if (!(id2 instanceof Timestamp)) throw new Error('INVALID_ID');
    const p1 = new Point(txt.str, id1, anchor1);
    const p2 = new Point(txt.str, id2, anchor2);
    const type = tuple.get(3)!.view() as SliceType;
    const slice =
      behavior === SliceBehavior.Split
        ? new SplitSlice(txt, txt.str, chunk, tuple, behavior, p1, p2, type)
        : new PersistedSlice(txt, txt.str, chunk, tuple, behavior, p1, p2, type);
    return slice;
  }

  public del(id: ITimestampStruct): void {
    const api = this.txt.model.api;
    api.builder.del(this.set.id, [tss(id.sid, id.time, 1)]);
    api.apply();
  }

  public delMany(slices: Slice[]): void {
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
    return this.list.size;
  }

  public forEach(callback: (item: PersistedSlice) => void): void {
    this.list.forEach(callback);
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
        const item = this.list.get(chunk);
        if (chunk.del) {
          if (item) this.list.delete(chunk);
        } else {
          if (!item) this.list.set(chunk, this.unpack(chunk));
        }
      }
    }
    let hash: number = topologyHash;
    this.list.forEach((item) => {
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
        [...this.list].map(
          ([, slice]) =>
            (tab) =>
              slice.toString(tab),
        ),
      )
    );
  }
}
