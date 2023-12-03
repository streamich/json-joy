import {ITimestampStruct, Patch, ServerClockVector, compare} from "../../json-crdt-patch";
import {AvlMap} from "../../util/trees/avl/AvlMap";
import {Model} from "../model";

export class PatchLog {
  public static fromModel (model: Model): PatchLog {
    const start = new Model(model.clock.clone());
    const log = new PatchLog(start);
    if (model.api.builder.patch.ops.length) {
      const patch = model.api.flush();
      log.push(patch);
    }
    return log;
  }

  public readonly patches = new AvlMap<ITimestampStruct, Patch>(compare);

  constructor (public readonly start: Model) {}

  public push(patch: Patch): void {
    const id = patch.getId();
    if (!id) return;
    this.patches.set(id, patch);
  }
}
