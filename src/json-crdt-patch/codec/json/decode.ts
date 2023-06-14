import {fromBase64} from '../../../util/base64/fromBase64';
import {ts, VectorClock, ServerVectorClock, tss, ITimestampStruct} from '../../clock';
import {SESSION} from '../../constants';
import {Patch} from '../../Patch';
import {PatchBuilder} from '../../PatchBuilder';
import {JsonCodecPatch, JsonCodecSetObjectKeysOperation, JsonCodecTimestamp} from './types';

const decodeId = (time: JsonCodecTimestamp): ITimestampStruct =>
  typeof time === 'number' ? ts(SESSION.SERVER, time) : ts(time[0], time[1]);

export const decode = (data: JsonCodecPatch): Patch => {
  const {id, ops} = data;
  const clock = typeof id === 'number' ? new ServerVectorClock(SESSION.SERVER, id) : new VectorClock(id[0], id[1]);
  const builder = new PatchBuilder(clock);

  for (const op of ops) {
    switch (op.op) {
      case 'obj': {
        builder.obj();
        break;
      }
      case 'arr': {
        builder.arr();
        break;
      }
      case 'str': {
        builder.str();
        break;
      }
      case 'bin': {
        builder.bin();
        break;
      }
      case 'val': {
        builder.val(decodeId(op.value));
        break;
      }
      case 'const': {
        if (op.timestamp) {
          builder.const(decodeId(op.value as JsonCodecTimestamp));
        } else {
          builder.const(op.value);
        }
        break;
      }
      case 'obj_set': {
        builder.setKeys(
          decodeId(op.obj),
          (op as JsonCodecSetObjectKeysOperation).tuples.map(([key, id]) => [key, decodeId(id)]),
        );
        break;
      }
      case 'val_set': {
        builder.setVal(decodeId(op.obj), decodeId(op.value));
        break;
      }
      case 'str_ins': {
        builder.insStr(decodeId(op.obj), decodeId(op.after || op.obj), op.value);
        break;
      }
      case 'bin_ins': {
        builder.insBin(decodeId(op.obj), decodeId(op.after || op.obj), fromBase64(op.value));
        break;
      }
      case 'arr_ins': {
        builder.insArr(decodeId(op.obj), decodeId(op.after || op.obj), op.values.map(decodeId));
        break;
      }
      case 'del': {
        builder.del(
          decodeId(op.obj),
          op.what.map((tuple) => tss(...tuple)),
        );
        break;
      }
      case 'noop': {
        builder.noop(op.len || 1);
        break;
      }
      case 'tup': {
        builder.tup();
        break;
      }
    }
  }

  return builder.patch;
};
