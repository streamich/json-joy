import {Code} from '../compact/constants';
import {CrdtEncoder} from '../../util/binary/CrdtEncoder';
import {DeleteOperation} from '../../operations/DeleteOperation';
import {InsertArrayElementsOperation} from '../../operations/InsertArrayElementsOperation';
import {InsertBinaryDataOperation} from '../../operations/InsertBinaryDataOperation';
import {InsertStringSubstringOperation} from '../../operations/InsertStringSubstringOperation';
import {ITimestamp} from '../../clock';
import {JsonCrdtPatchOperation, Patch} from '../../Patch';
import {MakeArrayOperation} from '../../operations/MakeArrayOperation';
import {MakeBinaryOperation} from '../../operations/MakeBinaryOperation';
import {MakeNumberOperation} from '../../operations/MakeNumberOperation';
import {MakeObjectOperation} from '../../operations/MakeObjectOperation';
import {MakeStringOperation} from '../../operations/MakeStringOperation';
import {MakeValueOperation} from '../../operations/MakeValueOperation';
import {NoopOperation} from '../../operations/NoopOperation';
import {SetNumberOperation} from '../../operations/SetNumberOperation';
import {SetObjectKeysOperation} from '../../operations/SetObjectKeysOperation';
import {SetRootOperation} from '../../operations/SetRootOperation';
import {SetValueOperation} from '../../operations/SetValueOperation';

export class Encoder extends CrdtEncoder {
  public encode(patch: Patch): Uint8Array {
    this.reset();
    const id = patch.getId()!;
    this.uint53vuint39(id.getSessionId(), id.time);
    this.encodeOperations(patch);
    return this.flush();
  }

  public encodeOperations(patch: Patch): void {
    const ops = patch.ops;
    for (let i = 0; i < ops.length; i++) {
      const op = ops[i];
      this.encodeOperation(op);
    }
  }

  public encodeId(id: ITimestamp) {
    this.uint53vuint39(id.getSessionId(), id.time);
  }

  public encodeOperation(op: JsonCrdtPatchOperation): void {
    if (op instanceof MakeObjectOperation) {
      this.u8(Code.MakeObject);
      return;
    } else if (op instanceof MakeArrayOperation) {
      this.u8(Code.MakeArray);
      return;
    } else if (op instanceof MakeStringOperation) {
      this.u8(Code.MakeString);
      return;
    } else if (op instanceof MakeValueOperation) {
      this.u8(Code.MakeValue);
      this.encodeAny(op.value);
      return;
    } else if (op instanceof MakeNumberOperation) {
      this.u8(Code.MakeNumber);
      return;
    } else if (op instanceof SetRootOperation) {
      this.u8(Code.SetRoot);
      this.encodeId(op.value);
      return;
    } else if (op instanceof SetObjectKeysOperation) {
      this.u8(Code.SetObjectKeys);
      this.encodeId(op.object);
      this.vuint57(op.tuples.length);
      for (const [key, value] of op.tuples) {
        this.encodeId(value);
        this.encodeString(key);
      }
      return;
    } else if (op instanceof SetValueOperation) {
      this.u8(Code.SetValue);
      this.encodeId(op.obj);
      this.encodeAny(op.value);
      return;
    } else if (op instanceof SetNumberOperation) {
      this.u8(Code.SetValue);
      this.encodeId(op.num);
      this.encodeNumber(op.value);
      return;
    } else if (op instanceof InsertStringSubstringOperation) {
      this.u8(Code.InsertStringSubstring);
      this.encodeId(op.obj);
      this.encodeId(op.after);
      this.encodeString(op.substring);
      return;
    } else if (op instanceof InsertArrayElementsOperation) {
      const {arr, after, elements} = op;
      const length = elements.length;
      this.u8(Code.InsertArrayElements);
      this.encodeId(arr);
      this.encodeId(after);
      this.vuint57(length);
      for (let i = 0; i < length; i++) this.encodeId(elements[i]);
      return;
    } else if (op instanceof DeleteOperation) {
      const {obj, after} = op;
      const length = after.span;
      if (length > 1) {
        this.u8(Code.Delete);
        this.encodeId(obj);
        this.encodeId(after);
        this.vuint57(length);
        return;
      }
      this.u8(Code.DeleteOne);
      this.encodeId(obj);
      this.encodeId(after);
      return;
    } else if (op instanceof NoopOperation) {
      const {length} = op;
      if (length > 1) {
        this.u8(Code.NoopOne);
        this.vuint57(length);
        return;
      }
      this.u8(Code.NoopOne);
      return;
    } else if (op instanceof MakeBinaryOperation) {
      this.u8(Code.MakeBinary);
      return;
    } else if (op instanceof InsertBinaryDataOperation) {
      const buf = op.data;
      const length = buf.length;
      this.u8(Code.InsertBinaryData);
      this.encodeId(op.obj);
      this.encodeId(op.after);
      this.vuint57(length);
      this.buf(buf, length);
      return;
    }
    throw new Error('UNKNOWN_OP');
  }
}
