import {Point} from '../rga/Point';
import {Range} from '../rga/Range';
import {updateNode} from '../../../json-crdt/hash';
import {printTree} from '../../../util/print/printTree';
import {Anchor} from '../rga/constants';
import {SliceHeaderMask, SliceHeaderShift, SliceBehavior} from './constants';
import {CONST} from '../../../json-hash';
import {Timestamp} from '../../../json-crdt-patch/clock';
import {VecNode} from '../../../json-crdt/nodes';
import type {JsonNode} from '../../../json-crdt/nodes';
import type {ITimestampStruct} from '../../../json-crdt-patch/clock';
import type {ArrChunk} from '../../../json-crdt/nodes';
import type {Slice} from './types';
import type {Peritext} from '../Peritext';
import type {SliceDto, SliceType, Stateful} from '../types';
import type {Printable} from '../../../util/print/types';
import type {AbstractRga} from '../../../json-crdt/nodes/rga';

export const validateType = (type: SliceType) => {
  switch (typeof type) {
    case 'string':
    case 'number':
      return;
    case 'object': {
      if (!(type instanceof Array)) throw new Error('INVALID_TYPE');
      if (type.length > 32) throw new Error('INVALID_TYPE');
      const length = type.length;
      LOOP: for (let i = 0; i < length; i++) {
        const step = type[i];
        switch (typeof step) {
          case 'string':
          case 'number':
            continue LOOP;
          default:
            throw new Error('INVALID_TYPE');
        }
      }
      return;
    }
    default:
      throw new Error('INVALID_TYPE');
  }
};

export class PersistedSlice<T = string> extends Range<T> implements Slice<T>, Stateful, Printable {
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

  protected tagNode(): JsonNode | undefined {
    // TODO: Normalize `.get()` and `.getNode()` methods across VecNode and ArrNode.
    return this.tuple.get(3);
  }

  // -------------------------------------------------------------------- Slice

  public readonly id: ITimestampStruct;
  public behavior: SliceBehavior;
  public type: SliceType;

  public data(): unknown | undefined {
    return this.tuple.get(4)?.view();
  }

  public del(): boolean {
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
    const tagNode = this.tagNode();
    const header = `${this.constructor.name} ${super.toString(tab)}`;
    return header + printTree(tab, [!tagNode ? null : (tab) => tagNode.toString(tab)]);
  }
}
