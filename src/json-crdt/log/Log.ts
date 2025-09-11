import {AvlMap} from 'sonic-forest/lib/avl/AvlMap';
import {first, next, prev} from 'sonic-forest/lib/util';
import {printTree} from 'tree-dump/lib/printTree';
import {listToUint8} from '@jsonjoy.com/util/lib/buffers/concat';
import {Model} from '../model';
import {toSchema} from '../schema/toSchema';
import {
  DelOp,
  type ITimestampStruct,
  InsArrOp,
  InsBinOp,
  InsObjOp,
  InsStrOp,
  InsValOp,
  InsVecOp,
  type Patch,
  Timespan,
  compare,
} from '../../json-crdt-patch';
import {ArrNode, BinNode, ObjNode, StrNode, ValNode, VecNode} from '../nodes';
import type {FanOutUnsubscribe} from 'thingies/lib/fanout';
import type {Printable} from 'tree-dump/lib/types';
import type {JsonNode} from '../nodes/types';

/**
 * The `Log` represents a history of patches applied to a JSON CRDT model. It
 * consists of: (1) a starting {@link Model} instance, (2) a list of {@link Patch} instances,
 * that can be applied to the starting model to reach the current state of the
 * document, and (3) the current state of the document, the `end` {@link Model}.
 *
 * The log can be used to replay the history of patches to any point in time,
 * from the "start" to the "end" of the log, and return the resulting {@link Model}
 * state.
 *
 * @todo Make this implement UILifecycle (start, stop) interface.
 */
