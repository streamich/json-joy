import {FanOut} from 'thingies/es2020/fanout';
import {VecNode, ConNode, ObjNode, ArrNode, BinNode, StrNode, ValNode} from '../../nodes';
import {ApiPath, ArrApi, BinApi, ConApi, NodeApi, ObjApi, StrApi, VecApi, ValApi} from './nodes';
import {Emitter} from '../../../util/events/Emitter';
import {Patch} from '../../../json-crdt-patch/Patch';
import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {ModelChangeType, type Model} from '../Model';
import {SyncStore} from '../../../util/events/sync-store';
import type {JsonNode, JsonNodeView} from '../../nodes';

export interface ModelApiEvents {
  /**
   * Emitted when the model changes. This event is emitted once per microtask,
   * multiple changes in the same microtask are batched into a single event. The
   * payload is a set of change types that occurred in the model.
   */
  change: CustomEvent<Set<ModelChangeType>>;

  /**
   * Emitted when the builder is flushed. The event detail is the flushed patch.
   */
  flush: CustomEvent<Patch>;
}

/**
 * Local changes API for a JSON CRDT model. This class is the main entry point
 * for executing local user actions on a JSON CRDT document.
 *
 * @category Local API
 */
export class ModelApi<Value extends JsonNode = JsonNode> implements SyncStore<JsonNodeView<Value>> {
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
    this.model.onchange = this.queueChange;
  }

  public readonly changes = new FanOut<ModelChangeType>();

  /** @ignore */
  private queuedChanges: undefined | Set<ModelChangeType> = undefined;

  /** @ignore @deprecated */
  private readonly queueChange = (changeType: ModelChangeType): void => {
    this.changes.emit(changeType);
    let changesQueued = this.queuedChanges;
    if (changesQueued) {
      changesQueued.add(changeType);
      return;
    }
    changesQueued = this.queuedChanges = new Set<ModelChangeType>();
    changesQueued.add(changeType);
    queueMicrotask(() => {
      let changes = this.queuedChanges || new Set<ModelChangeType>();
      this.queuedChanges = undefined;
      const et = this.et;
      if (changes.has(ModelChangeType.RESET)) changes = new Set([ModelChangeType.RESET]);
      if (et) et.emit(new CustomEvent<Set<ModelChangeType>>('change', {detail: changes}));
    });
  };

  /** @ignore @deprecated */
  private et: Emitter<ModelApiEvents> = new Emitter();

  /**
   * Event target for listening to {@link Model} changes.
   *
   * @deprecated
   */
  public get events(): Emitter<ModelApiEvents> {
    return this.et;
  }

  /**
   * Returns a local change API for the given node. If an instance already
   * exists, returns the existing instance.
   */
  public wrap(node: ValNode): ValApi;
  public wrap(node: StrNode<any>): StrApi;
  public wrap(node: BinNode): BinApi;
  public wrap(node: ArrNode): ArrApi;
  public wrap(node: ObjNode): ObjApi;
  public wrap(node: ConNode): ConApi;
  public wrap(node: VecNode): VecApi;
  public wrap(node: JsonNode): NodeApi;
  public wrap(node: JsonNode) {
    if (node instanceof ValNode) return node.api || (node.api = new ValApi(node, this));
    else if (node instanceof StrNode) return node.api || (node.api = new StrApi(node, this));
    else if (node instanceof BinNode) return node.api || (node.api = new BinApi(node, this));
    else if (node instanceof ArrNode) return node.api || (node.api = new ArrApi(node, this));
    else if (node instanceof ObjNode) return node.api || (node.api = new ObjApi(node, this));
    else if (node instanceof ConNode) return node.api || (node.api = new ConApi(node, this));
    else if (node instanceof VecNode) return node.api || (node.api = new VecApi(node, this));
    else throw new Error('UNKNOWN_NODE');
  }

  /**
   * Local changes API for the root node.
   */
  public get r() {
    return new ValApi(this.model.root, this);
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
    model.onchange?.(ModelChangeType.LOCAL);
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
    model.onchange?.(ModelChangeType.LOCAL);
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
    const event = new CustomEvent<Patch>('flush', {detail: patch});
    this.events.emit(event);
    return patch;
  }

  // ---------------------------------------------------------------- SyncStore

  public readonly subscribe = (callback: () => void) => {
    const listener = () => callback();
    this.events.on('change', listener);
    return () => this.events.off('change', listener);
  };

  public readonly getSnapshot = () => this.view() as any;
}
