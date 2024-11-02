import {AvlMap} from 'sonic-forest/lib/avl/AvlMap';
import {first, next} from 'sonic-forest/lib/util';
import type {FanOutUnsubscribe} from 'thingies/lib/fanout';
import {printTree} from 'tree-dump/lib/printTree';
import {type ITimestampStruct, type Patch, compare} from '../../json-crdt-patch';
import {Model} from '../model';
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
 */
export class Log<N extends JsonNode = JsonNode<any>> implements Printable {
  /**
   * Creates a `PatchLog` instance from a newly JSON CRDT model. Checks if
   * the model API buffer has any initial operations applied, if yes, it
   * uses them to create the initial state of the log.
   *
   * @param model A new JSON CRDT model, just created with
   *              `Model.withLogicalClock()` or `Model.withServerClock()`.
   * @returns A new `PatchLog` instance.
   */
  public static fromNewModel<N extends JsonNode = JsonNode<any>>(model: Model<N>): Log<N> {
    const sid = model.clock.sid;
    const log = new Log<N>(() => Model.create<any>(undefined, sid) as Model<N>);
    const api = model.api;
    if (api.builder.patch.ops.length) log.end.applyPatch(api.flush());
    return log;
  }

  /**
   * Model factory function that creates a new JSON CRDT model instance, which
   * is used as the starting point of the log. It is called every time a new
   * model is needed to replay the log.
   *
   * @readonly Internally this function may be updated, but externally it is
   *           read-only.
   */
  public start: () => Model<N>;

  /**
   * The end of the log, the current state of the document. It is the model
   * instance that is used to apply new patches to the log.
   *
   * @readonly
   */
  public readonly end: Model<N>;

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

  constructor(start: () => Model<N>) {
    this.start = start;
    const end = (this.end = start());
    const onPatch = (patch: Patch) => {
      const id = patch.getId();
      if (!id) return;
      this.patches.set(id, patch);
    };
    const api = end.api;
    this.__onPatch = api.onPatch.listen(onPatch);
    this.__onFlush = api.onFlush.listen(onPatch);
  }

  /**
   * Call this method to destroy the `PatchLog` instance. It unsubscribes patch
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
   * @returns A new model instance with patches replayed up to the given timestamp.
   */
  public replayTo(ts: ITimestampStruct): Model<N> {
    const clone = this.start().clone();
    for (let node = first(this.patches.root); node && compare(ts, node.k) >= 0; node = next(node))
      clone.applyPatch(node.v);
    return clone;
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
      return model;
    };
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
