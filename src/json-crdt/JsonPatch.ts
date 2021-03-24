import type {Document} from "./document";
import {Draft} from "../json-crdt-patch/Draft";
import {Patch} from "../json-crdt-patch/Patch";
import {PatchBuilder} from "../json-crdt-patch/PatchBuilder";
import {Op, OpAdd} from "../json-patch/op";

export class JsonPatch {
  public readonly draft = new Draft();

  constructor (public readonly doc: Document) {}

  fromOps(ops: Op[]): Draft {
    const draft = new Draft();
    const {builder} = draft;
    for (const op of ops) {
      if (op instanceof OpAdd) {
        const steps = op.path;
        if (!steps.length) builder.root(builder.json(op.value));
        // const id = this.doc.find(op)
      }
    }
    return draft;
  }
}