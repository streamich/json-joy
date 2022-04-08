import {Code} from '../compact/constants';
import {DeleteOperation} from '../../operations/DeleteOperation';
import {encodeFull as encodeMsgPack} from '../../../json-pack/util';
import {encodeString} from '../../../util/encodeString';
import {encodeVarUInt} from './util/varuint';
import {InsertArrayElementsOperation} from '../../operations/InsertArrayElementsOperation';
import {InsertStringSubstringOperation} from '../../operations/InsertStringSubstringOperation';
import {ITimestamp} from '../../clock';
import {MakeArrayOperation} from '../../operations/MakeArrayOperation';
import {MakeNumberOperation} from '../../operations/MakeNumberOperation';
import {MakeObjectOperation} from '../../operations/MakeObjectOperation';
import {MakeStringOperation} from '../../operations/MakeStringOperation';
import {MakeValueOperation} from '../../operations/MakeValueOperation';
import {NoopOperation} from '../../operations/NoopOperation';
import {Patch} from '../../Patch';
import {SetNumberOperation} from '../../operations/SetNumberOperation';
import {SetObjectKeysOperation} from '../../operations/SetObjectKeysOperation';
import {SetRootOperation} from '../../operations/SetRootOperation';
import {SetValueOperation} from '../../operations/SetValueOperation';

export const encodeTimestamp = (ts: ITimestamp): [number, number] => {
  const sessionId = ts.getSessionId();
  let low32 = sessionId | 0;
  if (low32 < 0) low32 += 4294967296;
  const high8 = (sessionId - low32) / 4294967296;
  return [low32, ((high8 << 24) | ts.time) >>> 0];
};

export const encode = (patch: Patch): Uint8Array => {
  const {ops} = patch;
  const buffers: ArrayBuffer[] = [new Uint32Array(encodeTimestamp(patch.getId()!)).buffer];

  let size = 8;

  for (const op of ops) {
    if (op instanceof MakeObjectOperation) {
      buffers.push(new Uint8Array([Code.MakeObject])); // TODO: move these constant buffers, like new Uint8Array([X]), as a static variable.
      size += 1;
      continue;
    }
    if (op instanceof MakeArrayOperation) {
      buffers.push(new Uint8Array([Code.MakeArray]));
      size += 1;
      continue;
    }
    if (op instanceof MakeStringOperation) {
      buffers.push(new Uint8Array([Code.MakeString]));
      size += 1;
      continue;
    }
    if (op instanceof MakeValueOperation) {
      const buf = encodeMsgPack(op.value);
      buffers.push(
        new Uint8Array([Code.MakeValue]),
        buf,
      );
      size += 1 + buf.byteLength;
      continue;
    }
    if (op instanceof MakeNumberOperation) {
      buffers.push(new Uint8Array([Code.MakeNumber]));
      size += 1;
      continue;
    }
    if (op instanceof SetRootOperation) {
      buffers.push(
        new Uint8Array([Code.SetRoot]),
        new Uint32Array(encodeTimestamp(op.value)).buffer,
      );
      size += 1 + 8;
      continue;
    }
    if (op instanceof SetObjectKeysOperation) {
      buffers.push(new Uint8Array([Code.SetObjectKeys]));
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
    if (op instanceof SetValueOperation) {
      const buf = encodeMsgPack(op.value);
      buffers.push(
        new Uint8Array([Code.SetValue]),
        new Uint32Array(encodeTimestamp(op.obj)).buffer,
        buf,
      );
      size += 1 + 8 + buf.byteLength;
      continue;
    }
    if (op instanceof SetNumberOperation) {
      buffers.push(
        new Uint8Array([Code.SetNumber]),
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
        new Uint8Array([Code.InsertStringSubstring]),
        new Uint32Array(encodeTimestamp(op.obj)).buffer,
        new Uint32Array(encodeTimestamp(op.after)).buffer,
        stringLengthBuffer.buffer,
        stringBuffer,
      );
      size += 1 + 8 + 8 + stringLengthBuffer.byteLength + stringBuffer.byteLength;
      continue;
    }
    if (op instanceof InsertArrayElementsOperation) {
      const {arr, after, elements} = op;
      const length = elements.length;
      const elementLengthBuffer = new Uint8Array(encodeVarUInt(length));
      buffers.push(
        new Uint8Array([Code.InsertArrayElements]),
        new Uint32Array(encodeTimestamp(arr)).buffer,
        new Uint32Array(encodeTimestamp(after)).buffer,
        elementLengthBuffer.buffer,
      );
      for (const element of elements) buffers.push(new Uint32Array(encodeTimestamp(element)).buffer);
      size += 1 + 8 + 8 + elementLengthBuffer.byteLength + 8 * length;
      continue;
    }
    if (op instanceof DeleteOperation) {
      const {obj, after, length} = op;
      if (length > 1) {
        const spanBuffer = new Uint8Array(encodeVarUInt(length));
        buffers.push(
          new Uint8Array([Code.Delete]),
          new Uint32Array(encodeTimestamp(obj)).buffer,
          new Uint32Array(encodeTimestamp(after)).buffer,
          spanBuffer.buffer,
        );
        size += 1 + 8 + 8 + spanBuffer.byteLength;
        continue;
      }
      buffers.push(
        new Uint8Array([Code.DeleteOne]),
        new Uint32Array(encodeTimestamp(obj)).buffer,
        new Uint32Array(encodeTimestamp(after)).buffer,
      );
      size += 1 + 8 + 8;
      continue;
    }
    if (op instanceof NoopOperation) {
      const {length} = op;
      if (length > 1) {
        const spanBuffer = new Uint8Array(encodeVarUInt(length));
        buffers.push(new Uint8Array([Code.Noop]), spanBuffer.buffer);
        size += 1 + spanBuffer.byteLength;
        continue;
      }
      buffers.push(new Uint8Array([Code.NoopOne]));
      size += 1;
      continue;
    }
    throw new Error('UNKNOWN_OP');
  }

  const res = new Uint8Array(size);
  let offset = 0;
  for (const buffer of buffers) {
    res.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }

  return res;
};
