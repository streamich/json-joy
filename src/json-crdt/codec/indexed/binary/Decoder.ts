import * as nodes from '../../../nodes';
import {ClockTable} from '../../../../json-crdt-patch/codec/clock/ClockTable';
import {CrdtReader} from '../../../../json-crdt-patch/util/binary/CrdtReader';
import type {IndexedFields, FieldName, IndexedNodeFields} from './types';
import {type ITimestampStruct, type IClockVector, Timestamp, ClockVector} from '../../../../json-crdt-patch/clock';
import {Model, UNDEFINED} from '../../../model/Model';
import {CborDecoderBase} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoderBase';
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
    ModelConstructor: new (clock: IClockVector) => M = Model as unknown as new (
      clock: IClockVector,
    ) => M,
  ): M {
    const reader = this.dec.reader;
    reader.reset(fields.c);
    const clockTable = (this.clockTable = ClockTable.decode(reader));
    return this.decodeFields(clockTable, fields, ModelConstructor);
  }

  public decodeFields<M extends Model>(
    clockTable: ClockTable,
    fields: IndexedNodeFields,
    ModelConstructor: new (clock: IClockVector) => M = Model as unknown as new (
      clock: IClockVector,
    ) => M,
  ): M {
    const reader = this.dec.reader;
    const firstClock = clockTable.byIdx[0];
    const vectorClock = new ClockVector(firstClock.sid, firstClock.time + 1);
    const doc = (this.doc = new ModelConstructor(vectorClock));
    const root = fields.r;
    if (root && root.length) {
      reader.reset(root);
      const rootValue = this.ts();
      doc.root.set(rootValue);
    }
    const index = doc.index;
    const keys = Object.keys(fields);
    const length = keys.length;
    for (let i = 0; i < length; i++) {
      const field = keys[i];
      if (field.length < 3) continue; // Skip "c" and "r".
      const arr = fields[field as FieldName];
      const id = clockTable.parseField(field as FieldName);
      reader.reset(arr);
      const node = this.decodeNode(id);
      index.set(id, node);
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
      case CRDT_MAJOR.VAL:
        return this.decodeVal(id);
      case CRDT_MAJOR.OBJ:
        return this.decodeObj(id, length);
      case CRDT_MAJOR.VEC:
        return this.decodeVec(id, length);
      case CRDT_MAJOR.STR:
        return this.decodeStr(id, length);
      case CRDT_MAJOR.BIN:
        return this.decodeBin(id, length);
      case CRDT_MAJOR.ARR:
        return this.decodeArr(id, length);
    }
    return UNDEFINED;
  }

  public decodeCon(id: ITimestampStruct, length: number): nodes.ConNode {
    const decoder = this.dec;
    const data = !length ? decoder.val() : this.ts();
    const node = new nodes.ConNode(id, data);
    return node;
  }

  public decodeVal(id: ITimestampStruct): nodes.ValNode {
    const val = this.ts();
    const node = new nodes.ValNode(this.doc, id, val);
    return node;
  }

  public decodeObj(id: ITimestampStruct, length: number): nodes.ObjNode {
    const decoder = this.dec;
    const obj = new nodes.ObjNode(this.doc, id);
    const keys = obj.keys;
    for (let i = 0; i < length; i++) {
      const key = decoder.val() + '';
      const val = this.ts();
      keys.set(key, val);
    }
    return obj;
  }

  public decodeVec(id: ITimestampStruct, length: number): nodes.VecNode {
    const reader = this.dec.reader;
    const node = new nodes.VecNode(this.doc, id);
    const elements = node.elements;
    for (let i = 0; i < length; i++) {
      const octet = reader.u8();
      if (!octet) elements.push(undefined);
      else elements.push(this.ts());
    }
    return node;
  }

  protected decodeStr(id: ITimestampStruct, length: number): nodes.StrNode {
    const node = new nodes.StrNode(id);
    node.ingest(length, this.decodeStrChunk);
    return node;
  }

  private decodeStrChunk = (): nodes.StrChunk => {
    const decoder = this.dec;
    const reader = decoder.reader;
    const id = this.ts();
    const val = decoder.val();
    if (typeof val === 'string') return new nodes.StrChunk(id, val.length, val);
    return new nodes.StrChunk(id, ~~(<number>val), '');
  };

  protected decodeBin(id: ITimestampStruct, length: number): nodes.BinNode {
    const node = new nodes.BinNode(id);
    node.ingest(length, this.decodeBinChunk);
    return node;
  }

  private decodeBinChunk = (): nodes.BinChunk => {
    const id = this.ts();
    const reader = this.dec.reader;
    const [deleted, length] = reader.b1vu56();
    if (deleted) return new nodes.BinChunk(id, length, undefined);
    return new nodes.BinChunk(id, length, reader.buf(length));
  };

  protected decodeArr(id: ITimestampStruct, length: number): nodes.ArrNode {
    const node = new nodes.ArrNode(this.doc, id);
    node.ingest(length, this.decodeArrChunk);
    return node;
  }

  private decodeArrChunk = (): nodes.ArrChunk => {
    const id = this.ts();
    const reader = this.dec.reader;
    const [deleted, length] = reader.b1vu56();
    if (deleted) return new nodes.ArrChunk(id, length, undefined);
    else {
      const data: ITimestampStruct[] = [];
      for (let i = 0; i < length; i++) data.push(this.ts());
      return new nodes.ArrChunk(id, length, data);
    }
  };
}
