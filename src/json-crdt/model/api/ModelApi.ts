import {FanOut} from 'thingies/lib/fanout';
import {VecNode, ConNode, ObjNode, ArrNode, BinNode, StrNode, ValNode} from '../../nodes';
import {type ApiPath, ArrApi, BinApi, ConApi, type NodeApi, ObjApi, StrApi, VecApi, ValApi} from './nodes';
import {PatchBuilder} from '../../../json-crdt-patch/PatchBuilder';
import {MergeFanOut, MicrotaskBufferFanOut} from './fanout';
import {type JsonNodeToProxyPathNode, proxy$} from './proxy';
import {ExtNode} from '../../extensions/ExtNode';
import type {Patch} from '../../../json-crdt-patch/Patch';
import type {SyncStore} from '../../../util/events/sync-store';
import type {Model} from '../Model';
import type {JsonNode, JsonNodeView} from '../../nodes';

/**
 * Local changes API for a JSON CRDT model. This class is the main entry point
 * for executing local user actions on a JSON CRDT document.
 *
 * @category Local API
 */
export class ModelApi<N extends JsonNode = JsonNode> implements SyncStore<JsonNodeView<N>> {
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

  /** Emitted before the model is reset, using the `.reset()` method. */
  public readonly onBeforeReset = new FanOut<void>();
  /** Emitted after the model is reset, using the `.reset()` method. */
  public readonly onReset = new FanOut<void>();
  /** Emitted before a patch is applied using `model.applyPatch()`. */
  public readonly onBeforePatch = new FanOut<Patch>();
  /** Emitted after a patch is applied using `model.applyPatch()`. */
  public readonly onPatch = new FanOut<Patch>();
  /** Emitted before local changes through `model.api` are applied. */
  public readonly onBeforeLocalChange = new FanOut<number>();
  /** Emitted after local changes through `model.api` are applied. */
  public readonly onLocalChange = new FanOut<number>();
  /**
   * Emitted after local changes through `model.api` are applied. Same as
   * `.onLocalChange`, but this event buffered withing a microtask.
   */
  public readonly onLocalChanges = new MicrotaskBufferFanOut<number>(this.onLocalChange);
  /** Emitted before a transaction is started. */
  public readonly onBeforeTransaction = new FanOut<void>();
  /** Emitted after transaction completes. */
  public readonly onTransaction = new FanOut<void>();
  /** Emitted when the model changes. Combines `onReset`, `onPatch` and `onLocalChange`. */
  public readonly onChange = new MergeFanOut<number | Patch | undefined>([
    this.onReset,
    this.onPatch,
    this.onLocalChange,
  ]);
  /** Emitted when the model changes. Same as `.onChange`, but this event is emitted once per microtask. */
  public readonly onChanges = new MicrotaskBufferFanOut<number | Patch | undefined>(this.onChange);
  /** Emitted when the `model.api` builder change buffer is flushed. */
  public readonly onFlush = new FanOut<Patch>();

