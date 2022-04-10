import {ArrayChunk} from '../../types/rga-array/ArrayChunk';
import {ArrayType} from '../../types/rga-array/ArrayType';
import {BinaryChunk} from '../../types/rga-binary/BinaryChunk';
import {BinaryType} from '../../types/rga-binary/BinaryType';
import {ConstantType} from '../../types/const/ConstantType';
import {CrdtDecoder} from '../../../json-crdt-patch/util/binary/CrdtDecoder';
import {DocRootType} from '../../types/lww-doc-root/DocRootType';
import {FALSE, NULL, TRUE, UNDEFINED} from '../../constants';
import {ITimestamp} from '../../../json-crdt-patch/clock';
import {Model} from '../../model';
import {ObjectChunk} from '../../types/lww-object/ObjectChunk';
import {ObjectType} from '../../types/lww-object/ObjectType';
import {ORIGIN} from '../../../json-crdt-patch/constants';
import {StringChunk} from '../../types/rga-string/StringChunk';
import {StringType} from '../../types/rga-string/StringType';
import {ValueType} from '../../types/lww-value/ValueType';
import type {JsonNode} from '../../types';

export abstract class AbstractDecoder extends CrdtDecoder {
  protected doc!: Model;

  protected abstract ts(): ITimestamp;

  protected decodeRoot(doc: Model): void {
    const id = this.ts();
    const node = this.x >= this.uint8.byteLength ? null : this.decodeNode();
    doc.root = new DocRootType(doc, id, node);
  }

  public decodeNode(): JsonNode {
    const byte = this.u8();
    if (byte < 0b10000000) return this.createConst(byte);
    else if (byte <= 0b10001111) return this.decodeObj(byte & 0b1111);
    else if (byte <= 0b10011111) return this.decodeArr(byte & 0b1111);
    else if (byte <= 0b10111111) return this.decodeStr(byte & 0b11111);
    else if (byte >= 0b11100000) return this.createConst(byte - 0x100);
    else {
      switch (byte) {
        case 0xc0:
          return NULL;
        case 0xc1:
          return UNDEFINED;
        case 0xc2:
          return FALSE;
        case 0xc3:
          return TRUE;
        case 0xc4:
          return this.decodeBin(this.u8());
        case 0xc5:
          return this.decodeBin(this.u16());
        case 0xc6:
          return this.decodeBin(this.u32());
        case 0xca:
          return this.createConst(this.f32());
        case 0xcb:
          return this.createConst(this.f64());
        case 0xcc:
          return this.createConst(this.u8());
        case 0xcd:
          return this.createConst(this.u16());
        case 0xce:
          return this.createConst(this.u32());
        case 0xcf:
          return this.createConst(this.u32() * 4294967296 + this.u32());
        case 0xd0:
          return this.createConst(this.i8());
        case 0xd1:
          return this.createConst(this.i16());
        case 0xd2:
          return this.createConst(this.i32());
        case 0xd3:
          return this.createConst(this.i32() * 4294967296 + this.i32());
        case 0xd4:
          return this.createConst(this.val());
        case 0xd5:
          return this.decodeVal();
        case 0xde:
          return this.decodeObj(this.u16());
        case 0xdf:
          return this.decodeObj(this.u32());
        case 0xdc:
          return this.decodeArr(this.u16());
        case 0xdd:
          return this.decodeArr(this.u32());
        case 0xd9:
          return this.decodeStr(this.u8());
        case 0xda:
          return this.decodeStr(this.u16());
        case 0xdb:
          return this.decodeStr(this.u32());
      }
    }
    return NULL;
  }

  private createConst(value: unknown) {
    return new ConstantType(ORIGIN, value);
  }

  public decodeObj(length: number): ObjectType {
    const id = this.ts();
    const obj = new ObjectType(this.doc, id);
    for (let i = 0; i < length; i++) this.decodeObjChunk(obj);
    this.doc.nodes.index(obj);
    return obj;
  }

  private decodeObjChunk(obj: ObjectType): void {
    const id = this.ts();
    const length = this.vuint57();
    const key = this.str(length);
    const node = this.decodeNode();
    const chunk = new ObjectChunk(id, node);
    obj.putChunk(key, chunk);
  }

  public decodeArr(length: number): ArrayType {
    const id = this.ts();
    const obj = new ArrayType(this.doc, id);
    for (let i = 0; i < length; i++) this.decodeArrChunk(obj);
    this.doc.nodes.index(obj);
    return obj;
  }

  private decodeArrChunk(obj: ArrayType): void {
    const [deleted, length] = this.b1vuint56();
    const id = this.ts();
    if (deleted) {
      const chunk = new ArrayChunk(id, undefined);
      chunk.deleted = length;
      obj.append(chunk);
    } else {
      const nodes: JsonNode[] = [];
      for (let i = 0; i < length; i++) nodes.push(this.decodeNode());
      const chunk = new ArrayChunk(id, nodes);
      obj.append(chunk);
    }
  }

  public decodeStr(length: number): StringType {
    const id = this.ts();
    const obj = new StringType(this.doc, id);
    for (let i = 0; i < length; i++) this.decodeStrChunk(obj);
    this.doc.nodes.index(obj);
    return obj;
  }

  private decodeStrChunk(obj: StringType): void {
    const [deleted, length] = this.b1vuint56();
    const id = this.ts();
    if (deleted) {
      const chunk = new StringChunk(id, undefined);
      chunk.deleted = length;
      obj.append(chunk);
    } else {
      const text = this.str(length);
      const chunk = new StringChunk(id, text);
      obj.append(chunk);
    }
  }

  public decodeBin(length: number): BinaryType {
    const id = this.ts();
    const obj = new BinaryType(this.doc, id);
    for (let i = 0; i < length; i++) this.decodeBinChunk(obj);
    this.doc.nodes.index(obj);
    return obj;
  }

  private decodeBinChunk(obj: BinaryType): void {
    const [deleted, length] = this.b1vuint56();
    const id = this.ts();
    if (deleted) {
      const chunk = new BinaryChunk(id, undefined);
      chunk.deleted = length;
      obj.append(chunk);
    } else {
      const text = this.bin(length);
      const chunk = new BinaryChunk(id, text);
      obj.append(chunk);
    }
  }

  private decodeVal(): ValueType {
    const id = this.ts();
    const writeId = this.ts();
    const value = this.val();
    const obj = new ValueType(id, writeId, value);
    this.doc.nodes.index(obj);
    return obj;
  }
}
