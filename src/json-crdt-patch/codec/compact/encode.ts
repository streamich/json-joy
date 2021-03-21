import {DeleteOperation} from "../../operations/DeleteOperation";
import {InsertArrayElementsOperation} from "../../operations/InsertArrayElementsOperation";
import {InsertStringSubstringOperation} from "../../operations/InsertStringSubstringOperation";
import {MakeArrayOperation} from "../../operations/MakeArrayOperation";
import {MakeNumberOperation} from "../../operations/MakeNumberOperation";
import {MakeObjectOperation} from "../../operations/MakeObjectOperation";
import {MakeStringOperation} from "../../operations/MakeStringOperation";
import {SetNumberOperation} from "../../operations/SetNumberOperation";
import {SetObjectKeysOperation} from "../../operations/SetObjectKeysOperation";
import {SetRootOperation} from "../../operations/SetRootOperation";
import {Patch} from "../../Patch";

export const encode = (patch: Patch): unknown[] => {
  const id = patch.getId();
  if (!id) throw new Error('PATCH_EMPTY');

  const res: unknown[] = [id.sessionId, id.time];

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
      res.push(4, value.sessionId, value.time);
      continue;
    }
    if (op instanceof SetObjectKeysOperation) {
      const {object, tuples} = op;
      const triplets: (string | number)[] = [];
      for (const [key, value] of tuples) triplets.push(key, value.sessionId, value.time);
      res.push(5, object.sessionId, object.time, triplets);
      continue;
    }
    if (op instanceof SetNumberOperation) {
      const {after, value} = op;
      res.push(6, after.sessionId, after.time, value);
      continue;
    }
    if (op instanceof InsertStringSubstringOperation) {
      const {after, substring} = op;
      res.push(7, after.sessionId, after.time, substring);
      continue;
    }
    if (op instanceof InsertArrayElementsOperation) {
      const {after, elements} = op;
      const elementList: number[] = [];
      for (const element of elements) elementList.push(element.sessionId, element.time);
      res.push(8, after.sessionId, after.time, elementList);
      continue;
    }
    if (op instanceof DeleteOperation) {
      const {after, span} = op;
      if (span === 1) res.push(9, after.sessionId, after.time);
      else res.push(10, after.sessionId, after.time, span);
      continue;
    }
  }

  return res;
};
