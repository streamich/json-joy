import {Code} from './constants';
import {fromBase64} from '../../../util/base64/fromBase64';
import {interval, ITimespanStruct, ITimestampStruct, VectorClock, ServerVectorClock, ts} from '../../clock';
import {Patch} from '../../Patch';
import {PatchBuilder} from '../../PatchBuilder';
import {SESSION} from '../../constants';

export const decode = (data: unknown[]): Patch => {
  const x = data[0];
  const clock = Array.isArray(x) ? new VectorClock(x[0], x[1]) : new ServerVectorClock(SESSION.SERVER, x as number);
  const sessionId = clock.sid;
  const time = clock.time;
  const builder = new PatchBuilder(clock);
  const length = data.length;
  let i = 1;

  const decodeTimestamp = (): ITimestampStruct => {
    const x = data[i++] as number;
    if (Array.isArray(x)) return ts(x[0], x[1]);
    else if (x < 0) return ts(sessionId, time - x - 1);
    else return ts(SESSION.SERVER, x);
  };

  const decodeTimespan = (): ITimespanStruct => {
    const time = decodeTimestamp();
    const span = data[i++];
    return interval(time, 0, span as number);
  };

  while (i < length) {
    switch (data[i++]) {
      case Code.MakeObject: {
        builder.obj();
        break;
      }
      case Code.MakeArray: {
        builder.arr();
        break;
      }
      case Code.MakeString: {
        builder.str();
        break;
      }
      case Code.MakeBinary: {
        builder.bin();
        break;
      }
      case Code.SetObjectKeys: {
        const length = data[i++] as number;
        const obj = decodeTimestamp();
        const tuples: [key: string | number, value: ITimestampStruct][] = [];
        for (let j = 0; j < length; j++) {
          const key = data[i++] as string | number;
          tuples.push([key, decodeTimestamp()]);
        }
        builder.setKeys(obj, tuples);
        break;
      }
      case Code.InsertStringSubstring: {
        const value = data[i++] as string;
        builder.insStr(decodeTimestamp(), decodeTimestamp(), value);
        break;
      }
      case Code.InsertBinaryData: {
        const value = data[i++] as string;
        builder.insBin(decodeTimestamp(), decodeTimestamp(), fromBase64(value));
        break;
      }
      case Code.InsertArrayElements: {
        const length = data[i++] as number;
        const arr = decodeTimestamp();
        const after = decodeTimestamp();
        const values: ITimestampStruct[] = [];
        for (let j = 0; j < length; j++) values.push(decodeTimestamp());
        builder.insArr(arr, after, values);
        break;
      }
      case Code.DeleteOne: {
        const obj = decodeTimestamp();
        const what = decodeTimespan();
        builder.del(obj, [what]);
        break;
      }
      case Code.Delete: {
        const length = data[i++] as number;
        const obj = decodeTimestamp();
        const what: ITimespanStruct[] = [];
        for (let i = 0; i < length; i++) what.push(decodeTimespan());
        builder.del(obj, what);
        break;
      }
      case Code.NoopOne: {
        builder.noop(1);
        break;
      }
      case Code.Noop: {
        builder.noop(data[i++] as number);
        break;
      }
      case Code.MakeConstant: {
        builder.const(data[i++]);
        break;
      }
      case Code.MakeUndefined: {
        builder.const(undefined);
        break;
      }
      case Code.MakeConstId: {
        builder.const(decodeTimestamp());
        break;
      }
      case Code.MakeValue: {
        builder.val(decodeTimestamp());
        break;
      }
      case Code.SetValue: {
        const obj = decodeTimestamp();
        const value = decodeTimestamp();
        builder.setVal(obj, value);
        break;
      }
      case Code.MakeTuple: {
        builder.tup();
        break;
      }
    }
  }

  return builder.patch;
};
