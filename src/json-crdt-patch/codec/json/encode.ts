import type {LogicalTimestamp} from '../../clock';
import {DeleteOperation} from '../../operations/DeleteOperation';
import {InsertArrayElementsOperation} from '../../operations/InsertArrayElementsOperation';
import {InsertStringSubstringOperation} from '../../operations/InsertStringSubstringOperation';
import {MakeArrayOperation} from '../../operations/MakeArrayOperation';
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
import {JsonCodecPatch, JsonCodecTimestamp, JsonCodecDeleteOperation, JsonCodecNoopOperation} from './types';

const encodeTimestamp = (ts: LogicalTimestamp): JsonCodecTimestamp => [ts.sessionId, ts.time];

export const encode = (patch: Patch): JsonCodecPatch => {
  const id = patch.getId();
  if (!id) throw new Error('PATCH_EMPTY');

  const ops: JsonCodecPatch['ops'] = [];
  const res: JsonCodecPatch = {
    id: encodeTimestamp(id),
    ops,
  };

  for (const op of patch.ops) {
    if (op instanceof MakeObjectOperation) {
      ops.push({op: 'obj'});
      continue;
    }
    if (op instanceof MakeArrayOperation) {
      ops.push({op: 'arr'});
      continue;
    }
    if (op instanceof MakeStringOperation) {
      ops.push({op: 'str'});
      continue;
    }
    if (op instanceof MakeNumberOperation) {
      ops.push({op: 'num'});
      continue;
    }
    if (op instanceof MakeValueOperation) {
      ops.push({op: 'val', value: op.value});
      continue;
    }
    if (op instanceof MakeConstantOperation) {
      ops.push({op: 'const', value: op.value});
      continue;
    }
    if (op instanceof SetRootOperation) {
      ops.push({
        op: 'root',
        value: encodeTimestamp(op.value),
      });
      continue;
    }
    if (op instanceof SetObjectKeysOperation) {
      ops.push({
        op: 'obj_set',
        obj: encodeTimestamp(op.object),
        tuples: op.tuples.map(([key, value]) => [key, encodeTimestamp(value)]),
      });
      continue;
    }
    if (op instanceof SetNumberOperation) {
      ops.push({
        op: 'num_set',
        after: encodeTimestamp(op.num),
        value: op.value,
      });
      continue;
    }
    if (op instanceof SetValueOperation) {
      ops.push({
        op: 'val_set',
        obj: encodeTimestamp(op.obj),
        value: op.value,
      });
      continue;
    }
    if (op instanceof InsertStringSubstringOperation) {
      ops.push({
        op: 'str_ins',
        obj: encodeTimestamp(op.obj),
        after: encodeTimestamp(op.after),
        value: op.substring,
      });
      continue;
    }
    if (op instanceof InsertArrayElementsOperation) {
      ops.push({
        op: 'arr_ins',
        obj: encodeTimestamp(op.arr),
        after: encodeTimestamp(op.after),
        values: op.elements.map(encodeTimestamp),
      });
      continue;
    }
    if (op instanceof DeleteOperation) {
      const encoded: JsonCodecDeleteOperation = {
        op: 'del',
        obj: encodeTimestamp(op.obj),
        after: encodeTimestamp(op.after),
      };
      const span = op.span();
      if (span > 1) encoded.len = span;
      ops.push(encoded);
      continue;
    }
    if (op instanceof NoopOperation) {
      const encoded: JsonCodecNoopOperation = {
        op: 'noop',
      };
      const length = op.length;
      if (length > 1) encoded.len = length;
      ops.push(encoded);
      continue;
    }
  }

  return res;
};
