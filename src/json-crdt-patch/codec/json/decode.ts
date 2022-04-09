import {fromBase64} from '../../../util/base64/decode';
import {ITimestamp, LogicalTimestamp, LogicalVectorClock} from '../../clock';
import {Patch} from '../../Patch';
import {PatchBuilder} from '../../PatchBuilder';
import {JsonCodecPatch, JsonCodecSetObjectKeysOperation, JsonCodecTimestamp} from './types';

const ts = (time: JsonCodecTimestamp): ITimestamp => new LogicalTimestamp(time[0], time[1]);

export const decode = (data: JsonCodecPatch): Patch => {
  const {id, ops} = data;
  const clock = new LogicalVectorClock(id[0], id[1]);
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
        builder.str();
        break;
      }
      case 'num': {
        builder.num();
        break;
      }
      case 'val': {
        builder.val(op.value);
        break;
      }
      case 'const': {
        builder.const(op.value);
        break;
      }
      case 'root': {
        builder.root(ts(op.value));
        break;
      }
      case 'obj_set': {
        builder.setKeys(
          ts(op.obj),
          (op as JsonCodecSetObjectKeysOperation).tuples.map(([key, id]) => [key, ts(id)]),
        );
        break;
      }
      case 'val_set': {
        builder.setVal(ts(op.obj), op.value);
        break;
      }
      case 'num_set': {
        builder.setNum(ts(op.after), op.value);
        break;
      }
      case 'str_ins': {
        builder.insStr(ts(op.obj), ts(op.after || op.obj), op.value);
        break;
      }
      case 'bin_ins': {
        builder.insBin(ts(op.obj), ts(op.after || op.obj), fromBase64(op.value));
        break;
      }
      case 'arr_ins': {
        builder.insArr(ts(op.obj), ts(op.after || op.obj), op.values.map(ts));
        break;
      }
      case 'del': {
        builder.del(ts(op.obj), ts(op.after), op.len || 1);
        break;
      }
      case 'noop': {
        builder.noop(op.len || 1);
        break;
      }
    }
  }

  return builder.patch;
};
