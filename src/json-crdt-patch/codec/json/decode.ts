import {LogicalClock, LogicalTimestamp} from "../../clock";
import {Patch} from "../../Patch";
import {PatchBuilder} from "../../PatchBuilder";
import {JsonCodecPatch, JsonCodecSetObjectKeysOperation, JsonCodecTimestamp} from "./types";

const ts = (time: JsonCodecTimestamp): LogicalTimestamp => new LogicalTimestamp(time[0], time[1]);

export const decode = (data: JsonCodecPatch): Patch => {
  const {id, ops} = data;
  const clock = new LogicalClock(id[0], id[1]);
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
      case 'num': {
        builder.num();
        break;
      }
      case 'root': {
        builder.root(ts(op.value));
        break;
      }
      case 'obj_set': {
        builder.setKeys(ts(op.obj), (op as JsonCodecSetObjectKeysOperation).tuples.map(([key, id]) => [key, ts(id)]));
        break;
      }
      case 'num_set': {
        builder.setNum(ts(op.after), op.value);
        break;
      }
      case 'str_ins': {
        builder.insStr(ts(op.after), op.value);
        break;
      }
      case 'arr_ins': {
        builder.insArr(ts(op.arr), ts(op.after || op.arr), op.values.map(ts));
        break;
      }
      case 'del': {
        builder.del(ts(op.after), op.len || 1);
        break;
      }
    }
  }

  return builder.patch;
};
