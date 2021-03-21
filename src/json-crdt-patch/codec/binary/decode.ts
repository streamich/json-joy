import {LogicalClock, LogicalTimestamp} from "../../../json-crdt/clock";
import {Patch} from "../../Patch";
import {PatchBuilder} from "../../PatchBuilder";

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

export const decodeVarUint = (buf: Uint8Array, offset: number): number => {
  const o1 = buf[offset];
  if (o1 <= 0b0111_1111) return o1;
  const o2 = buf[offset + 1];
  if (o2 <= 0b0111_1111) return (o2 << 7) + (o1 & 0b0111_1111);
  const o3 = buf[offset + 2];
  if (o3 <= 0b0111_1111) return (o3 << 14) + ((o2 & 0b0111_1111) << 7) + (o1 & 0b0111_1111);
  const o4 = buf[offset + 3];
  return (o4 << 21) + ((o3 & 0b0111_1111) << 14) + ((o2 & 0b0111_1111) << 7) + (o1 & 0b0111_1111);
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
        const after = decodeTimestamp(buf, offset);
        offset += 8;
        const value = decodeTimestamp(buf, offset);
        offset += 8;
        builder.root(after, value);
        continue;
      }
      case 5: {
        const after = decodeTimestamp(buf, offset);
        offset += 8;
        const fields = decodeVarUint(buf, offset);
        offset += fields <= 0b01111111
          ? 1
          : fields <= 0b01111111_11111111
            ? 2
            : fields <= 0b01111111_11111111_11111111 ? 3 : 4;
        const tuples: [key: string, value: LogicalTimestamp][] = [];
        for (let i = 0; i < fields; i++) {
          const value = decodeTimestamp(buf, offset);
          offset += 8;
          const strLength = decodeVarUint(buf, offset);
          offset += strLength <= 0b01111111
            ? 1
            : strLength <= 0b01111111_11111111
              ? 2
              : strLength <= 0b01111111_11111111_11111111 ? 3 : 4;
          const key = decodeString(buf, offset, strLength);
          offset += strLength;
          tuples.push([key, value]);
        }
        builder.setKeys(after, tuples);
        continue;
      }
      case 6: {
        const after = decodeTimestamp(buf, offset);
        offset += 8;
        const value = new Float64Array(buf.slice(offset, offset + 8).buffer)[0];
        offset += 8;
        builder.setNum(after, value);
        continue;
      }
      case 7: {
        const after = decodeTimestamp(buf, offset);
        offset += 8;
        const length = decodeVarUint(buf, offset);
        offset += length <= 0b01111111
          ? 1
          : length <= 0b01111111_11111111
            ? 2
            : length <= 0b01111111_11111111_11111111 ? 3 : 4;
        const str = decodeString(buf, offset, length);
        offset += length;
        builder.insStr(after, str);
        continue;
      }
    }
  }

  return builder.patch;
};
