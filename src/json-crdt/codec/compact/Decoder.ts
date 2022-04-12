import {ArrayChunk} from '../../types/rga-array/ArrayChunk';
import {ArrayType} from '../../types/rga-array/ArrayType';
import {BinaryChunk} from '../../types/rga-binary/BinaryChunk';
import {BinaryType} from '../../types/rga-binary/BinaryType';
import {ClockDecoder} from '../../../json-crdt-patch/codec/clock/ClockDecoder';
import {ConstantType} from '../../types/const/ConstantType';
import {DocRootType} from '../../types/lww-doc-root/DocRootType';
import {FALSE, NULL, TRUE, UNDEFINED} from '../../constants';
import {fromBase64} from '../../../util/base64/decode';
import {ITimestamp, LogicalTimestamp, ServerTimestamp} from '../../../json-crdt-patch/clock';
import {JsonNode} from '../../types';
import {Model} from '../../model';
import {ObjectChunk} from '../../types/lww-object/ObjectChunk';
import {ObjectType} from '../../types/lww-object/ObjectType';
import {FALSE_ID, NULL_ID, ORIGIN, SESSION, TRUE_ID, UNDEFINED_ID} from '../../../json-crdt-patch/constants';
import {StringChunk} from '../../types/rga-string/StringChunk';
import {StringType} from '../../types/rga-string/StringType';
import {TypeCode, ValueCode} from './constants';
import {ValueType} from '../../types/lww-value/ValueType';

export class Decoder {
  protected time?: number;
  protected clockDecoder?: ClockDecoder;

  public decode(data: unknown[]): Model {
    const x = data[0];
    const isServerTime = typeof x === 'number';
    if (isServerTime) {
      this.time = x;
    } else {
      this.clockDecoder = ClockDecoder.fromArr(x as number[]);
    }
    const doc = isServerTime ? Model.withServerClock(x as number) : Model.withLogicalClock(this.clockDecoder!.clock);
    const [rootId, index] = this.ts(data, 1);
    const rootNode = data[index] ? this.decodeNode(doc, data[index]) : null;
    doc.root = new DocRootType(doc, rootId, rootNode);
    return doc;
  }

  protected ts(arr: unknown[], index: number): [ITimestamp, number] {
    const x = arr[index];
    if (typeof x === 'number') {
      if (x < 0) {
        const sessionIndex = -x;
        const timeDiff = arr[index + 1] as number;
        return [this.clockDecoder!.decodeId(sessionIndex, timeDiff), index + 2];
      } else {
        return [new ServerTimestamp(this.time! - x), index + 1];
      }
    } else {
      const time = (x as [number])[0];
      switch (time) {
        case ORIGIN.time:
          return [ORIGIN, index + 1];
        case NULL_ID.time:
          return [NULL_ID, index + 1];
        case TRUE_ID.time:
          return [TRUE_ID, index + 1];
        case FALSE_ID.time:
          return [FALSE_ID, index + 1];
        case UNDEFINED_ID.time:
          return [UNDEFINED_ID, index + 1];
        default:
          return [new LogicalTimestamp(SESSION.SYSTEM, time), index + 1];
      }
    }
  }

  protected decodeNode(doc: Model, data: unknown): JsonNode {
    switch (data) {
      case ValueCode.null:
        return NULL;
      case ValueCode.false:
        return FALSE;
      case ValueCode.true:
        return TRUE;
      case ValueCode.undefined:
        return UNDEFINED;
    }
    if (data instanceof Array) {
      switch (data[0]) {
        case TypeCode.obj:
          return this.decodeObj(doc, data);
        case TypeCode.arr:
          return this.decodeArr(doc, data);
        case TypeCode.str:
          return this.decodeStr(doc, data);
        case TypeCode.val:
          return this.decodeVal(doc, data);
        case TypeCode.const:
          return this.decodeConst(doc, data);
        case TypeCode.bin:
          return this.decodeBin(doc, data);
      }
    }
    throw new Error('UNKNOWN_NODE');
  }

  protected decodeObj(doc: Model, data: unknown[]): ObjectType {
    const [id, index] = this.ts(data, 1);
    const obj = new ObjectType(doc, id);
    const length = data.length;
    for (let i = index; i < length; ) {
      const key = data[i] as string;
      const [keyId, idx] = this.ts(data, i + 1);
      const node = this.decodeNode(doc, data[idx]);
      const chunk = new ObjectChunk(keyId, node);
      obj.putChunk(key, chunk);
      i = idx + 1;
    }
    doc.nodes.index(obj);
    return obj;
  }

  protected decodeArr(doc: Model, data: unknown[]): ArrayType {
    const [id, index] = this.ts(data, 1);
    const obj = new ArrayType(doc, id);
    const length = data.length;
    for (let i = index; i < length; ) {
      const [chunkId, idx] = this.ts(data, i);
      const content = data[idx];
      let chunk: ArrayChunk;
      if (typeof content === 'number') {
        chunk = new ArrayChunk(chunkId, undefined);
        chunk.deleted = content;
      } else {
        const nodes = (content as unknown[]).map((c) => this.decodeNode(doc, c));
        chunk = new ArrayChunk(chunkId, nodes);
      }
      obj.append(chunk);
      i = idx + 1;
    }
    doc.nodes.index(obj);
    return obj;
  }

  protected decodeStr(doc: Model, data: unknown[]): StringType {
    const [id, index] = this.ts(data, 1);
    const obj = new StringType(doc, id);
    const length = data.length;
    for (let i = index; i < length; ) {
      const [chunkId, idx] = this.ts(data, i);
      const content = data[idx];
      let chunk: StringChunk;
      if (typeof content === 'number') {
        chunk = new StringChunk(chunkId, undefined);
        chunk.deleted = content;
      } else {
        chunk = new StringChunk(chunkId, content as string);
      }
      obj.append(chunk);
      i = idx + 1;
    }
    doc.nodes.index(obj);
    return obj;
  }

  protected decodeBin(doc: Model, data: unknown[]): BinaryType {
    const [id, index] = this.ts(data, 1);
    const obj = new BinaryType(doc, id);
    const length = data.length;
    for (let i = index; i < length; ) {
      const [chunkId, idx] = this.ts(data, i);
      const content = data[idx];
      let chunk: BinaryChunk;
      if (typeof content === 'number') {
        chunk = new BinaryChunk(chunkId, undefined);
        chunk.deleted = content;
      } else {
        chunk = new BinaryChunk(chunkId, fromBase64(content as string));
      }
      obj.append(chunk);
      i = idx + 1;
    }
    doc.nodes.index(obj);
    return obj;
  }

  protected decodeVal(doc: Model, data: unknown[]): ValueType {
    const [id, index1] = this.ts(data, 1);
    const [writeId, index2] = this.ts(data, index1);
    const value = data[index2];
    const obj = new ValueType(id, writeId, value);
    doc.nodes.index(obj);
    return obj;
  }

  protected decodeConst(doc: Model, data: unknown[]): ConstantType {
    const value = data[1];
    const obj = new ConstantType(ORIGIN, value);
    return obj;
  }
}
