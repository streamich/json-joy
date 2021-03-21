import {LogicalTimestamp} from "../../../json-crdt/clock";
import {DeleteOperation} from "../../operations/DeleteOperation";
import {InsertArrayElementsOperation} from "../../operations/InsertArrayElementsOperation";
import {InsertStringSubstringOperation} from "../../operations/InsertStringSubstringOperation";
import {MakeArrayOperation} from "../../operations/MakeArrayOperation";
import {MakeNumberOperation} from "../../operations/MakeNumberOperation";
import {MakeObjectOperation} from "../../operations/MakeObjectOperation";
import {MakeStringOperation} from "../../operations/MakeStringOperation";
import {SetNumberOperation} from "../../operations/SetNumberOperation";
import {SetObjectKeysOperation} from "../../operations/SetObjectKeysOperation";
import {SetRootOperation} from "../../operations/SetRootOperation";
import {Patch} from "../../Patch";

const ts = ({sessionId, time}: LogicalTimestamp): [number, number] => {
  return [sessionId & 0xFF_FF_FF_FF, ((sessionId & 0xFF_00_00_00_00) >> 8) | time];
};

/**
 * Encodes up to 29-bits unsigned integer. In the first three bytes 7 bits are
 * encoded, the fourth byte contains 8 bits of data.
 */
export const encodeVarUInt = (uint: number) => {
  if (uint <= 0b01111111) return [uint];
  if (uint <= 0b01111111_11111111)
    return [0b10000000 | (uint & 0b1111111), (uint & 0b1111111_0000000) >> 7];
  if (uint <= 0b01111111_11111111_11111111)
    return [
      0b10000000 | (uint & 0b1111111),
      0b10000000 | ((uint & 0b1111111_0000000) >> 7),
      (uint & 0b1111111_0000000_0000000) >> 14,
    ];
  return [
    0b10000000 | (uint & 0b1111111),
    0b10000000 | ((uint & 0b1111111_0000000) >> 7),
    0b10000000 | ((uint & 0b1111111_0000000_0000000) >> 14),
    (uint & 0b11111111_0000000_0000000_0000000) >> 21,
  ];
};

const encoder: TextEncoder | null = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
export const encodeString = encoder
  ? (str: string): ArrayBuffer => encoder.encode(str)
  : (str: string): ArrayBuffer => Buffer.from(str);

export const encode = (patch: Patch): Uint8Array => {
  const {ops} = patch;
  const buffers: ArrayBuffer[] = [
    new Uint32Array(ts(patch.getId()!)).buffer,
  ];

  let size = 8;

  for (const op of ops) {
    if (op instanceof MakeObjectOperation) {
      buffers.push(new Uint8Array([0]));
      size += 1;
      continue;
    }
    if (op instanceof MakeArrayOperation) {
      buffers.push(new Uint8Array([1]));
      size += 1;
      continue;
    }
    if (op instanceof MakeStringOperation) {
      buffers.push(new Uint8Array([2]));
      size += 1;
      continue;
    }
    if (op instanceof MakeNumberOperation) {
      buffers.push(new Uint8Array([3]));
      size += 1;
      continue;
    }
    if (op instanceof SetRootOperation) {
      buffers.push(new Uint8Array([4]));
      buffers.push(new Uint32Array([...ts(op.after), ...ts(op.value)]).buffer);
      size += 1 + 8 + 8;
      continue;
    }
    if (op instanceof SetObjectKeysOperation) {
      buffers.push(new Uint8Array([5]));
      buffers.push(new Uint32Array(ts(op.after)).buffer);
      size += 1 + 8;
      const keyNumberBuffer = new Uint8Array(encodeVarUInt(op.tuples.length));
      buffers.push(keyNumberBuffer);
      size += keyNumberBuffer.byteLength;
      for (const [key, value] of op.tuples) {
        const valueBuffer = new Uint32Array(ts(value)).buffer;
        const keyBuffer = encodeString(key);
        const keyLengthBuffer = new Uint8Array(encodeVarUInt(keyBuffer.byteLength));
        buffers.push(valueBuffer, keyLengthBuffer, keyBuffer);
        size += valueBuffer.byteLength + keyLengthBuffer.byteLength + keyBuffer.byteLength;
      }
      continue;
    }
    if (op instanceof SetNumberOperation) {
      buffers.push(
        new Uint8Array([6]),
        new Uint32Array(ts(op.after)).buffer,
        new Float64Array([op.value]).buffer,
      );
      size += 1 + 8 + 8;
      continue;
    }
    if (op instanceof InsertStringSubstringOperation) {
      const stringBuffer = encodeString(op.substring);
      const stringLengthBuffer = new Uint8Array(encodeVarUInt(stringBuffer.byteLength));
      buffers.push(
        new Uint8Array([7]),
        new Uint32Array(ts(op.after)).buffer,
        stringLengthBuffer.buffer,
        stringBuffer,
      );
      size += 1 + 8 + stringLengthBuffer.byteLength + stringBuffer.byteLength;
      continue;
    }
    if (op instanceof InsertArrayElementsOperation) {
      const {after, elements} = op;
      const length = elements.length;
      const elementLengthBuffer = new Uint8Array(encodeVarUInt(length));
      buffers.push(
        new Uint8Array([8]),
        new Uint32Array(ts(after)).buffer,
        elementLengthBuffer.buffer,
      );
      for (const element of elements)
        buffers.push( new Uint32Array(ts(element)).buffer);
      size += 1 + 8 + elementLengthBuffer.byteLength + (8 * length);
      continue;
    }
    if (op instanceof DeleteOperation) {
      const {after, span} = op;
      if (span > 1) {
        const spanBuffer = new Uint8Array(encodeVarUInt(span));
        buffers.push(
          new Uint8Array([9]),
          new Uint32Array(ts(after)).buffer,
          spanBuffer.buffer,
        );
        size += 1 + 8 + spanBuffer.byteLength;
        continue;
      }
      buffers.push(
        new Uint8Array([10]),
        new Uint32Array(ts(after)).buffer,
      );
      size += 1 + 8;
      continue;
    }
  }

  const res = new Uint8Array(size);
  let offset = 0;
  for (const buffer of buffers) {
    res.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }

  return res;
};
