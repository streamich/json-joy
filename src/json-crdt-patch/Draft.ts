import {LogicalClock, LogicalTimestamp} from './clock';
import {PatchBuilder} from './PatchBuilder';
import {Patch} from './Patch';
import {DeleteOperation} from './operations/DeleteOperation';
import {InsertArrayElementsOperation} from './operations/InsertArrayElementsOperation';
import {InsertStringSubstringOperation} from './operations/InsertStringSubstringOperation';
import {MakeArrayOperation} from './operations/MakeArrayOperation';
import {MakeNumberOperation} from './operations/MakeNumberOperation';
import {MakeObjectOperation} from './operations/MakeObjectOperation';
import {MakeStringOperation} from './operations/MakeStringOperation';
import {SetNumberOperation} from './operations/SetNumberOperation';
import {SetObjectKeysOperation} from './operations/SetObjectKeysOperation';
import {SetRootOperation} from './operations/SetRootOperation';
import {NoopOperation} from './operations/NoopOperation';
import {MakeConstantOperation} from './operations/MakeConstantOperation';
import {MakeValueOperation} from './operations/MakeValueOperation';

/**
 * Draft class provides a way to build a patch for which it is not known the
 * LogicalClock value yet, it then can construct a Patch with any starting
 * LogicalClock value.
 *
 * It works by creating a temporary patch with LogicalClock that starts at (sessionId = -1, time = 0)
 * and then it can replay the temporary patch while replacing the placeholder
 * timestamps with real values.
 *
 * You use `draft.builder` to construct the temporary patch and then provide the
 * real clock to the `patch` method to compute the actual patch with correct timestamps.
 *
 * ```ts
 * const draft = new Draft();
 * const str = draft.builder.str();
 * draft.builder.insStr(str, str, 'abc');
 * draft.builder.root(str);
 * const patch = draft.patch(clock);
 * ````
 */
export class Draft {
  public readonly builder = new PatchBuilder(new LogicalClock(-1, 0));

  /**
   * Creates a new patch where all timestamps with (sessionId == -1) are replaced
   * with correct timestamps.
   */
  public patch(clock: LogicalClock): Patch {
    const patch = new Patch();
    const ops = this.builder.patch.ops;
    const ts = (id: LogicalTimestamp) =>
      id.sessionId !== -1 ? id : new LogicalTimestamp(clock.sessionId, clock.time + id.time);
    for (const op of ops) {
      if (op instanceof DeleteOperation)
        patch.ops.push(new DeleteOperation(ts(op.id), ts(op.obj), ts(op.after), op.length));
      else if (op instanceof InsertArrayElementsOperation)
        patch.ops.push(new InsertArrayElementsOperation(ts(op.id), ts(op.arr), ts(op.after), op.elements.map(ts)));
      else if (op instanceof InsertStringSubstringOperation)
        patch.ops.push(new InsertStringSubstringOperation(ts(op.id), ts(op.obj), ts(op.after), op.substring));
      else if (op instanceof MakeArrayOperation) patch.ops.push(new MakeArrayOperation(ts(op.id)));
      else if (op instanceof MakeConstantOperation) patch.ops.push(new MakeConstantOperation(ts(op.id), op.value));
      else if (op instanceof MakeValueOperation) patch.ops.push(new MakeValueOperation(ts(op.id), op.value));
      else if (op instanceof MakeNumberOperation) patch.ops.push(new MakeNumberOperation(ts(op.id)));
      else if (op instanceof MakeObjectOperation) patch.ops.push(new MakeObjectOperation(ts(op.id)));
      else if (op instanceof MakeStringOperation) patch.ops.push(new MakeStringOperation(ts(op.id)));
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
