import * as nodes from '../../../nodes';
import {ClockTable} from '../../../../json-crdt-patch/codec/clock/ClockTable';
import {CrdtReader} from '../../../../json-crdt-patch/util/binary/CrdtReader';
import {IndexedFields, FieldName, IndexedNodeFields} from './types';
import {ITimestampStruct, IVectorClock, Timestamp, VectorClock} from '../../../../json-crdt-patch/clock';
import {Model, UNDEFINED} from '../../../model/Model';
import {CborDecoderBase} from '../../../../json-pack/cbor/CborDecoderBase';
import {CRDT_MAJOR} from '../../structural/binary/constants';

export class Decoder {
  public readonly dec: CborDecoderBase<CrdtReader>;
  protected doc!: Model;
  protected clockTable?: ClockTable;

  constructor(reader?: CrdtReader) {
    this.dec = new CborDecoderBase<CrdtReader>(reader || new CrdtReader());
  }

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

  protected decodeNode(id: ITimestampStruct): nodes.JsonNode {
    const reader = this.dec.reader;
    const octet = reader.u8();
    const major = octet >> 5;
    const minor = octet & 0b11111;
    const length = minor < 24 ? minor : minor === 24 ? reader.u8() : minor === 25 ? reader.u16() : reader.u32();
    switch (major) {
      case CRDT_MAJOR.CON:
        return this.decodeCon(id, length);
      // case CRDT_MAJOR.VAL:
      //   return this.cVal(id);
      // case CRDT_MAJOR.VEC:
      //   return this.cVec(id, length);
      // case CRDT_MAJOR.OBJ:
      //   return this.cObj(id, length);
      // case CRDT_MAJOR.STR:
      //   return this.cStr(id, length);
      // case CRDT_MAJOR.BIN:
      //   return this.cBin(id, length);
      // case CRDT_MAJOR.ARR:
      //   return this.cArr(id, length);
    }
    return UNDEFINED;
  }

  public decodeCon(id: ITimestampStruct, length: number): nodes.ConNode {
    const doc = this.doc;
    const decoder = this.dec;
    const data = !length ? decoder.val() : this.ts();
    const node = new nodes.ConNode(id, data);
    doc.index.set(id, node);
    return node;
  }

  public cVal(id: ITimestampStruct): nodes.ValNode {
    const val = this.ts();
    return new nodes.ValNode(this.doc, id, val);
  }

  public cObj(id: ITimestampStruct, length: number): nodes.ObjNode {
    const decoder = this.dec;
    const obj = new nodes.ObjNode(this.doc, id);
    const keys = obj.keys;
    for (let i = 0; i < length; i++) {
      const key = String(decoder.val());
      const val = this.ts();
      keys.set(key, val);
    }
    return obj;
  }

  protected cStr(id: ITimestampStruct, length: number): nodes.StrNode {
    const decoder = this.dec;
    const node = new nodes.StrNode(id);
    node.ingest(length, () => {
      const chunkId = this.ts();
      const val = decoder.val();
      if (typeof val === 'number') return new nodes.StrChunk(chunkId, val, '');
      const data = String(val);
      return new nodes.StrChunk(chunkId, data.length, data);
    });
    return node;
  }

  protected cBin(id: ITimestampStruct, length: number): nodes.BinNode {
    const decoder = this.dec;
    const reader = decoder.reader;
    const node = new nodes.BinNode(id);
    node.ingest(length, () => {
      const chunkId = this.ts();
      const [deleted, length] = reader.b1vu28();
      if (deleted) return new nodes.BinChunk(chunkId, length, undefined);
      const data = reader.buf(length);
      return new nodes.BinChunk(chunkId, length, data);
    });
    return node;
  }

  protected cArr(id: ITimestampStruct, length: number): nodes.ArrNode {
    const decoder = this.dec;
    const reader = decoder.reader;
    const node = new nodes.ArrNode(this.doc, id);
    node.ingest(length, () => {
      const chunkId = this.ts();
      const [deleted, length] = reader.b1vu28();
      if (deleted) return new nodes.ArrChunk(chunkId, length, undefined);
      const data: ITimestampStruct[] = [];
      for (let i = 0; i < length; i++) data.push(this.ts());
      return new nodes.ArrChunk(chunkId, length, data);
    });
    return node;
  }
}
