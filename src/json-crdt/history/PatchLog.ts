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
   */
  public readonly start: () => Model;

  /**
   * The end of the log, the current state of the document. It is the model
   * instance that is used to apply new patches to the log.
   */
  public readonly end: Model;

  /**
   * The patches in the log, stored in an AVL tree for efficient replaying. The
   * collection of patches which are applied to the `start()` model to reach
   * the `end` model.
   */
  public readonly patches = new AvlMap<ITimestampStruct, Patch>(compare);
  private _patchesUnsub: FanOutUnsubscribe;

  constructor(start: () => Model) {
    this.start = start;
    this.end = start();
    this._patchesUnsub = this.end.api.onPatch.listen((patch) => {
      const id = patch.getId();
      if (!id) return;
      this.patches.set(id, patch);
    });
  }

  /**
   * Call this method to destroy the `PatchLog` instance. It unsubscribes from
   * the model's `onPatch` event listener.
   */
  public destroy() {
    this._patchesUnsub();
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

  // ---------------------------------------------------------------- Printable

  public toString(tab?: string) {
    const log: Patch[] = [];
    this.patches.forEach(({v}) => log.push(v));
    return (
      `log` +
      printTree(tab, [
        (tab) => `start` + printTree(tab, [tab => this.start().toString(tab)]),
        () => '',
        (tab) =>
        'history' +
          printTree(
            tab,
            log.map((patch, i) => (tab) => `${i}: ${patch.toString(tab)}`),
          ),
        () => '',
        (tab) => `end` + printTree(tab, [tab => this.end.toString(tab)]),
      ])
    );
  }
}