  /**
   * @param model Model instance on which the API operates.
   */
  constructor(public readonly model: Model<N>) {
    this.builder = new PatchBuilder(model.clock);
    model.onbeforereset = () => this.onBeforeReset.emit();
    model.onreset = () => this.onReset.emit();
    model.onbeforepatch = (patch) => this.onBeforePatch.emit(patch);
    model.onpatch = (patch) => this.onPatch.emit(patch);
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
  public wrap(node: ExtNode<any, any>): NodeApi;
  public wrap(node: JsonNode) {
    if (node instanceof ValNode) return node.api || (node.api = new ValApi(node, this));
    else if (node instanceof StrNode) return node.api || (node.api = new StrApi(node, this));
    else if (node instanceof BinNode) return node.api || (node.api = new BinApi(node, this));
    else if (node instanceof ArrNode) return node.api || (node.api = new ArrApi(node, this));
    else if (node instanceof ObjNode) return node.api || (node.api = new ObjApi(node, this));
    else if (node instanceof ConNode) return node.api || (node.api = new ConApi(node, this));
    else if (node instanceof VecNode) return node.api || (node.api = new VecApi(node, this));
    else if (node instanceof ExtNode) {
      if (node.api) return node.api;
      const extension = this.model.ext.get(node.extId)!;
      return (node.api = new extension.Api(node, this));
    } else throw new Error('UNKNOWN_NODE');
  }

  /**
   * Local changes API for the root node.
   */
  public get r() {
    return new ValApi(this.model.root, this);
  }

  /**
   * @ignore
   *
   * @todo Remove this getter?
   */
  public get node() {
    return this.r.get();
  }

  public get $(): JsonNodeToProxyPathNode<N> {
    return proxy$((path) => {
      try {
        return this.wrap(this.find(path));
      } catch {
        return;
      }
    }, '$') as any;
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
   * Locates a `con` node and returns a local changes API for it. If the node
   * doesn't exist or the node at the path is not a `con` node, throws an error.
   *
   * @todo Rename to `con`.
   *
   * @param path Path at which to locate a node.
   * @returns A local changes API for a `con` node.
   */
  public con(path?: ApiPath) {
    return this.node.con(path);
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
    return this.node.vec(path);
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
    const from = this.next;
    this.onBeforeLocalChange.emit(from);
    for (let i = this.next; i < length; i++) model.applyOperation(ops[i]);
    this.next = length;
    model.tick++;
    this.onLocalChange.emit(from);
  }

  /**
   * Advance patch pointer to the end without applying the operations. With the
   * idea that they have already been applied locally.
   *
   * You need to manually call `this.onBeforeLocalChange.emit(this.next)` before
   * calling this method.
   *
   * @ignore
   */
  public advance() {
    const from = this.next;
    this.next = this.builder.patch.ops.length;
    this.model.tick++;
    this.onLocalChange.emit(from);
  }

  /**
   * Returns the view of the model.
   *
   * @returns JSON/CBOR of the model.
   */
  public view() {
    return this.model.view();
  }

  public select(path?: ApiPath, leaf?: boolean) {
    return this.r.select(path, leaf);
  }

  /**
   * Reads the value at the given path in the model. If no path is provided,
   * returns the root node's view.
   *
   * @param path Path at which to read the value.
   * @returns The value at the given path, or the root node's view if no path
   *     is provided.
   */
  public read(path?: ApiPath): unknown {
    return this.r.read(path);
  }

  public add(path: ApiPath, value: unknown): boolean {
    return this.r.add(path, value);
  }

  public replace(path: ApiPath, value: unknown): boolean {
    return this.r.replace(path, value);
  }

  public remove(path: ApiPath, length?: number): boolean {
    return this.r.remove(path, length);
  }

  private inTx = false;
  public transaction(callback: () => void) {
    if (this.inTx) callback();
    else {
      this.inTx = true;
      try {
        this.onBeforeTransaction.emit();
        callback();
        this.onTransaction.emit();
      } finally {
        this.inTx = false;
      }
    }
  }

  /**
   * Flushes the builder and returns a patch.
   *
   * @returns A JSON CRDT patch.
   * @todo Make this return undefined if there are no operations in the builder.
   */
  public flush(): Patch {
    const patch = this.builder.flush();
    this.next = 0;
    if (patch.ops.length) this.onFlush.emit(patch);
    return patch;
  }

  public stopAutoFlush?: () => void = undefined;

  /**
   * Begins to automatically flush buffered operations into patches, grouping
   * operations by microtasks or by transactions. To capture the patch, listen
   * to the `.onFlush` event.
   *
   * @returns Callback to stop auto flushing.
   */
  public autoFlush(drainNow = false): () => void {
    const drain = () => this.builder.patch.ops.length && this.flush();
    const onLocalChangesUnsubscribe = this.onLocalChanges.listen(drain);
    const onBeforeTransactionUnsubscribe = this.onBeforeTransaction.listen(drain);
    const onTransactionUnsubscribe = this.onTransaction.listen(drain);
    if (drainNow) drain();
    return (this.stopAutoFlush = () => {
      this.stopAutoFlush = undefined;
      onLocalChangesUnsubscribe();
      onBeforeTransactionUnsubscribe();
      onTransactionUnsubscribe();
    });
  }

  // ---------------------------------------------------------------- SyncStore

  public readonly subscribe = (callback: () => void) => this.onChanges.listen(() => callback());
  public readonly getSnapshot = () => this.view() as JsonNodeView<N>;
}
