import {ArrayChunk} from '../../types/rga-array/ArrayChunk';
import {ArrayType} from '../../types/rga-array/ArrayType';
import {BinaryChunk} from '../../types/rga-binary/BinaryChunk';
import {BinaryType} from '../../types/rga-binary/BinaryType';
import {ConstantType} from '../../types/const/ConstantType';
import {DocRootType} from '../../types/lww-doc-root/DocRootType';
import {FALSE, NULL, TRUE, UNDEFINED} from '../../constants';
import {fromBase64} from '../../../util/base64/decode';
import {ITimestamp, ServerTimestamp} from '../../../json-crdt-patch/clock';
import {JsonNode} from '../../types';
import {Model} from '../../model';
import {ObjectChunk} from '../../types/lww-object/ObjectChunk';
import {ObjectType} from '../../types/lww-object/ObjectType';
import {ORIGIN} from '../../../json-crdt-patch/constants';
import {StringChunk} from '../../types/rga-string/StringChunk';
import {StringType} from '../../types/rga-string/StringType';
import {TypeCode, ValueCode} from './constants';
import {ValueType} from '../../types/lww-value/ValueType';

export class ServerDecoder {
  protected time!: number;

  public decode(data: unknown[]): Model {
    this.time = data[0] as number;
    const doc = Model.withServerClock(this.time);
    const rootId = this.ts(data, 1);
    const rootNode = data[2] ? this.decodeNode(doc, data[2]) : null;
    doc.root = new DocRootType(doc, rootId, rootNode);
    return doc;
  }

  protected ts(arr: unknown[], index: number): ITimestamp {
    const timeDiff = arr[index] as number;
    return new ServerTimestamp(this.time - timeDiff);
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
    const id = this.ts(data, 1);
    const obj = new ObjectType(doc, id);
    const length = data.length;
    for (let i = 2; i < length; i += 3) {
      const key = data[i] as string;
      const keyId = this.ts(data, i + 1);
      const node = this.decodeNode(doc, data[i + 2]);
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
    for (let i = 2; i < length; i += 2) {
      const chunkId = this.ts(data, i);
      const content = data[i + 1];
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
    for (let i = 2; i < length; i += 2) {
      const chunkId = this.ts(data, i);
      const content = data[i + 1];
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

  protected decodeBin(doc: Model, data: unknown[]): BinaryType {
    const id = this.ts(data, 1);
    const obj = new BinaryType(doc, id);
    const length = data.length;
    for (let i = 2; i < length; i += 2) {
      const chunkId = this.ts(data, i);
      const content = data[i + 1];
      let chunk: BinaryChunk;
      if (typeof content === 'number') {
        chunk = new BinaryChunk(chunkId, undefined);
        chunk.deleted = content;
      } else {
        chunk = new BinaryChunk(chunkId, fromBase64(content as string));
      }
      obj.append(chunk);
    }
    doc.nodes.index(obj);
    return obj;
  }

  protected decodeVal(doc: Model, data: unknown[]): ValueType {
    const id = this.ts(data, 1);
    const writeId = this.ts(data, 2);
    const value = data[3];
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
