import {FanOutUnsubscribe} from 'thingies/es2020/fanout';
import {ITimestampStruct, Patch, compare} from '../../json-crdt-patch';
import {printTree} from '../../util/print/printTree';
import {AvlMap} from '../../util/trees/avl/AvlMap';
import {Model} from '../model';
import {first, next} from '../../util/trees/util';
import type {Printable} from '../../util/print/types';

export class PatchLog implements Printable {
  /**
   * Creates a `PatchLog` instance from a newly JSON CRDT model. Checks if
   * the model API buffer has any initial operations applied, if yes, it
   * uses them to create the initial state of the log.
   *
   * @param model A new JSON CRDT model, just created with
   *              `Model.withLogicalClock()` or `Model.withServerClock()`.
   * @returns A new `PatchLog` instance.
   */
  public static fromNewModel(model: Model<any>): PatchLog {
    const clock = model.clock.clone();
    const log = new PatchLog(() => new Model(clock));
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
  public start: () => Model;

  /**
   * The end of the log, the current state of the document. It is the model
   * instance that is used to apply new patches to the log.
   *
   * @readonly
   */
  public readonly end: Model;

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

  constructor(start: () => Model) {
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
  public replayToEnd(): Model {
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
  public replayTo(ts: ITimestampStruct): Model {
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
    this.start = (): Model => {
      const model = oldStart();
      for (const patch of newStartPatches) model.applyPatch(patch);
      return model;
    };
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab?: string) {
    const patches: Patch[] = [];
    this.patches.forEach(({v}) => patches.push(v));
    return (
      `log` +
      printTree(tab, [
        (tab) => `start` + printTree(tab, [(tab) => this.start().toString(tab)]),
        () => '',
        (tab) =>
          'history' +
          printTree(
            tab,
            patches.map((patch, i) => (tab) => `${i}: ${patch.toString(tab)}`),
          ),
        () => '',
        (tab) => `end` + printTree(tab, [(tab) => this.end.toString(tab)]),
      ])
    );
  }
}
