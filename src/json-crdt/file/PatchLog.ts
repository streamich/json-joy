import {ITimestampStruct, Patch, compare} from '../../json-crdt-patch';
import {printTree} from '../../util/print/printTree';
import {AvlMap} from '../../util/trees/avl/AvlMap';
import {Model} from '../model';
import type {Printable} from '../../util/print/types';
import {first, next} from '../../util/trees/util';

export class PatchLog implements Printable {
  public static fromModel(model: Model<any>): PatchLog {
    const start = new Model(model.clock.clone());
    const log = new PatchLog(start);
    if (model.api.builder.patch.ops.length) {
      const patch = model.api.flush();
      log.push(patch);
    }
    return log;
  }

  public readonly patches = new AvlMap<ITimestampStruct, Patch>(compare);

  constructor(public readonly start: Model) {}

  public push(patch: Patch): void {
    const id = patch.getId();
    if (!id) return;
    this.patches.set(id, patch);
  }

  public replayToEnd(): Model {
    const clone = this.start.clone();
    for (let node = first(this.patches.root); node; node = next(node)) clone.applyPatch(node.v);
    return clone;
  }

  public replayTo(ts: ITimestampStruct): Model {
    const clone = this.start.clone();
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
        (tab) => this.start.toString(tab),
        () => '',
        (tab) =>
          'history' +
          printTree(
            tab,
            log.map((patch, i) => (tab) => `${i}: ${patch.toString(tab)}`),
          ),
      ])
    );
  }
}