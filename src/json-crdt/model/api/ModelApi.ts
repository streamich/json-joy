import {ApiPath, ArrayApi, BinaryApi, ConstApi, NodeApi, ObjectApi, StringApi, TupleApi, ValueApi} from './nodes';
import {Patch} from '../../../json-crdt-patch/Patch';
import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {JsonNode} from '../../types';
import {ArrayLww} from '../../types/lww-array/ArrayLww';
import {Const} from '../../types/const/Const';
import {ObjectLww} from '../../types/lww-object/ObjectLww';
import {ArrayRga} from '../../types/rga-array/ArrayRga';
import {BinaryRga} from '../../types/rga-binary/BinaryRga';
import {StringRga} from '../../types/rga-string/StringRga';
import {ValueLww} from '../../types/lww-value/ValueLww';
import type {Model} from '../Model';

/**
 * @category Local API
 */
export class ModelApi<Value extends JsonNode = JsonNode> {
  public builder: PatchBuilder;

  /** Index of the next operation in builder's patch to be committed locally. */
  public next: number = 0;

  constructor(public readonly model: Model<Value>) {
    this.builder = new PatchBuilder(this.model.clock);
  }

  private changeQueued: boolean = false;

  private readonly queueChange = (): void => {
    if (this.changeQueued) return;
    this.changeQueued = true;
    queueMicrotask(() => {
      this.changeQueued = false;
      const et = this.et;
      if (et) et.dispatchEvent(new CustomEvent('change'));
    });
  };

  private et: undefined | EventTarget = undefined;
  public get events(): EventTarget {
    let et = this.et;
    if (!et) {
      this.et = et = new EventTarget();
      this.model.onchange = this.queueChange;
    }
    return et;
  }

  public wrap(node: ValueLww): ValueApi;
  public wrap(node: StringRga): StringApi;
  public wrap(node: BinaryRga): BinaryApi;
  public wrap(node: ArrayRga): ArrayApi;
  public wrap(node: ObjectLww): ObjectApi;
  public wrap(node: Const): ConstApi;
  public wrap(node: ArrayLww): TupleApi;
  public wrap(node: JsonNode): NodeApi;
  public wrap(node: JsonNode) {
    if (node instanceof ValueLww) return node.api || (node.api = new ValueApi(node, this));
    else if (node instanceof StringRga) return node.api || (node.api = new StringApi(node, this));
    else if (node instanceof BinaryRga) return node.api || (node.api = new BinaryApi(node, this));
    else if (node instanceof ArrayRga) return node.api || (node.api = new ArrayApi(node, this));
    else if (node instanceof ObjectLww) return node.api || (node.api = new ObjectApi(node, this));
    else if (node instanceof Const) return node.api || (node.api = new ConstApi(node, this));
    else if (node instanceof ArrayLww) return node.api || (node.api = new TupleApi(node, this));
    else throw new Error('UNKNOWN_NODE');
  }

  public get node() {
    return new NodeApi(this.model.root.node(), this);
  }

  public get r() {
    return new ValueApi(this.model.root, this);
  }

  public in(path?: ApiPath) {
    return this.r.in(path);
  }

  public find(path?: ApiPath) {
    return this.node.find(path);
  }

  public val(path?: ApiPath) {
    return this.node.val(path);
  }

  public tup(path?: ApiPath) {
    return this.node.tup(path);
  }

  public str(path?: ApiPath) {
    return this.node.str(path);
  }

  public bin(path?: ApiPath) {
    return this.node.bin(path);
  }

  public arr(path?: ApiPath) {
    return this.node.arr(path);
  }

  public obj(path?: ApiPath) {
    return this.node.obj(path);
  }

  public const(path?: ApiPath) {
    return this.node.const(path);
  }

  public root(json: unknown): this {
    const builder = this.builder;
    builder.root(builder.json(json));
    this.apply();
    return this;
  }

  /**
   * Apply locally any operations from the `.builder`, which haven't been
   * applied yet.
   */
  public apply() {
    const ops = this.builder.patch.ops;
    const length = ops.length;
    const model = this.model;
    for (let i = this.next; i < length; i++) model.applyOperation(ops[i]);
    this.next = length;
    model.tick++;
    model.onchange?.();
  }

  /**
   * Advance patch pointer to the end without applying the operations. With the
   * idea that they have already been applied locally.
   */
  public advance() {
    this.next = this.builder.patch.ops.length;
    const model = this.model;
    model.tick++;
    model.onchange?.();
  }

  public view(): unknown {
    return this.model.view();
  }

  public flush(): Patch {
    const patch = this.builder.flush();
    this.next = 0;
    return patch;
  }
}
