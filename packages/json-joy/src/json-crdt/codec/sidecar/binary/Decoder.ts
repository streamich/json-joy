import {ClockDecoder} from '../../../../json-crdt-patch/codec/clock/ClockDecoder';
import {CrdtReader} from '../../../../json-crdt-patch/util/binary/CrdtReader';
import type {ITimestampStruct} from '../../../../json-crdt-patch/clock';
import {Model, UNDEFINED} from '../../../model/Model';
import {CborDecoderBase} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoderBase';
import * as nodes from '../../../nodes';
import {CRDT_MAJOR} from '../../structural/binary/constants';
import {sort} from '@jsonjoy.com/util/lib/sort/insertion';
import {SESSION} from '../../../../json-crdt-patch/constants';

export class Decoder {
  protected doc!: Model;
  protected clockDecoder?: ClockDecoder = undefined;
  protected time: number = -1;
  protected readonly decoder: CborDecoderBase<CrdtReader> = new CborDecoderBase<CrdtReader>(new CrdtReader());

  public decode(view: unknown, meta: Uint8Array): Model {
    this.clockDecoder = undefined;
    this.time = -1;
    this.decoder.reader.reset(meta);
    this.decodeClockTable();
    const clock = this.clockDecoder!.clock;
    const doc = this.doc = Model.create(void 0, clock);
    const rootValue = this.cRoot(view);
    const root = doc.root = new nodes.RootNode(this.doc, rootValue.id);
    rootValue.parent = root;
    this.clockDecoder = undefined;
    return this.doc;
  }

  protected decodeClockTable(): void {
    const reader = this.decoder.reader;
    const clockTableOffset = reader.u32();
    const offset = reader.x;
    reader.x += clockTableOffset;
    const length = reader.vu57();
    const sessionId = reader.vu57();
    const time = reader.vu57();
    this.clockDecoder = new ClockDecoder(sessionId, time);
    for (let i = 1; i < length; i++) {
      const sid = reader.vu57();
      const time = reader.vu57();
      this.clockDecoder.pushTuple(sid, time);
    }
    reader.x = offset;
  }

  protected ts(): ITimestampStruct {
    const [sessionIndex, timeDiff] = this.decoder.reader.id();
    return this.clockDecoder!.decodeId(sessionIndex, timeDiff);
  }

  protected cRoot(view: unknown): nodes.JsonNode {
    const reader = this.decoder.reader;
    const peek = reader.uint8[reader.x];
    return !peek ? UNDEFINED : this.cNode(view);
  }

  protected cNode(view: unknown): nodes.JsonNode {
    const reader = this.decoder.reader;
    const id = this.ts();
    const octet = reader.u8();
    const major = octet >> 5;
    const minor = octet & 0b11111;
    const length = minor < 24 ? minor : minor === 24 ? reader.u8() : minor === 25 ? reader.u16() : reader.u32();
    switch (major) {
      case CRDT_MAJOR.CON:
        return this.cCon(view, id, length);
      case CRDT_MAJOR.VAL:
        return this.cVal(view, id);
      case CRDT_MAJOR.OBJ:
        return this.cObj(view, id, length);
      case CRDT_MAJOR.VEC:
        return this.cVec(view, id, length);
      case CRDT_MAJOR.STR:
        return this.cStr(view, id, length);
      case CRDT_MAJOR.BIN:
        return this.cBin(view, id, length);
      case CRDT_MAJOR.ARR:
        return this.cArr(view, id, length);
    }
    throw new Error('UNKNOWN_NODE');
  }

  protected cCon(view: unknown, id: ITimestampStruct, length: number): nodes.ConNode {
    const doc = this.doc;
    const node = new nodes.ConNode(id, length ? this.ts() : view);
    doc.index.set(id, node);
    return node;
  }

  protected cVal(view: unknown, id: ITimestampStruct): nodes.ValNode {
    const child = this.cNode(view);
    const doc = this.doc;
    const node = new nodes.ValNode(doc, id, child.id);
    child.parent = node;
    doc.index.set(id, node);
    return node;
  }

  protected cObj(view: unknown, id: ITimestampStruct, length: number): nodes.ObjNode {
    const obj = new nodes.ObjNode(this.doc, id);
    if (!view || typeof view !== 'object') throw new Error('INVALID_OBJ');
    const keys = sort(Object.keys(view));
    if (keys.length !== length) throw new Error('INVALID_OBJ');
    const objKeys = obj.keys;
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      const child = this.cNode((view as any)[key]);
      child.parent = obj;
      objKeys.set(key, child.id);
    }
    this.doc.index.set(id, obj);
    return obj;
  }

  protected cVec(view: unknown, id: ITimestampStruct, length: number): nodes.VecNode {
    const obj = new nodes.VecNode(this.doc, id);
    if (!Array.isArray(view) || view.length !== length) throw new Error('INVALID_VEC');
    const elements = obj.elements;
    for (let i = 0; i < length; i++) {
      const child = this.cNode(view[i]);
      const childId = child.id;
      if (childId.sid === SESSION.SYSTEM) elements.push(undefined);
      else {
        child.parent = obj;
        elements.push(childId);
      }
    }
    this.doc.index.set(id, obj);
    return obj;
  }

  protected cStr(view: unknown, id: ITimestampStruct, length: number): nodes.StrNode {
    if (typeof view !== 'string') throw new Error('INVALID_STR');
    const node = new nodes.StrNode(id);
    const reader = this.decoder.reader;
    let offset = 0;
    node.ingest(length, (): nodes.StrChunk => {
      const id = this.ts();
      const [deleted, span] = reader.b1vu56();
      if (deleted) return new nodes.StrChunk(id, span, '');
      const text = view.slice(offset, offset + span);
      offset += span;
      return new nodes.StrChunk(id, text.length, text);
    });
    this.doc.index.set(id, node);
    return node;
  }

  protected cBin(view: unknown, id: ITimestampStruct, length: number): nodes.BinNode {
    if (!(view instanceof Uint8Array)) throw new Error('INVALID_BIN');
    const node = new nodes.BinNode(id);
    const reader = this.decoder.reader;
    let offset = 0;
    node.ingest(length, (): nodes.BinChunk => {
      const id = this.ts();
      const [deleted, span] = reader.b1vu56();
      if (deleted) return new nodes.BinChunk(id, span, undefined);
      const slice = view.slice(offset, offset + span);
      offset += span;
      return new nodes.BinChunk(id, slice.length, slice);
    });
    this.doc.index.set(id, node);
    return node;
  }

  protected cArr(view: unknown, id: ITimestampStruct, length: number): nodes.ArrNode {
    if (!Array.isArray(view)) throw new Error('INVALID_ARR');
    const obj = new nodes.ArrNode(this.doc, id);
    const reader = this.decoder.reader;
    let i = 0;
    obj.ingest(length, (): nodes.ArrChunk => {
      const id = this.ts();
      const [deleted, span] = reader.b1vu56();
      if (deleted) return new nodes.ArrChunk(id, span, undefined);
      const ids: ITimestampStruct[] = [];
      for (let j = 0; j < span; j++) {
        const child = this.cNode(view[i++]);
        child.parent = obj;
        ids.push(child.id);
      }
      return new nodes.ArrChunk(id, span, ids);
    });
    this.doc.index.set(id, obj);
    return obj;
  }
}
