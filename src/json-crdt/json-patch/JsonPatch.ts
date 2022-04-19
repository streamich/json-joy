import {Draft} from '../../json-crdt-patch/Draft';
import {JsonPatchDraft} from './JsonPatchDraft';
import type {Model} from '../model/Model';
import type {Operation} from '../../json-patch';
import type {Patch} from '../../json-crdt-patch/Patch';

export class JsonPatch {
  constructor(public readonly model: Model) {}

  public createDraft(ops: Operation[]): Draft {
    const draft = new JsonPatchDraft(this.model);
    draft.applyOps(ops);
    return draft;
  }

  public createCrdtPatch(ops: Operation[]): Patch {
    return this.createDraft(ops).patch(this.model.clock);
  }

  public applyPatch(ops: Operation[]) {
    const patch = this.createCrdtPatch(ops);
    this.model.clock.tick(patch.span());
    this.model.applyPatch(patch);
  }
}
