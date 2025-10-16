import {hasOwnProperty as hasOwnProp} from '@jsonjoy.com/util/lib/hasOwnProperty';
import {Point} from '../rga/Point';
import {Range} from '../rga/Range';
import {updateNode} from '../../../json-crdt/hash';
import {printTree} from 'tree-dump/lib/printTree';
import type {Anchor} from '../rga/constants';
import {
  SliceHeaderMask,
  SliceHeaderShift,
  SliceStacking,
  SliceTupleIndex,
  SliceStackingName,
  SliceTypeName,
  SliceTypeCon,
} from './constants';
import {CONST} from '../../../json-hash/hash';
import {Timestamp} from '../../../json-crdt-patch/clock';
import {prettyOneLine} from '../../../json-pretty';
import {validateType} from './util';
import {NodeBuilder, s} from '../../../json-crdt-patch';
import * as schema from './schema';
import {JsonCrdtDiff} from '../../../json-crdt-diff/JsonCrdtDiff';
import {type ArrApi, ConApi, type Model, type NodeApi, ObjApi, VecApi} from '../../../json-crdt/model';
import {ArrNode, ConNode, type ObjNode, type VecNode} from '../../../json-crdt/nodes';
import {NestedType} from './NestedType';
import type {ITimestampStruct} from '../../../json-crdt-patch/clock';
import type {ArrChunk, JsonNode} from '../../../json-crdt/nodes';
import type {MutableSlice, SliceView, SliceType, SliceUpdateParams, SliceTypeSteps, SliceTypeStep} from './types';
import type {Stateful} from '../types';
import type {Printable} from 'tree-dump/lib/types';
import type {AbstractRga} from '../../../json-crdt/nodes/rga';
import type {Peritext} from '../Peritext';
import type {Slices} from './Slices';

/**
 * A persisted slice is a slice that is stored in a {@link Model}. It is used for
 * rich-text formatting and annotations.
 *
 * @todo Maybe rename to "saved", "stored", "mutable".
 */
export class PersistedSlice<T = string> extends Range<T> implements MutableSlice<T>, Stateful, Printable {
  public static deserialize<T>(model: Model, txt: Peritext<T>, chunk: ArrChunk, tuple: VecNode): PersistedSlice<T> {
    const header = +(tuple.get(0)!.view() as SliceView[0]);
    const id1 = tuple.get(1)!.view() as ITimestampStruct;
    const id2 = (tuple.get(2)!.view() || id1) as ITimestampStruct;
    if (typeof header !== 'number') throw new Error('INVALID_HEADER');
    if (!(id1 instanceof Timestamp)) throw new Error('INVALID_ID');
    if (!(id2 instanceof Timestamp)) throw new Error('INVALID_ID');
    const anchor1: Anchor = (header & SliceHeaderMask.X1Anchor) >>> SliceHeaderShift.X1Anchor;
    const anchor2: Anchor = (header & SliceHeaderMask.X2Anchor) >>> SliceHeaderShift.X2Anchor;
    const stacking: SliceStacking = (header & SliceHeaderMask.Stacking) >>> SliceHeaderShift.Stacking;
    const rga = txt.str as unknown as AbstractRga<T>;
    const p1 = new Point<T>(rga, id1, anchor1);
    const p2 = new Point<T>(rga, id2, anchor2);
    const slice = new PersistedSlice<T>(model, txt, chunk, tuple, stacking, p1, p2);
    validateType(slice.type());
    return slice;
  }

  /** @todo Use API node here. */
  protected readonly rga: AbstractRga<T>;

  constructor(
    /** The `Model` where the slice is stored. */
    protected readonly model: Model,
    /** The Peritext context. */
    protected readonly txt: Peritext<T>,
    /** The `arr` chunk of `arr` where the slice is stored. */
    protected readonly chunk: ArrChunk,
    /** The `vec` node which stores the serialized contents of this slice. */
    public readonly tuple: VecNode,
    stacking: SliceStacking,
    public start: Point<T>,
    public end: Point<T>,
  ) {
    super(txt.str as unknown as AbstractRga<T>, start, end);
    this.rga = txt.str as unknown as AbstractRga<T>;
    this.id = chunk.id;
    this.stacking = stacking;
  }

  public isSplit(): boolean {
    return this.stacking === SliceStacking.Marker;
  }

  protected tupleApi() {
    return this.model.api.wrap(this.tuple);
  }

  // protected setType(schema: NodeBuilder): void {
  //   this.tupleApi().set([
  //     [SliceTupleIndex.Type, schema.type(type as SliceTypeSteps)],
  //   ]);
  // }

  // ---------------------------------------------------------------- mutations

  public set(start: Point<T>, end: Point<T> = start): void {
    super.set(start, end);
    this.update({range: this});
  }

  /**
   * Expand range left and right to contain all invisible space: (1) tombstones,
   * (2) anchors of non-deleted adjacent chunks.
   */
  public expand(): void {
    super.expand();
    this.update({range: this});
  }

  /** -------------------------------------------------- {@link MutableSlice} */

  public readonly id: ITimestampStruct;
  public stacking: SliceStacking;

