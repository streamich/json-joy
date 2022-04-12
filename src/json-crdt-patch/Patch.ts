import {DeleteOperation} from './operations/DeleteOperation';
import {InsertArrayElementsOperation} from './operations/InsertArrayElementsOperation';
import {InsertBinaryDataOperation} from './operations/InsertBinaryDataOperation';
import {InsertStringSubstringOperation} from './operations/InsertStringSubstringOperation';
import {MakeArrayOperation} from './operations/MakeArrayOperation';
import {MakeBinaryOperation} from './operations/MakeBinaryOperation';
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
import {ITimestamp, ServerTimestamp} from './clock';
import {SESSION} from './constants';

export type JsonCrdtPatchOperation =
  | DeleteOperation
  | InsertArrayElementsOperation
  | InsertStringSubstringOperation
  | InsertBinaryDataOperation
  | MakeArrayOperation
  | MakeConstantOperation
  | MakeNumberOperation
  | MakeObjectOperation
  | MakeStringOperation
  | MakeBinaryOperation
  | MakeValueOperation
  | NoopOperation
  | SetNumberOperation
  | SetValueOperation
  | SetObjectKeysOperation
  | SetRootOperation;

export class Patch {
  public readonly ops: JsonCrdtPatchOperation[] = [];

  constructor() {}

  public getId(): ITimestamp | undefined {
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

  public rewriteTime(ts: (id: ITimestamp) => ITimestamp): Patch {
    const patch = new Patch();
    const ops = this.ops;
    const length = ops.length;
    for (let i = 0; i < length; i++) {
      const op = ops[i];
      if (op instanceof DeleteOperation) patch.ops.push(new DeleteOperation(ts(op.id), ts(op.obj), op.after));
      else if (op instanceof InsertArrayElementsOperation)
        patch.ops.push(new InsertArrayElementsOperation(ts(op.id), ts(op.arr), ts(op.after), op.elements.map(ts)));
      else if (op instanceof InsertStringSubstringOperation)
        patch.ops.push(new InsertStringSubstringOperation(ts(op.id), ts(op.obj), ts(op.after), op.substring));
      else if (op instanceof InsertBinaryDataOperation)
        patch.ops.push(new InsertBinaryDataOperation(ts(op.id), ts(op.obj), ts(op.after), op.data));
      else if (op instanceof MakeArrayOperation) patch.ops.push(new MakeArrayOperation(ts(op.id)));
      else if (op instanceof MakeConstantOperation) patch.ops.push(new MakeConstantOperation(ts(op.id), op.value));
      else if (op instanceof MakeValueOperation) patch.ops.push(new MakeValueOperation(ts(op.id), op.value));
      else if (op instanceof MakeNumberOperation) patch.ops.push(new MakeNumberOperation(ts(op.id)));
      else if (op instanceof MakeObjectOperation) patch.ops.push(new MakeObjectOperation(ts(op.id)));
      else if (op instanceof MakeStringOperation) patch.ops.push(new MakeStringOperation(ts(op.id)));
      else if (op instanceof MakeBinaryOperation) patch.ops.push(new MakeBinaryOperation(ts(op.id)));
      else if (op instanceof SetNumberOperation)
        patch.ops.push(new SetNumberOperation(ts(op.id), ts(op.num), op.value));
      else if (op instanceof SetObjectKeysOperation)
        patch.ops.push(
          new SetObjectKeysOperation(
            ts(op.id),
            ts(op.object),
            op.tuples.map(([key, value]) => [key, ts(value)]),
          ),
        );
      else if (op instanceof SetRootOperation) patch.ops.push(new SetRootOperation(ts(op.id), ts(op.value)));
      else if (op instanceof NoopOperation) patch.ops.push(new NoopOperation(ts(op.id), op.length));
    }
    return patch;
  }
}
