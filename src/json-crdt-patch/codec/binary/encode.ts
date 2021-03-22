import {LogicalTimestamp} from "../../clock";
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
import {encodeVarUInt} from "./util/varuint";

export const encodeTimestamp = ({sessionId, time}: LogicalTimestamp): [number, number] => {
  let low32 = sessionId | 0;
  if (low32 < 0) low32 += 4294967296;
  const high8 = (sessionId - low32) / 4294967296;
  return [low32, ((high8 << 24) | time) >>> 0];
};

const textEncoder: TextEncoder | null = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
export const encodeString = textEncoder
  ? (str: string): ArrayBuffer => textEncoder.encode(str)
  : (str: string): ArrayBuffer => Buffer.from(str);

export const encode = (patch: Patch): Uint8Array => {
  const {ops} = patch;
  const buffers: ArrayBuffer[] = [
    new Uint32Array(encodeTimestamp(patch.getId()!)).buffer,
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
      buffers.push(new Uint32Array(encodeTimestamp(op.value)).buffer);
      size += 1 + 8;
      continue;
    }
    if (op instanceof SetObjectKeysOperation) {
      buffers.push(new Uint8Array([5]));
      buffers.push(new Uint32Array(encodeTimestamp(op.object)).buffer);
      size += 1 + 8;
      const keyNumberBuffer = new Uint8Array(encodeVarUInt(op.tuples.length));
      buffers.push(keyNumberBuffer);
      size += keyNumberBuffer.byteLength;
      for (const [key, value] of op.tuples) {
        const valueBuffer = new Uint32Array(encodeTimestamp(value)).buffer;
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
        new Uint32Array(encodeTimestamp(op.num)).buffer,
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
        new Uint32Array(encodeTimestamp(op.after)).buffer,
        stringLengthBuffer.buffer,
        stringBuffer,
      );
      size += 1 + 8 + stringLengthBuffer.byteLength + stringBuffer.byteLength;
      continue;
    }
    if (op instanceof InsertArrayElementsOperation) {
      const {arr, after, elements} = op;
      const length = elements.length;
      const elementLengthBuffer = new Uint8Array(encodeVarUInt(length));
      buffers.push(
        new Uint8Array([8]),
        new Uint32Array(encodeTimestamp(arr)).buffer,
        new Uint32Array(encodeTimestamp(after)).buffer,
        elementLengthBuffer.buffer,
      );
      for (const element of elements)
        buffers.push( new Uint32Array(encodeTimestamp(element)).buffer);
      size += 1 + 8 + 8 + elementLengthBuffer.byteLength + (8 * length);
      continue;
    }
    if (op instanceof DeleteOperation) {
      const {after, length} = op;
      if (length > 1) {
        const spanBuffer = new Uint8Array(encodeVarUInt(length));
        buffers.push(
          new Uint8Array([9]),
          new Uint32Array(encodeTimestamp(after)).buffer,
          spanBuffer.buffer,
        );
        size += 1 + 8 + spanBuffer.byteLength;
        continue;
      }
      buffers.push(
        new Uint8Array([10]),
        new Uint32Array(encodeTimestamp(after)).buffer,
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
