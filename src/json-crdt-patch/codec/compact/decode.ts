import {LogicalClock, LogicalTimestamp} from "../../../json-crdt/clock";
import {Patch} from "../../Patch";
import {PatchBuilder} from "../../PatchBuilder";

export const decode = (data: unknown[]): Patch => {
  const clock = new LogicalClock(data[0] as number, data[1] as number);
  const builder = new PatchBuilder(clock);
  const length = data.length;
  let i = 2;

  while (i < length) {
    switch (data[i]) {
      case 0: {
        builder.obj();
        i++;
        break;
      }
      case 1: {
        builder.arr();
        i++;
        break;
      }
      case 2: {
        builder.str();
        i++;
        break;
      }
      case 3: {
        builder.num();
        i++;
        break;
      }
      case 4: {
        const afterSession = data[i + 1] as number;
        const afterTime = data[i + 2] as number;
        const valueSession = data[i + 3] as number;
        const valueTime = data[i + 4] as number;
        builder.root(new LogicalTimestamp(afterSession, afterTime), new LogicalTimestamp(valueSession, valueTime));
        i += 5;
        break;
      }
      case 5: {
        const afterSession = data[i + 1] as number;
        const afterTime = data[i + 2] as number;
        const triplets = data[i + 3] as (string | number)[];
        const tuples: [key: string, value: LogicalTimestamp][] = [];
        for (let i = 0; i < triplets.length; i += 3) {
          tuples.push([triplets[i] as string, new LogicalTimestamp(triplets[i + 1] as number, triplets[i + 2] as number)])
        }
        builder.setKeys(new LogicalTimestamp(afterSession, afterTime), tuples);
        i += 4;
        break;
      }
      case 6: {
        const afterSession = data[i + 1] as number;
        const afterTime = data[i + 2] as number;
        const value = data[i + 3] as number;
        builder.setNum(new LogicalTimestamp(afterSession, afterTime), value);
        i += 4;
        break;
      }
      case 7: {
        const afterSession = data[i + 1] as number;
        const afterTime = data[i + 2] as number;
        const value = data[i + 3] as string;
        builder.insStr(new LogicalTimestamp(afterSession, afterTime), value);
        i += 4;
        break;
      }
      case 8: {
        const afterSession = data[i + 1] as number;
        const afterTime = data[i + 2] as number;
        const elements = data[i + 3] as number[];
        const values: LogicalTimestamp[] = [];
        for (let i = 0; i < elements.length; i += 2)
          values.push(new LogicalTimestamp(elements[i], elements[i + 1]));
        builder.insArr(new LogicalTimestamp(afterSession, afterTime), values);
        i += 4;
        break;
      }
      case 9: {
        const afterSession = data[i + 1] as number;
        const afterTime = data[i + 2] as number;
        const span = data[i + 3] as number;
        builder.delStr(new LogicalTimestamp(afterSession, afterTime), span);
        i += 4;
        break;
      }
      case 10: {
        const afterSession = data[i + 1] as number;
        const afterTime = data[i + 2] as number;
        const span = data[i + 3] as number;
        builder.delArr(new LogicalTimestamp(afterSession, afterTime), span);
        i += 4;
        break;
      }
    }
  }

  return builder.patch;
};
