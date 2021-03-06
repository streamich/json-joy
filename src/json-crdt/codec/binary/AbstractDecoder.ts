import {ITimestamp} from '../../../json-crdt-patch/clock';
import {ClockDecoder} from '../../../json-crdt-patch/codec/clock/ClockDecoder';
import {ORIGIN} from '../../../json-crdt-patch/constants';
import {Decoder as MessagePackDecoder} from '../../../json-pack/Decoder';
import {FALSE, NULL, TRUE, UNDEFINED} from '../../constants';
import {Model} from '../../model';
import type {JsonNode} from '../../types';
import {ConstantType} from '../../types/const/ConstantType';
import {DocRootType} from '../../types/lww-doc-root/DocRootType';
import {ObjectChunk} from '../../types/lww-object/ObjectChunk';
import {ObjectType} from '../../types/lww-object/ObjectType';
import {ValueType} from '../../types/lww-value/ValueType';
import {ArrayChunk} from '../../types/rga-array/ArrayChunk';
import {ArrayType} from '../../types/rga-array/ArrayType';
import {StringChunk} from '../../types/rga-string/StringChunk';
import {StringType} from '../../types/rga-string/StringType';

export abstract class AbstractDecoder extends MessagePackDecoder {
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

  private decodeVal(): ValueType {
    const id = this.ts();
    const writeId = this.ts();
    const value = this.val();
    const obj = new ValueType(id, writeId, value);
    this.doc.nodes.index(obj);
    return obj;
  }

  public id(): [x: number, y: number] {
    const byte = this.u8();
    if (byte <= 0b0_111_1111) return [byte >>> 4, byte & 0b1111];
    this.back(1);
    return [this.b1vuint28()[1], this.vuint39()];
  }

  public vuint57(): number {
    const o1 = this.u8();
    if (o1 <= 0b01111111) return o1;
    const o2 = this.u8();
    if (o2 <= 0b01111111) return (o2 << 7) | (o1 & 0b01111111);
    const o3 = this.u8();
    if (o3 <= 0b01111111) return (o3 << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b01111111);
    const o4 = this.u8();
    if (o4 <= 0b01111111) return (o4 << 21) | ((o3 & 0b01111111) << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b01111111);
    const o5 = this.u8();
    if (o5 <= 0b01111111)
      return (
        o5 * 0b10000000000000000000000000000 +
        (((o4 & 0b01111111) << 21) | ((o3 & 0b01111111) << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b0111_1111))
      );
    const o6 = this.u8();
    if (o6 <= 0b01111111)
      return (
        o6 * 0b100000000000000000000000000000000000 +
        ((o5 & 0b01111111) * 0b10000000000000000000000000000 +
          (((o4 & 0b01111111) << 21) | ((o3 & 0b01111111) << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b0111_1111)))
      );
    const o7 = this.u8();
    if (o7 <= 0b01111111)
      return (
        o7 * 0b1000000000000000000000000000000000000000000 +
        ((o6 & 0b01111111) * 0b100000000000000000000000000000000000 +
          ((o5 & 0b01111111) * 0b10000000000000000000000000000 +
            (((o4 & 0b01111111) << 21) | ((o3 & 0b01111111) << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b0111_1111))))
      );
    const o8 = this.u8();
    return (
      o8 * 0b10000000000000000000000000000000000000000000000000 +
      ((o7 & 0b01111111) * 0b1000000000000000000000000000000000000000000 +
        ((o6 & 0b01111111) * 0b100000000000000000000000000000000000 +
          ((o5 & 0b01111111) * 0b10000000000000000000000000000 +
            (((o4 & 0b01111111) << 21) | ((o3 & 0b01111111) << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b0111_1111)))))
    );
  }

  public vuint39(): number {
    const o1 = this.u8();
    if (o1 <= 0b01111111) return o1;
    const o2 = this.u8();
    if (o2 <= 0b01111111) return (o2 << 7) | (o1 & 0b01111111);
    const o3 = this.u8();
    if (o3 <= 0b01111111) return (o3 << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b01111111);
    const o4 = this.u8();
    if (o4 <= 0b01111111) return (o4 << 21) | ((o3 & 0b01111111) << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b01111111);
    const o5 = this.u8();
    if (o5 <= 0b01111111)
      return (
        o5 * 0b10000000000000000000000000000 +
        (((o4 & 0b01111111) << 21) | ((o3 & 0b01111111) << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b0111_1111))
      );
    const o6 = this.u8();
    return (
      (o6 & 0b1111) * 0b100000000000000000000000000000000000 +
      ((o5 & 0b01111111) * 0b10000000000000000000000000000 +
        (((o4 & 0b01111111) << 21) | ((o3 & 0b01111111) << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b0111_1111)))
    );
  }

