import type {LogicalTimestamp} from './clock';
import {DeleteOperation} from './operations/DeleteOperation';
import {InsertArrayElementsOperation} from './operations/InsertArrayElementsOperation';
import {InsertStringSubstringOperation} from './operations/InsertStringSubstringOperation';
import {MakeArrayOperation} from './operations/MakeArrayOperation';
import {MakeConstantOperation} from './operations/MakeConstantOperation';
import {MakeNumberOperation} from './operations/MakeNumberOperation';
import {MakeObjectOperation} from './operations/MakeObjectOperation';
import {MakeStringOperation} from './operations/MakeStringOperation';
import {MakeValueOperation} from './operations/MakeValueOperation';
import {NoopOperation} from './operations/NoopOperation';
import {SetNumberOperation} from './operations/SetNumberOperation';
import {SetObjectKeysOperation} from './operations/SetObjectKeysOperation';
import {SetRootOperation} from './operations/SetRootOperation';
import {SetValueOperation} from './operations/SetValueOperation';

export type JsonCrdtPatchOperation =
  | DeleteOperation
  | InsertArrayElementsOperation
  | InsertStringSubstringOperation
  | MakeArrayOperation
  | MakeConstantOperation
  | MakeNumberOperation
  | MakeObjectOperation
  | MakeStringOperation
  | MakeValueOperation
  | NoopOperation
  | SetNumberOperation
  | SetValueOperation
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

  public span(): number {
    let span = 0;
    for (const op of this.ops) span += op.span();
    return span;
  }

  /**
   * Returns the expected time of the next inserted operation.
   */
  public nextTime(): number {
    if (!this.ops.length) return 0;
    const lastOp = this.ops[this.ops.length - 1];
    return lastOp.id.time + lastOp.span();
  }
}
