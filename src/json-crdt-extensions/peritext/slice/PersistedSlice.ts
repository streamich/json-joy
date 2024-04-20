import {Point} from '../rga/Point';
import {Range} from '../rga/Range';
import {updateNode} from '../../../json-crdt/hash';
import {printTree} from '../../../util/print/printTree';
import {Anchor} from '../rga/constants';
import {SliceHeaderMask, SliceHeaderShift, SliceBehavior, SliceTupleIndex} from './constants';
import {CONST} from '../../../json-hash';
import {Timestamp, compare} from '../../../json-crdt-patch/clock';
import {VecNode} from '../../../json-crdt/nodes';
import {prettyOneLine} from '../../../json-pretty';
import {validateType} from './util';
import {s} from '../../../json-crdt-patch';
import type {JsonNode} from '../../../json-crdt/nodes';
import type {ITimestampStruct} from '../../../json-crdt-patch/clock';
import type {ArrChunk} from '../../../json-crdt/nodes';
import type {MutableSlice, SliceUpdateParams} from './types';
import type {Peritext} from '../Peritext';
import type {SliceDto, SliceType, Stateful} from '../types';
import type {Printable} from '../../../util/print/types';
import type {AbstractRga} from '../../../json-crdt/nodes/rga';

export class PersistedSlice<T = string> extends Range<T> implements MutableSlice<T>, Stateful, Printable {
  public static deserialize<T>(txt: Peritext, rga: AbstractRga<T>, chunk: ArrChunk, tuple: VecNode): PersistedSlice<T> {
    const header = +(tuple.get(0)!.view() as SliceDto[0]);
    const id1 = tuple.get(1)!.view() as ITimestampStruct;
    const id2 = (tuple.get(2)!.view() || id1) as ITimestampStruct;
    const type = tuple.get(3)!.view() as SliceType;
    if (typeof header !== 'number') throw new Error('INVALID_HEADER');
    if (!(id1 instanceof Timestamp)) throw new Error('INVALID_ID');
    if (!(id2 instanceof Timestamp)) throw new Error('INVALID_ID');
    validateType(type);
    const anchor1: Anchor = (header & SliceHeaderMask.X1Anchor) >>> SliceHeaderShift.X1Anchor;
    const anchor2: Anchor = (header & SliceHeaderMask.X2Anchor) >>> SliceHeaderShift.X2Anchor;
    const behavior: SliceBehavior = (header & SliceHeaderMask.Behavior) >>> SliceHeaderShift.Behavior;
    const p1 = new Point<T>(rga, id1, anchor1);
    const p2 = new Point<T>(rga, id2, anchor2);
    const slice = new PersistedSlice<T>(txt, rga, chunk, tuple, behavior, type, p1, p2);
    return slice;
  }

  constructor(
    /** The Peritext context. */
    protected readonly txt: Peritext,
    /** The text RGA. */
    protected readonly rga: AbstractRga<T>,
    /** The `arr` chunk of `arr` where the slice is stored. */
    protected readonly chunk: ArrChunk,
    /** The `vec` node which stores the serialized contents of this slice. */
    public readonly tuple: VecNode,
    behavior: SliceBehavior,
    type: SliceType,
    public start: Point<T>,
    public end: Point<T>,
  ) {
    super(rga, start, end);
    this.id = chunk.id;
    this.behavior = behavior;
    this.type = type;
  }

  public isSplit(): boolean {
    return this.behavior === SliceBehavior.Split;
  }

  protected tupleApi() {
    return this.txt.model.api.wrap(this.tuple);
  }

  // ------------------------------------------------------------- MutableSlice

  public readonly id: ITimestampStruct;
  public behavior: SliceBehavior;
  public type: SliceType;

  public update(params: SliceUpdateParams<T>): void {
    let updateHeader = false;
    let {start, end} = this;
    const changes: [number, unknown][] = [];
    if (params.behavior !== undefined) {
      this.behavior = params.behavior;
      updateHeader = true;
    }
    if (params.range) {
      const range = params.range;
      if (range.start.anchor !== start.anchor) updateHeader = true;
      if (range.end.anchor !== end.anchor) updateHeader = true;
      if (compare(range.start.id, start.id) !== 0) changes.push([SliceTupleIndex.X1, s.con(range.start.id)]);
      if (compare(range.end.id, end.id) !== 0) changes.push([SliceTupleIndex.X2, s.con(range.end.id)]);
      this.setRange(range);
    }
    if (params.type !== undefined) {
      this.type = params.type;
      changes.push([SliceTupleIndex.Type, s.con(this.type)]);
    }
    if (params.data !== undefined) changes.push([SliceTupleIndex.Data, s.con(params.data)]);
    if (updateHeader) {
      const header =
        (this.behavior << SliceHeaderShift.Behavior) +
        (this.start.anchor << SliceHeaderShift.X1Anchor) +
        (this.end.anchor << SliceHeaderShift.X2Anchor);
      changes.push([SliceTupleIndex.Header, s.con(header)]);
    }
    this.tupleApi().set(changes);
  }

  public data(): unknown | undefined {
    return this.tuple.get(SliceTupleIndex.Data)?.view();
  }

  public dataNode() {
    const node = this.tuple.get(SliceTupleIndex.Data);
    return node && this.txt.model.api.wrap(node);
  }

  public del(): void {
    this.txt.slices.del(this.id);
  }

  public isDel(): boolean {
    return this.chunk.del;
  }

  // ----------------------------------------------------------------- Stateful

  public hash: number = 0;

  public refresh(): number {
    let state = CONST.START_STATE;
    state = updateNode(state, this.tuple);
    const changed = state !== this.hash;
    this.hash = state;
    if (changed) {
      const tuple = this.tuple;
      const slice = PersistedSlice.deserialize(this.txt, this.rga, this.chunk, tuple);
      this.behavior = slice.behavior;
      this.type = slice.type;
      this.start = slice.start;
      this.end = slice.end;
    }
    return this.hash;
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = ''): string {
    const data = this.data();
    const header = `${this.constructor.name} ${super.toString(tab)}, ${this.behavior}, ${JSON.stringify(this.type)}`;
    return header + printTree(tab, [!data ? null : (tab) => prettyOneLine(data)]);
  }
}
