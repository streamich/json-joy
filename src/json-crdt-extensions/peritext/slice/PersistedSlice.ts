import {Point} from '../rga/Point';
import {Range} from '../rga/Range';
import {hashNode} from '../../../json-crdt/hash';
import {printTree} from '../../../util/print/printTree';
import {Anchor, SliceHeaderMask, SliceHeaderShift, SliceBehavior} from '../constants';
import {ArrChunk} from '../../../json-crdt/nodes';
import {type ITimestampStruct, Timestamp} from '../../../json-crdt-patch/clock';
import type {Slice} from './types';
import type {Peritext} from '../Peritext';
import type {SliceDto, SliceType, Stateful} from '../types';
import type {Printable} from '../../../util/print/types';
import type {JsonNode, VecNode} from '../../../json-crdt/nodes';
import type {AbstractRga} from '../../../json-crdt/nodes/rga';

export class PersistedSlice<T = string> extends Range<T> implements Slice<T>, Printable, Stateful {
  constructor(
    protected readonly txt: Peritext,
    protected readonly rga: AbstractRga<T>,
    protected readonly chunk: ArrChunk,
    public readonly tuple: VecNode,
    behavior: SliceBehavior,
    /** @todo Rename to x1? */
    public start: Point<T>,
    /** @todo Rename to x2? */
    public end: Point<T>,
    type: SliceType,
  ) {
    super(rga, start, end);
    this.id = this.chunk.id;
    this.behavior = behavior;
    this.type = type;
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

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = ''): string {
    const tagNode = this.tagNode();
    const range = `${this.start.toString('', true)} ↔ ${this.end.toString('', true)}`;
    const header = `${this.constructor.name} ${range}`;
    return header + printTree(tab, [!tagNode ? null : (tab) => tagNode.toString(tab)]);
  }

  // ----------------------------------------------------------------- Stateful

  public hash: number = 0;

  public refresh(): number {
    const hash = hashNode(this.tuple);
    const changed = hash !== this.hash;

    // TODO: Add .refresh() to Range.

    this.hash = hash;
    if (changed) {
      const tuple = this.tuple;
      const header = +(tuple.get(0)!.view() as SliceDto[0]);
      const anchor1: Anchor = (header & SliceHeaderMask.X1Anchor) >>> SliceHeaderShift.X1Anchor;
      const anchor2: Anchor = (header & SliceHeaderMask.X2Anchor) >>> SliceHeaderShift.X2Anchor;
      const type: SliceBehavior = (header & SliceHeaderMask.Behavior) >>> SliceHeaderShift.Behavior;
      const id1 = tuple.get(1)!.view() as ITimestampStruct;
      const id2 = (tuple.get(2)!.view() || id1) as ITimestampStruct;
      if (!(id1 instanceof Timestamp)) throw new Error('INVALID_ID');
      if (!(id2 instanceof Timestamp)) throw new Error('INVALID_ID');
      const subtype = tuple.get(3)!.view() as SliceType;
      this.behavior = type;
      this.type = subtype;
      const x1 = this.start;
      const x2 = this.end;
      x1.id = id1;
      x1.anchor = anchor1;
      x2.id = id2;
      x2.anchor = anchor2;
    }
    return this.hash;
  }
}