export class Log<N extends JsonNode = JsonNode<any>, Metadata extends Record<string, unknown> = Record<string, unknown>>
  implements Printable
{
  /**
   * Creates a `PatchLog` instance from a newly JSON CRDT model. Checks if
   * the model API buffer has any initial operations applied, if yes, it
   * uses them to create the initial state of the log.
   *
   * @param model A new JSON CRDT model, just created with
   *              `Model.create()` or `Model.withServerClock()`.
   * @returns A new `PatchLog` instance.
   */
  public static fromNewModel<N extends JsonNode = JsonNode<any>>(model: Model<N>): Log<N> {
    const sid = model.clock.sid;
    const log = new Log<N>(
      () => Model.create(undefined, sid) as unknown as Model<N>,
    ); /** @todo Maybe provide second arg to `new Log(...)` */
    const api = model.api;
    if (api.builder.patch.ops.length) log.end.applyPatch(api.flush());
    return log;
  }

  public static from<N extends JsonNode = JsonNode<any>>(model: Model<N>): Log<N> {
    const frozen = model.toBinary();
    const beginning = () => Model.fromBinary<N>(frozen);
    return new Log<N>(beginning, model);
  }

  /**
   * Custom metadata associated with the log, it will be stored in the log's
   * header when serialized with {@link LogEncoder} and can be used to store
   * additional information about the log.
   */
  public metadata: Metadata;

  /**
   * The collection of patches which are applied to the `start()` model to reach
   * the `end` model. The patches in the log, stored in an AVL tree for
   * efficient replaying. The patches are sorted by their logical timestamps
   * and applied in causal order.
   *
   * @readonly
   */
  public readonly patches = new AvlMap<ITimestampStruct, Patch>(compare);

  private __onPatch: FanOutUnsubscribe;
  private __onFlush: FanOutUnsubscribe;

  constructor(
    /**
     * Model factory function that creates a new JSON CRDT model instance, which
     * is used as the starting point of the log. It is called every time a new
     * model is needed to replay the log.
     *
     * @readonly Internally this function may be updated, but externally it is
     *           read-only.
     *
     * @todo Rename to something else to give way to a `start()` in UILifecycle.
     *     Call "snapshot". Maybe introduce `type Snapshot<N> = () => Model<N>;`.
     */
    public start: () => Model<N>,

    /**
     * The end of the log, the current state of the document. It is the model
     * instance that is used to apply new patches to the log.
     *
     * @readonly
     */
    public readonly end: Model<N> = start(),

    metadata?: Metadata,
  ) {
    const onPatch = (patch: Patch) => {
      const id = patch.getId();
      if (!id) return;
      this.patches.set(id, patch);
    };
    const api = end.api;
    this.__onPatch = api.onPatch.listen(onPatch);
    this.__onFlush = api.onFlush.listen(onPatch);
    this.metadata = metadata ?? ({} as Metadata);
  }

  /**
   * Call this method to destroy the {@link Log} instance. It unsubscribes patch
   * and flush listeners from the `end` model and clears the patch log.
   */
  public destroy() {
    this.__onPatch();
    this.__onFlush();
    this.patches.clear();
  }

  /**
   * Creates a new model instance using the `start()` factory function and
   * replays all patches in the log to reach the current state of the document.
   *
   * @returns A new model instance with all patches replayed.
   */
  public replayToEnd(): Model<N> {
    const clone = this.start().clone();
    for (let node = first(this.patches.root); node; node = next(node)) clone.applyPatch(node.v);
    return clone;
  }

  /**
   * Replays the patch log until a specified timestamp, including the patch
   * at the given timestamp. The model returned is a new instance of `start()`
   * with patches replayed up to the given timestamp.
   *
   * @param ts Timestamp ID of the patch to replay to.
   * @param inclusive If `true`, the patch at the given timestamp `ts` is included,
   *     otherwise replays up to the patch before the given timestamp. Default is `true`.
   * @returns A new model instance with patches replayed up to the given timestamp.
   */
  public replayTo(ts: ITimestampStruct, inclusive: boolean = true): Model<N> {
    // TODO: PERF: Make `.clone()` implicit in `.start()`.
    const clone = this.start().clone();
    let cmp: number = 0;
    for (let node = first(this.patches.root); node && (cmp = compare(ts, node.k)) >= 0; node = next(node)) {
      if (cmp === 0 && !inclusive) break;
      clone.applyPatch(node.v);
    }
    return clone;
  }

  /**
   * Finds the latest patch for a given session ID.
   *
   * @param sid Session ID to find the latest patch for.
   * @return The latest patch for the given session ID, or `undefined` if no
   *     such patch exists.
   */
  public findMax(sid: number): Patch | undefined {
    let curr = this.patches.max;
    while (curr) {
      if (curr.k.sid === sid) return curr.v;
      curr = prev(curr);
    }
    return;
  }

  /**
   * Advance the start of the log to a specified timestamp, excluding the patch
   * at the given timestamp. This method removes all patches from the log that
   * are older than the given timestamp and updates the `start()` factory
   * function to replay the log from the new start.
   *
   * @param ts Timestamp ID of the patch to advance to.
   */
  public advanceTo(ts: ITimestampStruct): void {
    const newStartPatches: Patch[] = [];
    let node = first(this.patches.root);
    for (; node && compare(ts, node.k) >= 0; node = next(node)) newStartPatches.push(node.v);
    for (const patch of newStartPatches) this.patches.del(patch.getId()!);
    const oldStart = this.start;
    this.start = (): Model<N> => {
      const model = oldStart();
      for (const patch of newStartPatches) model.applyPatch(patch);
      /** @todo Freeze the old model here, by `model.toBinary()`, it needs to be cloned on .start() anyways. */
      return model;
    };
  }

  /**
   * Creates a patch which reverts the given patch. The RGA insertion operations
   * are reversed just by deleting the inserted values. All other operations
   * require time travel to the state just before the patch was applied, so that
   * a copy of a mutated object can be created and inserted back into the model.
   *
   * @param patch The patch to undo
   * @returns A new patch that undoes the given patch
   */
  public undo(patch: Patch): Patch {
    const ops = patch.ops;
    const length = ops.length;
    if (!length) throw new Error('EMPTY_PATCH');
    const id = patch.getId();
    let __model: Model<N> | undefined;
    const getModel = () => __model || (__model = this.replayTo(id!, false));
    const builder = this.end.api.builder;
    for (let i = length - 1; i >= 0; i--) {
      const op = ops[i];
      const opId = op.id;
      if (op instanceof InsStrOp || op instanceof InsArrOp || op instanceof InsBinOp) {
        builder.del(op.obj, [new Timespan(opId.sid, opId.time, op.span())]);
        continue;
      }
      const model = getModel();
      // TODO: Do not overwrite already deleted values? Or needed for concurrency? Orphaned nodes.
      if (op instanceof InsValOp) {
        const val = model.index.get(op.obj);
        if (val instanceof ValNode) {
          const schema = toSchema(val.node());
          const newId = schema.build(builder);
          builder.setVal(op.obj, newId);
        }
      } else if (op instanceof InsObjOp || op instanceof InsVecOp) {
        const data: (typeof op)['data'] = [];
        const container = model.index.get(op.obj);
        for (const [key] of op.data) {
          let value: JsonNode | undefined;
          if (container instanceof ObjNode) value = container.get(key + '');
          else if (container instanceof VecNode) value = container.get(+key);
          if (value) {
            const schema = toSchema(value);
            const newId = schema.build(builder);
            data.push([key, newId] as any);
          } else {
            data.push([key, builder.con(undefined)] as any);
          }
        }
        if (data.length) {
          if (op instanceof InsObjOp) builder.insObj(op.obj, data as InsObjOp['data']);
          else if (op instanceof InsVecOp) builder.insVec(op.obj, data as InsVecOp['data']);
        }
      } else if (op instanceof DelOp) {
        const node = model.index.find(op.obj);
        if (node) {
          const rga = node.v;
          if (rga instanceof StrNode) {
            let str = '';
            for (const span of op.what) str += rga.spanView(span).join('');
            let after = op.obj;
            const firstDelSpan = op.what[0];
            if (firstDelSpan) {
              const after2 = rga.prevId(firstDelSpan);
              if (after2) after = after2;
            }
            builder.insStr(op.obj, after, str);
          } else if (rga instanceof BinNode) {
            const buffers: Uint8Array[] = [];
            for (const span of op.what) buffers.push(...rga.spanView(span));
            let after = op.obj;
            const firstDelSpan = op.what[0];
            if (firstDelSpan) {
              const after2 = rga.prevId(firstDelSpan);
              if (after2) after = after2;
            }
            const blob = listToUint8(buffers);
            builder.insBin(op.obj, after, blob);
          } else if (rga instanceof ArrNode) {
            const copies: ITimestampStruct[] = [];
            for (const span of op.what) {
              const ids2 = rga.spanView(span);
              for (const ids of ids2) {
                for (const id of ids) {
                  const node = model.index.get(id);
                  if (node) {
                    const schema = toSchema(node);
                    const newId = schema.build(builder);
                    copies.push(newId);
                  }
                }
              }
            }
            let after = op.obj;
            const firstDelSpan = op.what[0];
            if (firstDelSpan) {
              const after2 = rga.prevId(firstDelSpan);
              if (after2) after = after2;
            }
            builder.insArr(op.obj, after, copies);
          }
        }
      }
    }
    return builder.flush();
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab?: string) {
    const patches: Patch[] = [];
    // biome-ignore lint: patches are not iterable
    this.patches.forEach(({v}) => patches.push(v));
    return (
      'log' +
      printTree(tab, [
        (tab) => 'start' + printTree(tab, [(tab) => this.start().toString(tab)]),
        () => '',
        (tab) =>
          'history' +
          printTree(
            tab,
            patches.map((patch, i) => (tab) => `${i}: ${patch.toString(tab)}`),
          ),
        () => '',
        (tab) => 'end' + printTree(tab, [(tab) => this.end.toString(tab)]),
      ])
    );
  }
}
