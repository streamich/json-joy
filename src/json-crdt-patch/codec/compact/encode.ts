import * as operations from '../../operations';
import {type ITimespanStruct, type ITimestampStruct, Timestamp} from '../../clock';
import {JsonCrdtPatchOpcode, SESSION} from '../../constants';
import {toBase64} from '@jsonjoy.com/base64/lib/toBase64';
import type {Patch} from '../../Patch';
import type * as types from './types';

const timestamp = (sid: number, ts: ITimestampStruct): types.CompactCodecTimestamp => {
  const tsSessionId = ts.sid;
  return tsSessionId === sid ? ts.time : [tsSessionId, ts.time];
};

const timespan = (sid: number, span: ITimespanStruct): types.CompactCodecTimespan => {
  const ts = timestamp(sid, span);
  if (ts instanceof Array) {
    ts.push(span.span);
    return ts;
  }
  return [ts, span.span];
};

/**
 * Encodes a patch into a compact binary format into a JavaScript array.
 *
 * @param patch The patch to encode.
 * @returns The encoded patch as a JavaScript POJO.
 */
export const encode = (patch: Patch): types.CompactCodecPatch => {
  const id = patch.getId();
  if (!id) throw new Error('PATCH_EMPTY');

  const sid = id.sid;
  const time = id.time;
  const header: types.CompactCodecPatch[0] = sid === SESSION.SERVER ? [time] : [[sid, time]];
  const meta = patch.meta;
  if (meta !== undefined) header.push(meta);
  const res: types.CompactCodecPatch = [header];

  for (const op of patch.ops) {
    if (op instanceof operations.NewConOp) {
      const val = op.val;
      if (val instanceof Timestamp) {
        res.push([JsonCrdtPatchOpcode.new_con, timestamp(sid, val), true]);
      } else if (val === undefined) {
        res.push([JsonCrdtPatchOpcode.new_con]);
      } else {
        res.push([JsonCrdtPatchOpcode.new_con, val]);
      }
    } else if (op instanceof operations.NewValOp) {
      res.push([JsonCrdtPatchOpcode.new_val]);
    } else if (op instanceof operations.NewObjOp) {
      res.push([JsonCrdtPatchOpcode.new_obj]);
    } else if (op instanceof operations.NewVecOp) {
      res.push([JsonCrdtPatchOpcode.new_vec]);
    } else if (op instanceof operations.NewStrOp) {
      res.push([JsonCrdtPatchOpcode.new_str]);
    } else if (op instanceof operations.NewBinOp) {
      res.push([JsonCrdtPatchOpcode.new_bin]);
    } else if (op instanceof operations.NewArrOp) {
      res.push([JsonCrdtPatchOpcode.new_arr]);
    } else if (op instanceof operations.InsValOp) {
      res.push([JsonCrdtPatchOpcode.ins_val, timestamp(sid, op.obj), timestamp(sid, op.val)]);
    } else if (op instanceof operations.InsObjOp) {
      const tuples: types.CompactCodecInsObjOperation[2] = [];
      for (const [key, value] of op.data) tuples.push([key, timestamp(sid, value)]);
      const operation: types.CompactCodecInsObjOperation = [
        JsonCrdtPatchOpcode.ins_obj,
        timestamp(sid, op.obj),
        tuples,
      ];
      res.push(operation);
    } else if (op instanceof operations.InsVecOp) {
      const tuples: types.CompactCodecInsVecOperation[2] = [];
      for (const [key, value] of op.data) tuples.push([key, timestamp(sid, value)]);
      const operation: types.CompactCodecInsVecOperation = [
        JsonCrdtPatchOpcode.ins_vec,
        timestamp(sid, op.obj),
        tuples,
      ];
      res.push(operation);
    } else if (op instanceof operations.InsStrOp) {
      const operation: types.CompactCodecInsStrOperation = [
        JsonCrdtPatchOpcode.ins_str,
        timestamp(sid, op.obj),
        timestamp(sid, op.ref),
        op.data,
      ];
      res.push(operation);
    } else if (op instanceof operations.InsBinOp) {
      const operation: types.CompactCodecInsBinOperation = [
        JsonCrdtPatchOpcode.ins_bin,
        timestamp(sid, op.obj),
        timestamp(sid, op.ref),
        toBase64(op.data),
      ];
      res.push(operation);
    } else if (op instanceof operations.InsArrOp) {
      const elements: types.CompactCodecInsArrOperation[3] = [];
      for (const element of op.data) elements.push(timestamp(sid, element));
      const operation: types.CompactCodecInsArrOperation = [
        JsonCrdtPatchOpcode.ins_arr,
        timestamp(sid, op.obj),
        timestamp(sid, op.ref),
        elements,
      ];
      res.push(operation);
    } else if (op instanceof operations.UpdArrOp) {
      const operation: types.CompactCodecUpdArrOperation = [
        JsonCrdtPatchOpcode.upd_arr,
        timestamp(sid, op.obj),
        timestamp(sid, op.ref),
        timestamp(sid, op.val),
      ];
      res.push(operation);
    } else if (op instanceof operations.DelOp) {
      const operation: types.CompactCodecDelOperation = [
        JsonCrdtPatchOpcode.del,
        timestamp(sid, op.obj),
        op.what.map((span) => timespan(sid, span)),
      ];
      res.push(operation);
    } else if (op instanceof operations.NopOp) {
      const operation: types.CompactCodecNopOperation = [JsonCrdtPatchOpcode.nop];
      const len = op.len;
      if (len > 1) operation.push(len);
      res.push(operation);
    }
  }

  return res;
};
