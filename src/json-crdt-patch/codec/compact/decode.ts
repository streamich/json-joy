import {LogicalClock, LogicalTimestamp} from "../../clock";
import {Patch} from "../../Patch";
import {PatchBuilder} from "../../PatchBuilder";

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
      case 0: {
        builder.obj();
        break;
      }
      case 1: {
        builder.arr();
        break;
      }
      case 2: {
        builder.str();
        break;
      }
      case 3: {
        builder.num();
        break;
      }
      case 4: {
        builder.root(decodeTimestamp());
        break;
      }
      case 5: {
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
      case 6: {
        const value = data[i++] as number;
        builder.setNum(decodeTimestamp(), value);
        break;
      }
      case 7: {
        const value = data[i++] as string;
        builder.insStr(decodeTimestamp(), decodeTimestamp(), value);
        break;
      }
      case 8: {
        const length = data[i++] as number;
        const arr = decodeTimestamp();
        const after = decodeTimestamp();
        const values: LogicalTimestamp[] = [];
        for (let j = 0; j < length; j++) values.push(decodeTimestamp());
        builder.insArr(arr, after, values);
        break;
      }
      case 9: {
        const obj = decodeTimestamp();
        const after = decodeTimestamp();
        builder.del(obj, after, 1);
        break;
      }
      case 10: {
        const span = data[i++] as number;
        const obj = decodeTimestamp();
        const after = decodeTimestamp();
        builder.del(obj, after, span);
        break;
      }
    }
  }

  return builder.patch;
};
