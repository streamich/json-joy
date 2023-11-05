import {ArrayLww, ConNode, ObjectLww, ArrayRga, BinaryRga, StringRga, ValNode} from '../../nodes';
import {ApiPath, ArrayApi, BinaryApi, ConApi, NodeApi, ObjectApi, StringApi, VectorApi, ValueApi} from './nodes';
import {Emitter} from '../../../util/events/Emitter';
import {Patch} from '../../../json-crdt-patch/Patch';
import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import type {JsonNode} from '../../nodes';
import type {Model} from '../Model';

/**
 * Local changes API for a JSON CRDT model. This class is the main entry point
 * for executing local user actions on a JSON CRDT document.
 *
 * @category Local API
 */
export class ModelApi<Value extends JsonNode = JsonNode> {
  /**
   * Patch builder for the local changes.
   */
  public builder: PatchBuilder;

  /**
   * Index of the next operation in builder's patch to be committed locally.
   *
   * @ignore
   */
  public next: number = 0;

  /**
   * @param model Model instance on which the API operates.
   */
  constructor(public readonly model: Model<Value>) {
    this.builder = new PatchBuilder(this.model.clock);
  }

  /** @ignore */
  private changeQueued: boolean = false;

  /** @ignore */
  private readonly queueChange = (): void => {
    if (this.changeQueued) return;
    this.changeQueued = true;
    queueMicrotask(() => {
      this.changeQueued = false;
      const et = this.et;
      if (et) et.emit(new CustomEvent('change'));
    });
  };

  /** @ignore */
  private et: undefined | Emitter<{change: CustomEvent<unknown>}> = undefined;

  /**
   * Event target for listening to {@link Model} changes.
   */
  public get events(): Emitter<{change: CustomEvent<unknown>}> {
    let et = this.et;
    if (!et) {
      this.et = et = new Emitter();
      this.model.onchange = this.queueChange;
    }
    return et;
  }

  /**
   * Returns a local change API for the given node. If an instance already
   * exists, returns the existing instance.
   */
  public wrap(node: ValNode): ValueApi;
  public wrap(node: StringRga<any>): StringApi;
  public wrap(node: BinaryRga): BinaryApi;
  public wrap(node: ArrayRga): ArrayApi;
  public wrap(node: ObjectLww): ObjectApi;
  public wrap(node: ConNode): ConApi;
  public wrap(node: ArrayLww): VectorApi;
  public wrap(node: JsonNode): NodeApi;
  public wrap(node: JsonNode) {
    if (node instanceof ValNode) return node.api || (node.api = new ValueApi(node, this));
    else if (node instanceof StringRga) return node.api || (node.api = new StringApi(node, this));
    else if (node instanceof BinaryRga) return node.api || (node.api = new BinaryApi(node, this));
    else if (node instanceof ArrayRga) return node.api || (node.api = new ArrayApi(node, this));
    else if (node instanceof ObjectLww) return node.api || (node.api = new ObjectApi(node, this));
    else if (node instanceof ConNode) return node.api || (node.api = new ConApi(node, this));
    else if (node instanceof ArrayLww) return node.api || (node.api = new VectorApi(node, this));
    else throw new Error('UNKNOWN_NODE');
  }

  /**
   * Local changes API for the root node.
   */
  public get r() {
    return new ValueApi(this.model.root, this);
  }

  /** @ignore */
  public get node() {
    return this.r.get();
  }

  /**
   * Traverses the model starting from the root node and returns a local
   * changes API for a node at the given path.
   *
   * @param path Path at which to locate a node.
   * @returns A local changes API for a node at the given path.
   */
  public in(path?: ApiPath) {
    return this.r.in(path);
  }

  /**
   * Locates a JSON CRDT node, throws an error if the node doesn't exist.
   *
   * @param path Path at which to locate a node.
   * @returns A JSON CRDT node.
   */
  public find(path?: ApiPath) {
    return this.node.find(path);
  }

  /**
   * Locates a `val` node and returns a local changes API for it. If the node
   * doesn't exist or the node at the path is not a `val` node, throws an error.
   *
   * @param path Path at which to locate a node.
   * @returns A local changes API for a `val` node.
   */
  public val(path?: ApiPath) {
    return this.node.val(path);
  }

  /**
   * Locates a `vec` node and returns a local changes API for it. If the node
   * doesn't exist or the node at the path is not a `vec` node, throws an error.
   *
   * @param path Path at which to locate a node.
   * @returns A local changes API for a `vec` node.
   */
  public vec(path?: ApiPath) {
    return this.node.tup(path);
  }

  /**
   * Locates a `str` node and returns a local changes API for it. If the node
   * doesn't exist or the node at the path is not a `str` node, throws an error.
   *
   * @param path Path at which to locate a node.
   * @returns A local changes API for a `str` node.
   */
  public str(path?: ApiPath) {
    return this.node.str(path);
  }

  /**
   * Locates a `bin` node and returns a local changes API for it. If the node
   * doesn't exist or the node at the path is not a `bin` node, throws an error.
   *
   * @param path Path at which to locate a node.
   * @returns A local changes API for a `bin` node.
   */
  public bin(path?: ApiPath) {
    return this.node.bin(path);
  }

  /**
   * Locates an `arr` node and returns a local changes API for it. If the node
   * doesn't exist or the node at the path is not an `arr` node, throws an error.
   *
   * @param path Path at which to locate a node.
   * @returns A local changes API for an `arr` node.
   */
  public arr(path?: ApiPath) {
    return this.node.arr(path);
  }

  /**
   * Locates an `obj` node and returns a local changes API for it. If the node
   * doesn't exist or the node at the path is not an `obj` node, throws an error.
   *
   * @param path Path at which to locate a node.
   * @returns A local changes API for an `obj` node.
   */
  public obj(path?: ApiPath) {
    return this.node.obj(path);
  }

  /**
   * Locates a `con` node and returns a local changes API for it. If the node
   * doesn't exist or the node at the path is not a `con` node, throws an error.
   *
   * @param path Path at which to locate a node.
   * @returns A local changes API for a `con` node.
   */
  public const(path?: ApiPath) {
    return this.node.const(path);
  }

  /**
   * Given a JSON/CBOR value, constructs CRDT nodes recursively out of it and
   * sets the root node of the model to the constructed nodes.
   *
   * @param json JSON/CBOR value to set as the view of the model.
   * @returns Reference to itself.
   */
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
   *
   * @ignore
   */
  public advance() {
    this.next = this.builder.patch.ops.length;
    const model = this.model;
    model.tick++;
    model.onchange?.();
  }

  /**
   * Returns the view of the model.
   *
   * @returns JSON/CBOR of the model.
   */
  public view() {
    return this.model.view();
  }

  /**
   * Flushes the builder and returns a patch.
   *
   * @returns A JSON CRDT patch.
   */
  public flush(): Patch {
    const patch = this.builder.flush();
    this.next = 0;
    return patch;
  }
}
