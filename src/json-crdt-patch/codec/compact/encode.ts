import {LogicalTimestamp} from "../../clock";
import {DeleteOperation} from "../../operations/DeleteOperation";
import {InsertArrayElementsOperation} from "../../operations/InsertArrayElementsOperation";
import {InsertStringSubstringOperation} from "../../operations/InsertStringSubstringOperation";
import {MakeArrayOperation} from "../../operations/MakeArrayOperation";
import {MakeNumberOperation} from "../../operations/MakeNumberOperation";
import {MakeObjectOperation} from "../../operations/MakeObjectOperation";
import {MakeStringOperation} from "../../operations/MakeStringOperation";
import {NoopOperation} from "../../operations/NoopOperation";
import {SetNumberOperation} from "../../operations/SetNumberOperation";
import {SetObjectKeysOperation} from "../../operations/SetObjectKeysOperation";
import {SetRootOperation} from "../../operations/SetRootOperation";
import {Patch} from "../../Patch";

export const encode = (patch: Patch): unknown[] => {
  const id = patch.getId();
  if (!id) throw new Error('PATCH_EMPTY');

  const {sessionId, time} = id;
  const res: unknown[] = [sessionId, time];

  const pushTimestamp = (ts: LogicalTimestamp) => {
    if (ts.sessionId === sessionId) res.push(time - ts.time - 1);
    else res.push(ts.sessionId, ts.time);
  };

  for (const op of patch.ops) {
    if (op instanceof MakeObjectOperation) {
      res.push(0);
      continue;
    }
    if (op instanceof MakeArrayOperation) {
      res.push(1);
      continue;
    }
    if (op instanceof MakeStringOperation) {
      res.push(2);
      continue;
    }
    if (op instanceof MakeNumberOperation) {
      res.push(3);
      continue;
    }
    if (op instanceof SetRootOperation) {
      const {value} = op;
      res.push(4);
      pushTimestamp(value);
      continue;
    }
    if (op instanceof SetObjectKeysOperation) {
      const {object, tuples} = op;
      res.push(5, tuples.length);
      pushTimestamp(object);
      for (const [key, value] of tuples) {
        res.push(key);
        pushTimestamp(value);
      }
      continue;
    }
    if (op instanceof SetNumberOperation) {
      const {num, value} = op;
      res.push(6, value);
      pushTimestamp(num);
      continue;
    }
    if (op instanceof InsertStringSubstringOperation) {
      const {obj, after, substring} = op;
      res.push(7, substring);
      pushTimestamp(obj);
      pushTimestamp(after);
      continue;
    }
    if (op instanceof InsertArrayElementsOperation) {
      const {arr, after, elements} = op;
      res.push(8, elements.length);
      pushTimestamp(arr);
      pushTimestamp(after);
      for (const element of elements) pushTimestamp(element);
      continue;
    }
    if (op instanceof DeleteOperation) {
      const {obj, after, length} = op;
      if (length === 1) {
        res.push(9);
        pushTimestamp(obj);
        pushTimestamp(after);
      } else {
        res.push(10, length);
        pushTimestamp(obj);
        pushTimestamp(after);
      }
      continue;
    }
    if (op instanceof NoopOperation) {
      const {length} = op;
      if (length === 1) res.push(11);
      else res.push(12, length);
      continue;
    }
  }

  return res;
};
