import {LogicalClock, LogicalTimestamp} from '../../clock';
import {Patch} from '../../Patch';
import {PatchBuilder} from '../../PatchBuilder';
import {Code} from './constants';

export const decode = (data: unknown[]): Patch => {
  const sessionId = data[0] as number;
  const time = data[1] as number;
  const clock = new LogicalClock(sessionId, time);
  const builder = new PatchBuilder(clock);
  const length = data.length;
  let i = 2;

  const decodeTimestamp = (): LogicalTimestamp => {
    const x = data[i++] as number;
    if (x < 0) return new LogicalTimestamp(sessionId, time - x - 1);
    else return new LogicalTimestamp(x, data[i++] as number);
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
      case Code.MakeNumber: {
        builder.num();
        break;
      }
      case Code.SetRoot: {
        builder.root(decodeTimestamp());
        break;
      }
      case Code.SetObjectKeys: {
        const length = data[i++] as number;
        const obj = decodeTimestamp();
        const tuples: [key: string, value: LogicalTimestamp][] = [];
        for (let j = 0; j < length; j++) {
          const key = data[i++] as string;
          tuples.push([key, decodeTimestamp()]);
        }
        builder.setKeys(obj, tuples);
        break;
      }
      case Code.SetNumber: {
        const value = data[i++] as number;
        builder.setNum(decodeTimestamp(), value);
        break;
      }
      case Code.InsertStringSubstring: {
        const value = data[i++] as string;
        builder.insStr(decodeTimestamp(), decodeTimestamp(), value);
        break;
      }
      case Code.InsertArrayElements: {
        const length = data[i++] as number;
        const arr = decodeTimestamp();
        const after = decodeTimestamp();
        const values: LogicalTimestamp[] = [];
        for (let j = 0; j < length; j++) values.push(decodeTimestamp());
        builder.insArr(arr, after, values);
        break;
      }
      case Code.DeleteOne: {
        const obj = decodeTimestamp();
        const after = decodeTimestamp();
        builder.del(obj, after, 1);
        break;
      }
      case Code.Delete: {
        const span = data[i++] as number;
        const obj = decodeTimestamp();
        const after = decodeTimestamp();
        builder.del(obj, after, span);
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
      case Code.MakeValue: {
        builder.val(data[i++]);
        break;
      }
      case Code.SetValue: {
        const obj = decodeTimestamp();
        const value = data[i++];
        builder.setVal(obj, value);
        break;
      }
    }
  }

  return builder.patch;
};