  public b1vuint56(): [flag: boolean, value56: number] {
    const byte = this.u8();
    const flag: boolean = !!(byte & 0b10000000);
    const o1 = 0b0_1_111111 & byte;
    if (o1 <= 0b0_0_111111) return [flag, o1];
    const o2 = this.u8();
    if (o2 <= 0b01111111) return [flag, (o2 << 6) | (o1 & 0b0_0_111111)];
    const o3 = this.u8();
    if (o3 <= 0b01111111) return [flag, (o3 << 13) | ((o2 & 0b01111111) << 6) | (o1 & 0b0_0_111111)];
    const o4 = this.u8();
    if (o4 <= 0b01111111)
      return [flag, (o4 << 20) | ((o3 & 0b01111111) << 13) | ((o2 & 0b01111111) << 6) | (o1 & 0b0_0_111111)];
    const o5 = this.u8();
    if (o5 <= 0b01111111)
      return [
        flag,
        o5 * 0b1000000000000000000000000000 +
          (((o4 & 0b01111111) << 20) | ((o3 & 0b01111111) << 13) | ((o2 & 0b01111111) << 6) | (o1 & 0b0_0_111111)),
      ];
    const o6 = this.u8();
    if (o6 <= 0b01111111)
      return [
        flag,
        o6 * 0b10000000000000000000000000000000000 +
          ((o5 & 0b01111111) * 0b1000000000000000000000000000 +
            (((o4 & 0b01111111) << 20) | ((o3 & 0b01111111) << 13) | ((o2 & 0b01111111) << 6) | (o1 & 0b0_0_111111))),
      ];
    const o7 = this.u8();
    if (o7 <= 0b01111111)
      return [
        flag,
        o7 * 0b100000000000000000000000000000000000000000 +
          ((o6 & 0b01111111) * 0b10000000000000000000000000000000000 +
            ((o5 & 0b01111111) * 0b1000000000000000000000000000 +
              (((o4 & 0b01111111) << 20) |
                ((o3 & 0b01111111) << 13) |
                ((o2 & 0b01111111) << 6) |
                (o1 & 0b0_0_111111)))),
      ];
    const o8 = this.u8();
    return [
      flag,
      o8 * 0b1000000000000000000000000000000000000000000000000 +
        ((o7 & 0b01111111) * 0b100000000000000000000000000000000000000000 +
          ((o6 & 0b01111111) * 0b10000000000000000000000000000000000 +
            ((o5 & 0b01111111) * 0b1000000000000000000000000000 +
              (((o4 & 0b01111111) << 20) |
                ((o3 & 0b01111111) << 13) |
                ((o2 & 0b01111111) << 6) |
                (o1 & 0b0_0_111111))))),
    ];
  }

  public b1vuint28(): [flag: boolean, value56: number] {
    const byte = this.u8();
    const flag: boolean = !!(byte & 0b10000000);
    const o1 = 0b0_1_111111 & byte;
    if (o1 <= 0b0_0_111111) return [flag, o1];
    const o2 = this.u8();
    if (o2 <= 0b01111111) return [flag, (o2 << 6) | (o1 & 0b0_0_111111)];
    const o3 = this.u8();
    if (o3 <= 0b01111111) return [flag, (o3 << 13) | ((o2 & 0b01111111) << 6) | (o1 & 0b0_0_111111)];
    const o4 = this.u8();
    return [flag, (o4 << 20) | ((o3 & 0b01111111) << 13) | ((o2 & 0b01111111) << 6) | (o1 & 0b0_0_111111)];
  }

  public uint53vuint39(): [x: number, z: number] {
    const x32 = this.u32();
    const x16 = this.u16();
    const y = this.u8();
    const z8 = this.u8();
    const x = (((y >>> 3) << 16) | x16) * 0x100000000 + x32;
    let z = ((y & 0b11) << 8) | z8;
    if (!(y & 0b100)) return [x, z];
    const o1 = this.u8();
    if (o1 <= 0b0_1111111) return [x, (o1 << 10) | z];
    const o2 = this.u8();
    if (o2 <= 0b0_1111111) return [x, (o2 << 17) | ((o1 & 0b0_1111111) << 10) | z];
    const o3 = this.u8();
    if (o3 <= 0b0_1111111) return [x, (o3 << 24) | (((o2 & 0b0_1111111) << 17) | ((o1 & 0b0_1111111) << 10) | z)];
    const o4 = this.u8();
    return [
      x,
      o4 * 0b10000000000000000000000000000000 +
        (((o3 & 0b0_1111111) << 24) | (((o2 & 0b0_1111111) << 17) | ((o1 & 0b0_1111111) << 10) | z)),
    ];
  }
}
