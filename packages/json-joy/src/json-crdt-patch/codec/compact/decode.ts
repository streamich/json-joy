import {JsonCrdtPatchOpcode} from '../../constants';
import {fromBase64} from '@jsonjoy.com/base64/lib/fromBase64';
import {
  type ITimespanStruct,
  type ITimestampStruct,
  ClockVector,
  ServerClockVector,
  Timespan,
  Timestamp,
} from '../../clock';
import type {Patch} from '../../Patch';
import {PatchBuilder} from '../../PatchBuilder';
import {SESSION} from '../../constants';
import type * as types from './types';

const timestamp = (sid: number, x: types.CompactCodecTimestamp): ITimestampStruct => {
  return Array.isArray(x) ? new Timestamp(x[0], x[1]) : new Timestamp(sid, x);
};

const timespan = (sid: number, span: types.CompactCodecTimespan): ITimespanStruct => {
  return span.length === 3 ? new Timespan(span[0], span[1], span[2]) : new Timespan(sid, span[0], span[1]);
};

/**
 * Decodes a JSON CRDT Patch from a "compact" POJO into a {@link Patch} instance.
 *
 * @param data A JavaScript POJO array in the compact codec format.
 * @returns A decoded patch.
 */
export const decode = (data: types.CompactCodecPatch): Patch => {
  const header = data[0];
  const x = header[0];
  const clock = Array.isArray(x) ? new ClockVector(x[0], x[1]) : new ServerClockVector(SESSION.SERVER, x as number);
  const sid = clock.sid;
  const _time = clock.time;
  const builder = new PatchBuilder(clock);
  const length = data.length;

  for (let i = 1; i < length; i++) {
    const op = data[i] as types.CompactCodecOperation;
    switch (op[0]) {
      case JsonCrdtPatchOpcode.new_con: {
        const [, value, isTimestamp] = op;
        builder.con(isTimestamp ? timestamp(sid, value as types.CompactCodecTimestamp) : value);
        break;
      }
      case JsonCrdtPatchOpcode.new_val: {
        builder.val();
        break;
      }
      case JsonCrdtPatchOpcode.new_obj: {
        builder.obj();
        break;
      }
      case JsonCrdtPatchOpcode.new_vec: {
        builder.vec();
        break;
      }
      case JsonCrdtPatchOpcode.new_str: {
        builder.str();
        break;
      }
      case JsonCrdtPatchOpcode.new_bin: {
        builder.bin();
        break;
      }
      case JsonCrdtPatchOpcode.new_arr: {
        builder.arr();
        break;
      }
      case JsonCrdtPatchOpcode.ins_val: {
        builder.setVal(timestamp(sid, op[1]), timestamp(sid, op[2]));
        break;
      }
      case JsonCrdtPatchOpcode.ins_obj: {
        const obj = timestamp(sid, op[1]);
        const tuples: [key: string, value: ITimestampStruct][] = [];
        const value = op[2];
        const length = value.length;
        for (let j = 0; j < length; j++) {
          const [key, x] = value[j];
          tuples.push([key, timestamp(sid, x)]);
        }
        builder.insObj(obj, tuples);
        break;
      }
      case JsonCrdtPatchOpcode.ins_vec: {
        const obj = timestamp(sid, op[1]);
        const tuples: [key: number, value: ITimestampStruct][] = [];
        const value = op[2];
        const length = value.length;
        for (let j = 0; j < length; j++) {
          const [key, x] = value[j];
          tuples.push([key, timestamp(sid, x)]);
        }
        builder.insVec(obj, tuples);
        break;
      }
      case JsonCrdtPatchOpcode.ins_str: {
        builder.insStr(timestamp(sid, op[1]), timestamp(sid, op[2]), op[3]);
        break;
      }
      case JsonCrdtPatchOpcode.ins_bin: {
        builder.insBin(timestamp(sid, op[1]), timestamp(sid, op[2]), fromBase64(op[3]));
        break;
      }
      case JsonCrdtPatchOpcode.ins_arr: {
        const obj = timestamp(sid, op[1]);
        const ref = timestamp(sid, op[2]);
        const value = op[3];
        const elements: ITimestampStruct[] = [];
        const length = value.length;
        for (let j = 0; j < length; j++) elements.push(timestamp(sid, value[j]));
        builder.insArr(obj, ref, elements);
        break;
      }
      case JsonCrdtPatchOpcode.upd_arr: {
        const obj = timestamp(sid, op[1]);
        const ref = timestamp(sid, op[2]);
        const val = timestamp(sid, op[3]);
        builder.updArr(obj, ref, val);
        break;
      }
      case JsonCrdtPatchOpcode.del: {
        const obj = timestamp(sid, op[1]);
        const spans = op[2];
        const what: ITimespanStruct[] = [];
        const length = spans.length;
        for (let i = 0; i < length; i++) what.push(timespan(sid, spans[i]));
        builder.del(obj, what);
        break;
      }
      case JsonCrdtPatchOpcode.nop: {
        builder.nop(op[1] || 1);
        break;
      }
    }
  }

  const patch = builder.patch;
  patch.meta = header[1];

  return patch;
};
