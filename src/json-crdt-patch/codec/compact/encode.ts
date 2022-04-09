import {toBase64} from '../../../util/base64/encode';
import {ITimestamp} from '../../clock';
import {DeleteOperation} from '../../operations/DeleteOperation';
import {InsertArrayElementsOperation} from '../../operations/InsertArrayElementsOperation';
import {InsertBinaryDataOperation} from '../../operations/InsertBinaryDataOperation';
import {InsertStringSubstringOperation} from '../../operations/InsertStringSubstringOperation';
import {MakeArrayOperation} from '../../operations/MakeArrayOperation';
import {MakeBinaryOperation} from '../../operations/MakeBinaryOperation';
import {MakeConstantOperation} from '../../operations/MakeConstantOperation';
import {MakeNumberOperation} from '../../operations/MakeNumberOperation';
import {MakeObjectOperation} from '../../operations/MakeObjectOperation';
import {MakeStringOperation} from '../../operations/MakeStringOperation';
import {MakeValueOperation} from '../../operations/MakeValueOperation';
import {NoopOperation} from '../../operations/NoopOperation';
import {SetNumberOperation} from '../../operations/SetNumberOperation';
import {SetObjectKeysOperation} from '../../operations/SetObjectKeysOperation';
import {SetRootOperation} from '../../operations/SetRootOperation';
import {SetValueOperation} from '../../operations/SetValueOperation';
import {Patch} from '../../Patch';
import {Code} from './constants';

export const encode = (patch: Patch): unknown[] => {
  const id = patch.getId();
  if (!id) throw new Error('PATCH_EMPTY');

  const sessionId = id.getSessionId();
  const {time} = id;
  const res: unknown[] = [sessionId, time];

  const pushTimestamp = (ts: ITimestamp) => {
    const tsSessionId = ts.getSessionId();
    if (tsSessionId === sessionId && ts.time >= time) res.push(time - ts.time - 1);
    else res.push(tsSessionId, ts.time);
  };

  for (const op of patch.ops) {
    if (op instanceof MakeObjectOperation) {
      res.push(Code.MakeObject);
      continue;
    }
    if (op instanceof MakeArrayOperation) {
      res.push(Code.MakeArray);
      continue;
    }
    if (op instanceof MakeStringOperation) {
      res.push(Code.MakeString);
      continue;
    }
    if (op instanceof MakeBinaryOperation) {
      res.push(Code.MakeBinary);
      continue;
    }
    if (op instanceof MakeNumberOperation) {
      res.push(Code.MakeNumber);
      continue;
    }
    if (op instanceof SetRootOperation) {
      const {value} = op;
      res.push(Code.SetRoot);
      pushTimestamp(value);
      continue;
    }
    if (op instanceof SetObjectKeysOperation) {
      const {object, tuples} = op;
      res.push(Code.SetObjectKeys, tuples.length);
      pushTimestamp(object);
      for (const [key, value] of tuples) {
        res.push(key);
        pushTimestamp(value);
      }
      continue;
    }
    if (op instanceof SetNumberOperation) {
      const {num, value} = op;
      res.push(Code.SetNumber, value);
      pushTimestamp(num);
      continue;
    }
    if (op instanceof InsertStringSubstringOperation) {
      const {obj, after, substring} = op;
      res.push(Code.InsertStringSubstring, substring);
      pushTimestamp(obj);
      pushTimestamp(after);
      continue;
    }
    if (op instanceof InsertBinaryDataOperation) {
      const {obj, after, data} = op;
      res.push(Code.InsertBinaryData, toBase64(data));
      pushTimestamp(obj);
      pushTimestamp(after);
      continue;
    }
    if (op instanceof InsertArrayElementsOperation) {
      const {arr, after, elements} = op;
      res.push(Code.InsertArrayElements, elements.length);
      pushTimestamp(arr);
      pushTimestamp(after);
      for (const element of elements) pushTimestamp(element);
      continue;
    }
    if (op instanceof DeleteOperation) {
      const {obj, after, length} = op;
      if (length === 1) {
        res.push(Code.DeleteOne);
        pushTimestamp(obj);
        pushTimestamp(after);
      } else {
        res.push(Code.Delete, length);
        pushTimestamp(obj);
        pushTimestamp(after);
      }
      continue;
    }
    if (op instanceof NoopOperation) {
      const {length} = op;
      if (length === 1) res.push(Code.NoopOne);
      else res.push(Code.Noop, length);
      continue;
    }
    if (op instanceof MakeConstantOperation) {
      res.push(Code.MakeConstant);
      res.push(op.value);
      continue;
    }
    if (op instanceof MakeValueOperation) {
      res.push(Code.MakeValue);
      res.push(op.value);
      continue;
    }
    if (op instanceof SetValueOperation) {
      res.push(Code.SetValue);
      pushTimestamp(op.obj);
      res.push(op.value);
      continue;
    }
  }

  return res;
};
