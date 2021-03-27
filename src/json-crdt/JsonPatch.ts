import type {Document} from "./document";
import {Draft} from "../json-crdt-patch/Draft";
import {Op, OpAdd} from "../json-patch/op";
import {LWWObjectType} from "./types/lww-object/LWWObjectType";

export class JsonPatch {
  public readonly draft = new Draft();

  constructor (public readonly doc: Document) {}

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
        const node = this.doc.find(objSteps);
        if (node instanceof LWWObjectType) {
          const key = String(steps[steps.length - 1]);
          const value = builder.json(op.value);
          builder.setKeys(node.id, [[key, value]]);
          continue;
        }
      }
    }
    return draft;
  }
}