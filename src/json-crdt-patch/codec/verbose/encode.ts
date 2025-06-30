import * as operations from '../../operations';
import type {Patch} from '../../Patch';
import {SESSION} from '../../constants';
import {toBase64} from '@jsonjoy.com/base64/lib/toBase64';
import {type ITimestampStruct, Timestamp} from '../../clock';
import type * as types from './types';

const encodeTimestamp = (ts: ITimestampStruct): types.JsonCodecTimestamp =>
  ts.sid === SESSION.SERVER ? ts.time : [ts.sid, ts.time];

/**
 * Encodes a patch into a JSON CRDT Patch "verbose" format.
 *
 * @param patch The {@link Patch} to encode.
 * @returns A JavaScript POJO object in JSON CRDT Patch "verbose" format.
 */
export const encode = (patch: Patch): types.JsonCodecPatch => {
  const id = patch.getId();
  if (!id) throw new Error('PATCH_EMPTY');

  const ops: types.JsonCodecPatch['ops'] = [];
  const res: types.JsonCodecPatch = {
    id: [id.sid, id.time],
    ops,
  };

  if (patch.meta !== undefined) res.meta = patch.meta;

  for (const op of patch.ops) {
    if (op instanceof operations.NewConOp) {
      const val = op.val;
      if (val instanceof Timestamp) {
        ops.push({op: 'new_con', timestamp: true, value: encodeTimestamp(val)});
      } else {
        ops.push({op: 'new_con', value: val});
      }
    } else if (op instanceof operations.NewObjOp) {
      ops.push({op: 'new_obj'});
    } else if (op instanceof operations.NewVecOp) {
      ops.push({op: 'new_vec'});
    } else if (op instanceof operations.NewArrOp) {
      ops.push({op: 'new_arr'});
    } else if (op instanceof operations.NewStrOp) {
      ops.push({op: 'new_str'});
    } else if (op instanceof operations.NewBinOp) {
      ops.push({op: 'new_bin'});
    } else if (op instanceof operations.NewValOp) {
      ops.push({op: 'new_val'});
    } else if (op instanceof operations.InsObjOp) {
      ops.push({
        op: 'ins_obj',
        obj: encodeTimestamp(op.obj),
        value: op.data.map(([key, value]) => [key, encodeTimestamp(value)]),
      });
    } else if (op instanceof operations.InsVecOp) {
      ops.push({
        op: 'ins_vec',
        obj: encodeTimestamp(op.obj),
        value: op.data.map(([key, value]) => [key, encodeTimestamp(value)]),
      });
    } else if (op instanceof operations.InsValOp) {
      ops.push({
        op: 'ins_val',
        obj: encodeTimestamp(op.obj),
        value: encodeTimestamp(op.val),
      });
    } else if (op instanceof operations.InsStrOp) {
      ops.push({
        op: 'ins_str',
        obj: encodeTimestamp(op.obj),
        after: encodeTimestamp(op.ref),
        value: op.data,
      });
    } else if (op instanceof operations.InsBinOp) {
      ops.push({
        op: 'ins_bin',
        obj: encodeTimestamp(op.obj),
        after: encodeTimestamp(op.ref),
        value: toBase64(op.data),
      });
    } else if (op instanceof operations.InsArrOp) {
      ops.push({
        op: 'ins_arr',
        obj: encodeTimestamp(op.obj),
        after: encodeTimestamp(op.ref),
        values: op.data.map(encodeTimestamp),
      });
    } else if (op instanceof operations.UpdArrOp) {
      ops.push({
        op: 'upd_arr',
        obj: encodeTimestamp(op.obj),
        ref: encodeTimestamp(op.ref),
        value: encodeTimestamp(op.val),
      });
    } else if (op instanceof operations.DelOp) {
      const encoded: types.JsonCodecDelOperation = {
        op: 'del',
        obj: encodeTimestamp(op.obj),
        what: op.what.map((span) => [span.sid, span.time, span.span] as types.JsonCodecTimespan),
      };
      ops.push(encoded);
    } else if (op instanceof operations.NopOp) {
      const encoded: types.JsonCodecNopOperation = {
        op: 'nop',
      };
      const length = op.len;
      if (length > 1) encoded.len = length;
      ops.push(encoded);
    }
  }

  return res;
};
