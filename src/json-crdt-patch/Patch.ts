import type {LogicalTimestamp} from '../json-crdt/clock';
import {DeleteArrayElementsOperation} from './operations/DeleteArrayElementsOperation';
import {DeleteStringSubstringOperation} from './operations/DeleteStringSubstringOperation';
import {InsertArrayElementsOperation} from './operations/InsertArrayElementsOperation';
import {InsertStringSubstringOperation} from "./operations/InsertStringSubstringOperation";
import {MakeArrayOperation} from "./operations/MakeArrayOperation";
import {MakeNumberOperation} from "./operations/MakeNumberOperation";
import {MakeObjectOperation} from "./operations/MakeObjectOperation";
import {MakeStringOperation} from "./operations/MakeStringOperation";
import {SetObjectKeysOperation} from "./operations/SetObjectKeysOperation";
import {SetRootOperation} from "./operations/SetRootOperation";

export type JsonCrdtPatchOperation =
  | DeleteArrayElementsOperation
  | DeleteStringSubstringOperation
  | InsertArrayElementsOperation
  | InsertStringSubstringOperation
  | MakeArrayOperation
  | MakeNumberOperation
  | MakeObjectOperation
  | MakeStringOperation
  | SetObjectKeysOperation
  | SetRootOperation;

export class Patch {
  public readonly ops: JsonCrdtPatchOperation[] = [];

  constructor() {}

  public getId(): LogicalTimestamp | undefined {
    const op = this.ops[0];
    if (!op) return undefined;
    return op.id;
  }

  public getSpan(): number {
    let span = 0;
    for (const op of this.ops) span += op.getSpan();
    return span;
  }
}
