import {fromBase64} from '@jsonjoy.com/base64/lib/fromBase64';
import {ts, ClockVector, ServerClockVector, tss, type ITimestampStruct} from '../../clock';
import {SESSION} from '../../constants';
import type {Patch} from '../../Patch';
import {PatchBuilder} from '../../PatchBuilder';
import type * as types from './types';

const decodeId = (time: types.JsonCodecTimestamp): ITimestampStruct =>
  typeof time === 'number' ? ts(SESSION.SERVER, time) : ts(time[0], time[1]);

/**
 * Decodes a JSON CRDT patch from a JavaScript POJO into a {@link Patch} instance.
 *
 * @param data A JavaScript POJO representing a JSON CRDT patch in "verbose" format.
 * @returns A decoded {@link Patch} instance.
 */
export const decode = (data: types.JsonCodecPatch): Patch => {
  const {id, ops} = data;
  const clock = typeof id === 'number' ? new ServerClockVector(SESSION.SERVER, id) : new ClockVector(id[0], id[1]);
  const builder = new PatchBuilder(clock);

  for (const op of ops) {
    switch (op.op) {
      case 'new_con': {
        if (op.timestamp) {
          builder.con(decodeId(op.value as types.JsonCodecTimestamp));
        } else {
          builder.con(op.value);
        }
        break;
      }
      case 'new_val': {
        builder.val();
        break;
      }
      case 'new_obj': {
        builder.obj();
        break;
      }
      case 'new_vec': {
        builder.vec();
        break;
      }
      case 'new_str': {
        builder.str();
        break;
      }
      case 'new_bin': {
        builder.bin();
        break;
      }
      case 'new_arr': {
        builder.arr();
        break;
      }
      case 'ins_val': {
        builder.setVal(decodeId(op.obj), decodeId(op.value));
        break;
      }
      case 'ins_obj': {
        builder.insObj(
          decodeId(op.obj),
          (op as types.JsonCodecInsObjOperation).value.map(([key, id]) => [key, decodeId(id)]),
        );
        break;
      }
      case 'ins_vec': {
        builder.insVec(
          decodeId(op.obj),
          (op as types.JsonCodecInsVecOperation).value.map(([key, id]) => [key, decodeId(id)]),
        );
        break;
      }
      case 'ins_str': {
        builder.insStr(decodeId(op.obj), decodeId(op.after || op.obj), op.value);
        break;
      }
      case 'ins_bin': {
        builder.insBin(decodeId(op.obj), decodeId(op.after || op.obj), fromBase64(op.value));
        break;
      }
      case 'ins_arr': {
        builder.insArr(decodeId(op.obj), decodeId(op.after || op.obj), op.values.map(decodeId));
        break;
      }
      case 'upd_arr': {
        builder.updArr(decodeId(op.obj), decodeId(op.ref), decodeId(op.value));
        break;
      }
      case 'del': {
        builder.del(
          decodeId(op.obj),
          op.what.map((spans) => tss(...spans)),
        );
        break;
      }
      case 'nop': {
        builder.nop(op.len || 1);
        break;
      }
    }
  }

  const patch = builder.patch;
  patch.meta = data.meta;

  return patch;
};
