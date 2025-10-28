import {hasOwnProperty as hasOwnProp} from '@jsonjoy.com/util/lib/hasOwnProperty';
import {Point} from '../rga/Point';
import {Range} from '../rga/Range';
import {updateNode} from '../../../json-crdt/hash';
import {printTree} from 'tree-dump/lib/printTree';
import {
  SliceHeaderMask,
  SliceHeaderShift,
  SliceStacking,
  SliceTupleIndex,
  SliceStackingName,
  SliceTypeCon,
} from './constants';
import {CONST} from '../../../json-hash/hash';
import {Timestamp} from '../../../json-crdt-patch/clock';
import {prettyOneLine} from '../../../json-pretty';
import {formatType, validateType} from './util';
import {NodeBuilder, s} from '../../../json-crdt-patch';
import {JsonCrdtDiff} from '../../../json-crdt-diff/JsonCrdtDiff';
import {NestedType} from './NestedType';
import {Anchor} from '../rga/constants';
import {type Model, type NodeApi, ObjApi} from '../../../json-crdt/model';
import type {ObjNode, VecNode} from '../../../json-crdt/nodes';
import type {ITimestampStruct} from '../../../json-crdt-patch/clock';
import type {ArrChunk, ArrNode, JsonNode} from '../../../json-crdt/nodes';
import type {SliceView, SliceType, SliceUpdateParams, SliceTypeSteps} from './types';
import type {Stateful} from '../types';
import type {Printable} from 'tree-dump/lib/types';
import type {AbstractRga} from '../../../json-crdt/nodes/rga';
import type {Peritext} from '../Peritext';
import type {Slices} from './Slices';

/**
 * A slice is stored in a {@link Model} as a "vec" node. It is used for
 * rich-text formatting annotations and block splits.
 *
 * Slices represent Peritext's rich-text formatting/splits. The "slice"
 * concept captures both: (1) range annotations; as well as, (2) *markers*,
 * which are a single-point annotations. The markers are used as block splits,
 * e.g. paragraph, heading, blockquote, etc. In markers, the start and end
 * positions of the range are normally the same, but could also wrap around
 * a single RGA chunk.
 */
export class Slice<T = string> extends Range<T> implements Stateful, Printable {
  public static deserialize<T>(
    model: Model,
    txt: Peritext<T>,
    arr: ArrNode,
    chunk: ArrChunk,
    tuple: VecNode,
  ): Slice<T> {
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
    const slice = new Slice<T>(model, txt, arr, chunk, tuple, stacking, p1, p2);
    validateType(slice.type());
    return slice;
  }

  /** @todo Use API node here. */
  protected readonly rga: AbstractRga<T>;

  /**
   * ID of the slice. ID is used for layer sorting.
   */
  public readonly id: ITimestampStruct;

  /**
   * The low-level stacking behavior of the slice. Specifies whether the
   * slice is a split, i.e. a "marker" for a block split, in which case it
   * represents a single place in the text where text is split into blocks.
   * Otherwise, specifies the low-level behavior or the rich-text formatting
   * of the slice.
   */
  public stacking: SliceStacking;

  constructor(
    /** The `Model` where the slice is stored. */
    protected readonly model: Model,
    /** The Peritext context. */
    protected readonly txt: Peritext<T>,
    /** The "arr" node where the slice is stored. */
    protected readonly arr: ArrNode,
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
    // TODO: Chunk could potentially contain multiple entries, handle that case.
    this.id = chunk.id;
    this.stacking = stacking;
  }

  /**
   * Represents a block split in the text, i.e. it is a *marker* that shows
   * where a block was split. Markers also insert one "\n" new line character.
   * Both marker ends are attached to the "before" anchor fo the "\n" new line
   * character, i.e. it is *collapsed* to the "before" anchor.
   */
  public isMarker(): boolean {
    return this.stacking === SliceStacking.Marker;
  }

  public tupleApi() {
    return this.model.api.wrap(this.tuple);
  }

  public pos(): number {
    return this.arr.posById(this.id) || 0;
  }

  /**
   * Returns the {@link Range} which exactly contains the block boundary of this
   * marker.
   */
  public boundary(): Range<T> {
    const start = this.start;
    const end = start.clone();
    end.anchor = Anchor.After;
    return this.txt.range(start, end);
  }

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

  public isSaved(): boolean {
    return this.tuple.id.sid === this.txt.model.clock.sid;
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

  /**
   * Delete this slice from its backing store.
   */
  public del(): void {
    const store = this.getStore();
    if (!store) return;
    store.del(this.id);
    if (this.isMarker()) {
      const txt = this.txt;
      const range = txt.range(
        this.start,
        this.start.copy((p) => (p.anchor = Anchor.After)),
      );
      txt.delStr(range);
    }
  }

  /**
   * Whether the slice is deleted.
   */
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

  /**
   * The high-level behavior identifier of the slice. Specifies the
   * user-defined type of the slice, e.g. paragraph, heading, blockquote, etc.
   *
   * Usually the type is a number or string primitive, in which case it is
   * referred to as *tag*.
   *
   * The type is a list only for nested blocks, e.g. `['ul', 'li']`, in which
   * case the type is a list of tags. The last tag in the list is the
   * "leaf" tag, which is the type of the leaf block element.
   */
  public type(): SliceType {
    return this.typeNode()?.view() as SliceType;
  }

  public typeSteps(): SliceTypeSteps {
    const type = this.type() ?? SliceTypeCon.p;
    return Array.isArray(type) ? type : [type];
  }

  // -------------------------------------------------- slice data manipulation

  /**
   * High-level user-defined metadata of the slice, which accompanies the slice
   * type.
   */
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
      const slice = Slice.deserialize<T>(this.model, this.txt, this.arr, this.chunk, tuple);
      this.stacking = slice.stacking;
      this.start = slice.start;
      this.end = slice.end;
    }
    return this.hash;
  }

  /** ----------------------------------------------------- {@link Printable} */

  public toStringName(): string {
    const typeFormatted = formatType(this.type());
    const stackingFormatted = SliceStackingName[this.stacking];
    return `Slice::${stackingFormatted} ${typeFormatted}`;
  }

  protected toStringHeaderName(): string {
    const data = this.data();
    const dataFormatted = data ? prettyOneLine(data) : '∅';
    const dataLengthBreakpoint = 32;
    const typeFormatted = formatType(this.type());
    const stackingFormatted = SliceStackingName[this.stacking];
    const dataFormattedShort = dataFormatted.length < dataLengthBreakpoint ? `, ${dataFormatted}` : '';
    const header = `${this.toStringName()} ${super.toString('', true)}, ${stackingFormatted}, ${typeFormatted}${dataFormattedShort}`;
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
