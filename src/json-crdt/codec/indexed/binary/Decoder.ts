import {ArrayChunk, ArrayRga} from '../../../types/rga-array/ArrayRga';
import {BinaryChunk, BinaryRga} from '../../../types/rga-binary/BinaryRga';
import {ClockTable} from '../../../../json-crdt-patch/codec/clock/ClockTable';
import {Const} from '../../../types/con/Const';
import {CrdtReader} from '../../../../json-crdt-patch/util/binary/CrdtDecoder';
import {IndexedFields, FieldName, IndexedNodeFields} from './types';
import {ITimestampStruct, IVectorClock, Timestamp, VectorClock} from '../../../../json-crdt-patch/clock';
import {JsonNode} from '../../../types';
import {Model, UNDEFINED} from '../../../model/Model';
import {MsgPackDecoderFast} from '../../../../json-pack/msgpack';
import {ObjectLww} from '../../../types/lww-object/ObjectLww';
import {StringChunk, StringRga} from '../../../types/rga-string/StringRga';
import {ValueLww} from '../../../types/lww-value/ValueLww';

export class Decoder {
  public readonly dec = new MsgPackDecoderFast<CrdtReader>(new CrdtReader());
  protected doc!: Model;
  protected clockTable?: ClockTable;

  public decode<M extends Model>(
    fields: IndexedFields,
    ModelConstructor: new (clock: IVectorClock) => M = Model as unknown as new (clock: IVectorClock) => M,
  ): M {
    const reader = this.dec.reader;
    reader.reset(fields.c);
    const clockTable = (this.clockTable = ClockTable.decode(reader));
    return this.decodeFields(clockTable, fields, ModelConstructor);
  }

  public decodeFields<M extends Model>(
    clockTable: ClockTable,
    fields: IndexedNodeFields,
    ModelConstructor: new (clock: IVectorClock) => M = Model as unknown as new (clock: IVectorClock) => M,
  ): M {
    const reader = this.dec.reader;
    const firstClock = clockTable.byIdx[0];
    const vectorClock = new VectorClock(firstClock.sid, firstClock.time + 1);
    const doc = (this.doc = new ModelConstructor(vectorClock));
    const root = fields.r;
    if (root && root.length) {
      reader.reset(root);
      const rootValue = this.ts();
      doc.root.set(rootValue);
    }
    const docIndex = doc.index;
    for (const field in fields) {
      if (field.length < 3) continue; // Skip "c" and "r".
      const arr = fields[field as FieldName];
      const id = clockTable.parseField(field as FieldName);
      reader.reset(arr);
      const node = this.decodeNode(id);
      docIndex.set(node.id, node);
    }
    return doc;
  }

  protected ts(): ITimestampStruct {
    const [sessionIndex, timeDiff] = this.dec.reader.id();
    return new Timestamp(this.clockTable!.byIdx[sessionIndex].sid, timeDiff);
  }

  protected decodeNode(id: ITimestampStruct): JsonNode {
    const reader = this.dec.reader;
    const byte = reader.u8();
    if (byte <= 0b10001111) return this.cObj(id, byte & 0b1111);
    else if (byte <= 0b10011111) return this.cArr(id, byte & 0b1111);
    else if (byte <= 0b10111111) return this.cStr(id, byte & 0b11111);
    else {
      switch (byte) {
        case 0xc4:
          return this.cBin(id, reader.u8());
        case 0xc5:
          return this.cBin(id, reader.u16());
        case 0xc6:
          return this.cBin(id, reader.u32());
        case 0xd4:
          return this.cConst(id);
        case 0xd5:
          return new Const(id, this.ts());
        case 0xd6:
          return this.cVal(id);
        case 0xde:
          return this.cObj(id, reader.u16());
        case 0xdf:
          return this.cObj(id, reader.u32());
        case 0xdc:
          return this.cArr(id, reader.u16());
        case 0xdd:
          return this.cArr(id, reader.u32());
        case 0xd9:
          return this.cStr(id, reader.u8());
        case 0xda:
          return this.cStr(id, reader.u16());
        case 0xdb:
          return this.cStr(id, reader.u32());
      }
    }

    return UNDEFINED;
  }

  public cConst(id: ITimestampStruct): Const {
    const val = this.dec.val();
    return new Const(id, val);
  }

  public cVal(id: ITimestampStruct): ValueLww {
    const val = this.ts();
    return new ValueLww(this.doc, id, val);
  }

  public cObj(id: ITimestampStruct, length: number): ObjectLww {
    const decoder = this.dec;
    const obj = new ObjectLww(this.doc, id);
    const keys = obj.keys;
    for (let i = 0; i < length; i++) {
      const key = String(decoder.val());
      const val = this.ts();
      keys.set(key, val);
    }
    return obj;
  }

  protected cStr(id: ITimestampStruct, length: number): StringRga {
    const decoder = this.dec;
    const node = new StringRga(id);
    node.ingest(length, () => {
      const chunkId = this.ts();
      const val = decoder.val();
      if (typeof val === 'number') return new StringChunk(chunkId, val, '');
      const data = String(val);
      return new StringChunk(chunkId, data.length, data);
    });
    return node;
  }

  protected cBin(id: ITimestampStruct, length: number): BinaryRga {
    const decoder = this.dec;
    const reader = decoder.reader;
    const node = new BinaryRga(id);
    node.ingest(length, () => {
      const chunkId = this.ts();
      const [deleted, length] = reader.b1vu28();
      if (deleted) return new BinaryChunk(chunkId, length, undefined);
      const data = reader.buf(length);
      return new BinaryChunk(chunkId, length, data);
    });
    return node;
  }

  protected cArr(id: ITimestampStruct, length: number): ArrayRga {
    const decoder = this.dec;
    const reader = decoder.reader;
    const node = new ArrayRga(this.doc, id);
    node.ingest(length, () => {
      const chunkId = this.ts();
      const [deleted, length] = reader.b1vu28();
      if (deleted) return new ArrayChunk(chunkId, length, undefined);
      const data: ITimestampStruct[] = [];
      for (let i = 0; i < length; i++) data.push(this.ts());
      return new ArrayChunk(chunkId, length, data);
    });
    return node;
  }
}
