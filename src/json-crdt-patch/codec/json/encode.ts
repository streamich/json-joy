import {ArrInsOp} from '../../operations/ArrInsOp';
import {ArrOp} from '../../operations/ArrOp';
import {BinInsOp} from '../../operations/BinInsOp';
import {BinOp} from '../../operations/BinOp';
import {ConstOp} from '../../operations/ConstOp';
import {DelOp} from '../../operations/DelOp';
import {NoopOp} from '../../operations/NoopOp';
import {ObjOp} from '../../operations/ObjOp';
import {ObjSetOp} from '../../operations/ObjSetOp';
import {Patch} from '../../Patch';
import {SESSION} from '../../constants';
import {StrInsOp} from '../../operations/StrInsOp';
import {StrOp} from '../../operations/StrOp';
import {toBase64} from '../../../util/base64/toBase64';
import {ValOp} from '../../operations/ValOp';
import {ValSetOp} from '../../operations/ValSetOp';
import {ITimestampStruct, Timestamp} from '../../clock';
import type {
  JsonCodecPatch,
  JsonCodecTimestamp,
  JsonCodecDeleteOperation,
  JsonCodecNoopOperation,
  JsonCodecTimespan,
} from './types';
import {TupOp} from '../../operations/TupOp';

const encodeTimestamp = (ts: ITimestampStruct): JsonCodecTimestamp =>
  ts.sid === SESSION.SERVER ? ts.time : [ts.sid, ts.time];

export const encode = (patch: Patch): JsonCodecPatch => {
  const id = patch.getId();
  if (!id) throw new Error('PATCH_EMPTY');

  const ops: JsonCodecPatch['ops'] = [];
  const res: JsonCodecPatch = {
    id: encodeTimestamp(id),
    ops,
  };

  for (const op of patch.ops) {
    if (op instanceof ObjOp) {
      ops.push({op: 'obj'});
    } else if (op instanceof ArrOp) {
      ops.push({op: 'arr'});
    } else if (op instanceof StrOp) {
      ops.push({op: 'str'});
    } else if (op instanceof BinOp) {
      ops.push({op: 'bin'});
    } else if (op instanceof ValOp) {
      ops.push({op: 'val', value: encodeTimestamp(op.val)});
    } else if (op instanceof ConstOp) {
      const val = op.val;
      if (val instanceof Timestamp) {
        ops.push({op: 'const', timestamp: true, value: encodeTimestamp(val)});
      } else {
        ops.push({op: 'const', value: val});
      }
    } else if (op instanceof ObjSetOp) {
      ops.push({
        op: 'obj_set',
        obj: encodeTimestamp(op.obj),
        tuples: op.data.map(([key, value]) => [key, encodeTimestamp(value)]),
      });
    } else if (op instanceof ValSetOp) {
      ops.push({
        op: 'val_set',
        obj: encodeTimestamp(op.obj),
        value: encodeTimestamp(op.val),
      });
    } else if (op instanceof StrInsOp) {
      ops.push({
        op: 'str_ins',
        obj: encodeTimestamp(op.obj),
        after: encodeTimestamp(op.ref),
        value: op.data,
      });
    } else if (op instanceof BinInsOp) {
      ops.push({
        op: 'bin_ins',
        obj: encodeTimestamp(op.obj),
        after: encodeTimestamp(op.ref),
        value: toBase64(op.data),
      });
    } else if (op instanceof ArrInsOp) {
      ops.push({
        op: 'arr_ins',
        obj: encodeTimestamp(op.obj),
        after: encodeTimestamp(op.ref),
        values: op.data.map(encodeTimestamp),
      });
    } else if (op instanceof DelOp) {
      const encoded: JsonCodecDeleteOperation = {
        op: 'del',
        obj: encodeTimestamp(op.obj),
        what: op.what.map((span) => [span.sid, span.time, span.span] as JsonCodecTimespan),
      };
      ops.push(encoded);
    } else if (op instanceof NoopOp) {
      const encoded: JsonCodecNoopOperation = {
        op: 'noop',
      };
      const length = op.len;
      if (length > 1) encoded.len = length;
      ops.push(encoded);
    } else if (op instanceof TupOp) {
      ops.push({op: 'tup'});
    }
  }

  return res;
};
