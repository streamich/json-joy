import {LogicalClock, LogicalTimestamp} from "../../clock";
import {Patch} from "../../Patch";
import {PatchBuilder} from "../../PatchBuilder";
import {decodeVarUint} from "./util/varuint";

export const decodeTimestamp = (buf: Uint8Array, offset: number): LogicalTimestamp => {
  const o1 = buf[offset];
  const o2 = buf[offset + 1];
  const o3 = buf[offset + 2];
  const o4 = buf[offset + 3];
  const o5 = buf[offset + 4];
  const o6 = buf[offset + 5];
  const o7 = buf[offset + 6];
  const o8 = buf[offset + 7];
  let sessionId = o8;
  sessionId *= 0x100;
  sessionId += o4;
  sessionId *= 0x100;
  sessionId += o3;
  sessionId *= 0x100;
  sessionId += o2;
  sessionId *= 0x100;
  sessionId += o1;
  let time = o7;
  time *= 0x100;
  time += o6;
  time *= 0x100;
  time += o5;
  return new LogicalTimestamp(sessionId, time);
};

const textDecoder: TextDecoder | null = typeof TextDecoder !== 'undefined' ? new TextDecoder() : null;
export const decodeString = textDecoder
  ? (buf: ArrayBuffer, offset: number, length: number): string => textDecoder.decode(buf.slice(offset, offset + length))
  : (buf: ArrayBuffer, offset: number, length: number): string => Buffer.from(buf).slice(offset, offset + length).toString();

export const decode = (buf: Uint8Array): Patch => {
  const id = decodeTimestamp(buf, 0);
  let offset = 8;
  const clock = new LogicalClock(id.sessionId, id.time);
  const builder = new PatchBuilder(clock);
  const length = buf.byteLength;

  const ts = () => {
    const value = decodeTimestamp(buf, offset);
    offset += 8;
    return value;
  };

  const varuint = () => {
    const value = decodeVarUint(buf, offset);
    offset += value <= 0b01111111
      ? 1
      : value <= 0b01111111_11111111
        ? 2
        : value <= 0b01111111_11111111_11111111 ? 3 : 4;
    return value;
  };

  while (offset < length) {
    const opcode = buf[offset];
    offset++;
    switch (opcode) {
      case 0: {
        builder.obj();
        continue;
      }
      case 1: {
        builder.arr();
        continue;
      }
      case 2: {
        builder.str();
        continue;
      }
      case 3: {
        builder.num();
        continue;
      }
      case 4: {
        builder.root(ts());
        continue;
      }
      case 5: {
        const object = ts();
        const fields = varuint();
        const tuples: [key: string, value: LogicalTimestamp][] = [];
        for (let i = 0; i < fields; i++) {
          const value = ts();
          const strLength = varuint();
          const key = decodeString(buf, offset, strLength);
          offset += strLength;
          tuples.push([key, value]);
        }
        builder.setKeys(object, tuples);
        continue;
      }
      case 6: {
        const after = ts();
        const value = new Float64Array(buf.slice(offset, offset + 8).buffer)[0];
        offset += 8;
        builder.setNum(after, value);
        continue;
      }
      case 7: {
        const obj = ts();
        const after = ts();
        const length = varuint();
        const str = decodeString(buf, offset, length);
        offset += length;
        builder.insStr(obj, after, str);
        continue;
      }
      case 8: {
        const arr = ts();
        const after = ts();
        const length = varuint();
        const elements: LogicalTimestamp[] = [];
        for (let i = 0; i < length; i++) {
          const value = ts();
          elements.push(value);
        }
        builder.insArr(arr, after, elements);
        continue;
      }
      case 9: {
        const obj = ts();
        const after = ts();
        const length = varuint();
        builder.del(obj, after, length);
        continue;
      }
      case 10: {
        const obj = ts();
        const after = ts();
        builder.del(obj, after, 1);
        continue;
      }
      case 11: {
        builder.noop(1);
        continue;
      }
      case 12: {
        builder.noop(varuint());
        continue;
      }
    }
  }

  return builder.patch;
};