  public update(params: SliceUpdateParams<T>): void {
    let updateHeader = false;
    const changes: [number, unknown][] = [];
    const stacking = params.stacking;
    if (stacking !== undefined) {
      this.stacking = stacking;
      updateHeader = true;
    }
    const range = params.range;
    if (range) {
      updateHeader = true;
      changes.push([SliceTupleIndex.X1, s.con(range.start.id)], [SliceTupleIndex.X2, s.con(range.end.id)]);
      this.start = range.start;
      this.end = range.start === range.end ? range.end.clone() : range.end;
    }
    if (params.type !== undefined) {
      changes.push([SliceTupleIndex.Type, params.type instanceof NodeBuilder ? params.type : s.jsonCon(params.type)]);
    }
    if (hasOwnProp(params, 'data')) changes.push([SliceTupleIndex.Data, params.data]);
    if (updateHeader) {
      const header =
        (this.stacking << SliceHeaderShift.Stacking) +
        (this.start.anchor << SliceHeaderShift.X1Anchor) +
        (this.end.anchor << SliceHeaderShift.X2Anchor);
      changes.push([SliceTupleIndex.Header, s.con(header)]);
    }
    this.tupleApi().set(changes);
  }

  public getStore(): Slices<T> | undefined {
    const txt = this.txt;
    const sid = this.id.sid;
    let store = txt.savedSlices;
    if (sid === store.set.doc.clock.sid) return store;
    store = txt.localSlices;
    if (sid === store.set.doc.clock.sid) return store;
    store = txt.extraSlices;
    if (sid === store.set.doc.clock.sid) return store;
    return;
  }

  public del(): void {
    const store = this.getStore();
    if (!store) return;
    store.del(this.id);
  }

  public isDel(): boolean {
    return this.chunk.del;
  }

  // -------------------------------------------------- slice type manipulation

  public typeNode() {
    return this.tuple.get(SliceTupleIndex.Type);
  }

  public typeApi() {
    const node = this.typeNode();
    if (!node) return;
    return this.model.api.wrap(node);
  }

  public nestedType(): NestedType<T> {
    return new NestedType<T>(this);
  }

  public type(): SliceType {
    return this.typeNode()?.view() as SliceType;
  }

  public typeSteps(): SliceTypeSteps {
    const type = this.type() ?? SliceTypeCon.p;
    return Array.isArray(type) ? type : [type];
  }

  // -------------------------------------------------- slice data manipulation

  public data(): unknown | undefined {
    return this.tuple.get(SliceTupleIndex.Data)?.view();
  }

  public dataNode(): NodeApi<JsonNode<unknown>> | undefined {
    const node = this.tuple.get(SliceTupleIndex.Data);
    return node && this.model.api.wrap(node);
  }

  public dataAsObj(): ObjApi<ObjNode> {
    const node = this.dataNode();
    if (!(node instanceof ObjApi)) {
      this.tupleApi().set([[SliceTupleIndex.Data, s.obj({})]]);
    }
    return this.dataNode() as unknown as ObjApi<ObjNode>;
  }

  /**
   * Overwrites the data of this slice with the given data.
   *
   * @param data Data to set for this slice. The data can be any JSON value, but
   *     it is recommended to use an object.
   */
  public setData(data: unknown): void {
    this.tupleApi().set([[SliceTupleIndex.Data, s.jsonCon(data)]]);
  }

  /**
   * Merges object data into the slice's data using JSON CRDT diffing.
   *
   * @param data Data to merge into the slice. If the data is an object, it will be
   *     merged with the existing data of the slice using JSON CRDT diffing.
   */
  public mergeData(data: unknown): void {
    const {model} = this;
    const diff = new JsonCrdtDiff(model);
    if (this.dataNode() instanceof ObjApi && !!data && typeof data === 'object' && !Array.isArray(data)) {
      const dataNode = this.dataAsObj();
      const patch = diff.diff(dataNode.node, data);
      model.applyPatch(patch);
    } else this.setData(data);
  }

  /** ------------------------------------------------------ {@link Stateful} */

  public hash: number = 0;

  public refresh(): number {
    let state = CONST.START_STATE;
    state = updateNode(state, this.tuple);
    const changed = state !== this.hash;
    this.hash = state;
    if (changed) {
      const tuple = this.tuple;
      const slice = PersistedSlice.deserialize<T>(this.model, this.txt, this.chunk, tuple);
      this.stacking = slice.stacking;
      this.start = slice.start;
      this.end = slice.end;
    }
    return this.hash;
  }

  /** ----------------------------------------------------- {@link Printable} */

  public toStringName(): string {
    const type = this.type();
    if (typeof type === 'number' && Math.abs(type) <= 64 && SliceTypeName[type]) {
      return `slice [${SliceStackingName[this.stacking]}] <${SliceTypeName[type]}>`;
    }
    return `slice [${SliceStackingName[this.stacking]}] ${JSON.stringify(type)}`;
  }

  protected toStringHeaderName(): string {
    const data = this.data();
    const dataFormatted = data ? prettyOneLine(data) : '∅';
    const dataLengthBreakpoint = 32;
    const header = `${this.toStringName()} ${super.toString('', true)}, ${
      SliceStackingName[this.stacking]
    }, ${JSON.stringify(this.type())}${dataFormatted.length < dataLengthBreakpoint ? `, ${dataFormatted}` : ''}`;
    return header;
  }

  public toStringHeader(tab: string = ''): string {
    const data = this.data();
    const dataFormatted = data ? prettyOneLine(data) : '';
    const dataLengthBreakpoint = 32;
    return (
      this.toStringHeaderName() +
      printTree(tab, [dataFormatted.length < dataLengthBreakpoint ? null : (tab) => dataFormatted])
    );
  }
}
