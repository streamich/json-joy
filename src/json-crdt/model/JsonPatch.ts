import type {Model} from './Model';
import type {Patch} from '../../json-crdt-patch/Patch';
import type {Operation} from '../../json-patch';
import {Draft} from '../../json-crdt-patch/Draft';
import {Op, OpAdd, operationToOp} from '../../json-patch/op';
import {ObjectType} from '../types/lww-object/ObjectType';

export class JsonPatch {
  public readonly draft = new Draft();

  constructor(public readonly model: Model) {}

  fromOps(ops: Op[]): Draft {
    const draft = new Draft();
    const {builder} = draft;
    for (const op of ops) {
      if (op instanceof OpAdd) {
        const steps = op.path;
        if (!steps.length) {
          builder.root(builder.json(op.value));
          continue;
        }
        const objSteps = steps.slice(0, steps.length - 1);
        const node = this.model.find(objSteps);
        if (node instanceof ObjectType) {
          const key = String(steps[steps.length - 1]);
          const value = builder.json(op.value);
          builder.setKeys(node.id, [[key, value]]);
          continue;
        }
      }
    }
    return draft;
  }

  public createCrdtPatch(jsonPatch: Operation[]): Patch {
    const ops = jsonPatch.map(operationToOp);
    const draft = this.fromOps(ops);
    const patch = draft.patch(this.model.clock);
    return patch;
  }

  public applyPatch(jsonPatch: Operation[]) {
    const patch = this.createCrdtPatch(jsonPatch);
    this.model.clock.tick(patch.span());
    this.model.applyPatch(patch);
  }
}
