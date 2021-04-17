import type {Model} from '../model/Model';
import type {Patch} from '../../json-crdt-patch/Patch';
import type {Operation as JsonPatchOperation} from '../../json-patch';
import {Draft} from '../../json-crdt-patch/Draft';
import {Op, operationToOp} from '../../json-patch/op';
import {JsonPatchDraft} from './JsonPatchDraft';

export class JsonPatch {
  constructor(public readonly model: Model) {}

  public createDraft(ops: Op[]): Draft {
    const draft = new JsonPatchDraft(this.model);
    draft.applyOps(ops);
    return draft;
  }

  public createCrdtPatch(ops: Op[]): Patch {
    return this.createDraft(ops).patch(this.model.clock);
  }

  public applyPatch(jsonPatch: JsonPatchOperation[]) {
    const ops = jsonPatch.map(operationToOp);
    const patch = this.createCrdtPatch(ops);
    this.model.clock.tick(patch.span());
    this.model.applyPatch(patch);
  }
}
