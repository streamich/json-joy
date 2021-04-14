import {ITimestamp} from '../../../json-crdt-patch/clock';
import {ClockDecoder} from '../../../json-crdt-patch/codec/clock/ClockDecoder';
import {ORIGIN} from '../../../json-crdt-patch/constants';
import {FALSE, NULL, TRUE, UNDEFINED} from '../../constants';
import {Model} from '../../model';
import {JsonNode} from '../../types';
import {ConstantType} from '../../types/const/ConstantType';
import {DocRootType} from '../../types/lww-doc-root/DocRootType';
import {ObjectChunk} from '../../types/lww-object/ObjectChunk';
import {ObjectType} from '../../types/lww-object/ObjectType';
import {ValueType} from '../../types/lww-value/ValueType';
import {ArrayChunk} from '../../types/rga-array/ArrayChunk';
import {ArrayType} from '../../types/rga-array/ArrayType';
import {StringChunk} from '../../types/rga-string/StringChunk';
import {StringType} from '../../types/rga-string/StringType';
import {TypeCode, ValueCode} from './constants';

export class Decoder {
  protected clockDecoder!: ClockDecoder;

  public decode(data: unknown[]): Model {
    this.clockDecoder = ClockDecoder.fromArr(data[0] as number[]);
    const doc = new Model(this.clockDecoder.clock);
    const rootId = this.ts(data, 1);
    const rootNode = data[3] ? this.decodeNode(doc, data[3]) : null;
    doc.root = new DocRootType(doc, rootId, rootNode);
    return doc;
  }

  protected ts(arr: unknown[], index: number): ITimestamp {
    const sessionIndex = arr[index] as number;
    const timeDiff = arr[index + 1] as number;
    return this.clockDecoder.decodeId(sessionIndex, timeDiff);
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
      }
    }
    throw new Error('UNKNOWN_NODE');
  }

  protected decodeObj(doc: Model, data: unknown[]): ObjectType {
    const id = this.ts(data, 1);
    const obj = new ObjectType(doc, id);
    const length = data.length;
    for (let i = 3; i < length; i += 4) {
      const key = data[i] as string;
      const keyId = this.ts(data, i + 1);
      const node = this.decodeNode(doc, data[i + 3]);
      const chunk = new ObjectChunk(keyId, node);
      obj.putChunk(key, chunk);
    }
    doc.nodes.index(obj);
    return obj;
  }

  protected decodeArr(doc: Model, data: unknown[]): ArrayType {
    const id = this.ts(data, 1);
    const obj = new ArrayType(doc, id);
    const length = data.length;
    for (let i = 3; i < length; i += 3) {
      const chunkId = this.ts(data, i);
      const content = data[i + 2];
      let chunk: ArrayChunk;
      if (typeof content === 'number') {
        chunk = new ArrayChunk(chunkId, undefined);
        chunk.deleted = content;
      } else {
        const nodes = (content as unknown[]).map((c) => this.decodeNode(doc, c));
        chunk = new ArrayChunk(chunkId, nodes);
      }
      obj.append(chunk);
    }
    doc.nodes.index(obj);
    return obj;
  }

  protected decodeStr(doc: Model, data: unknown[]): StringType {
    const id = this.ts(data, 1);
    const obj = new StringType(doc, id);
    const length = data.length;
    for (let i = 3; i < length; i += 3) {
      const chunkId = this.ts(data, i);
      const content = data[i + 2];
      let chunk: StringChunk;
      if (typeof content === 'number') {
        chunk = new StringChunk(chunkId, undefined);
        chunk.deleted = content;
      } else {
        chunk = new StringChunk(chunkId, content as string);
      }
      obj.append(chunk);
    }
    doc.nodes.index(obj);
    return obj;
  }

  protected decodeVal(doc: Model, data: unknown[]): ValueType {
    const id = this.ts(data, 1);
    const writeId = this.ts(data, 3);
    const value = data[5];
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
