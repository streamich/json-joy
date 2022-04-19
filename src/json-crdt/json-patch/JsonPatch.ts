import {Draft} from '../../json-crdt-patch/Draft';
import {JsonPatchDraft} from './JsonPatchDraft';
import type {Model} from '../model/Model';
import type {Operation} from '../../json-patch';
import type {Patch} from '../../json-crdt-patch/Patch';

export class JsonPatch {
  protected draft = new JsonPatchDraft(this.model);

  constructor(public readonly model: Model) {}

  public apply(ops: Operation[]): this {
    this.draft.applyOps(ops);
    return this;
  }

  public commit(): Patch {
    const patch = this.draft.draft.patch(this.model.clock);
    this.model.clock.tick(patch.span());
    this.model.applyPatch(patch);
    this.draft = new JsonPatchDraft(this.model);
    return patch;
  }
}
