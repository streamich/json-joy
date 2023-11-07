import {ClockDecoder} from '../../../../json-crdt-patch/codec/clock/ClockDecoder';
import {CrdtReader} from '../../../../json-crdt-patch/util/binary/CrdtReader';
import {ITimestampStruct, Timestamp} from '../../../../json-crdt-patch/clock';
import {Model, UNDEFINED} from '../../../model/Model';
import {CborDecoderBase} from '../../../../json-pack/cbor/CborDecoderBase';
import {SESSION} from '../../../../json-crdt-patch/constants';
import {
  ArrNode,
  ArrChunk,
  BinNode,
  BinChunk,
  ConNode,
  ObjNode,
  RootNode,
  StrNode,
  StrChunk,
  ValNode,
  VecNode,
  type JsonNode,
} from '../../../nodes';
import {CRDT_MAJOR} from '../../structural/binary/constants';
import {sort} from '../../../../util/sort/insertion';

export class Decoder {
  protected doc!: Model;
  protected clockDecoder?: ClockDecoder;
  protected time: number = -1;
  protected readonly decoder: CborDecoderBase<CrdtReader> = new CborDecoderBase<CrdtReader>(new CrdtReader());

  public decode(view: unknown, meta: Uint8Array): Model {
    delete this.clockDecoder;
    this.time = -1;
    this.decoder.reader.reset(meta);
    this.decodeClockTable();
    const clock = this.clockDecoder!.clock;
    this.doc = Model.withLogicalClock(clock);
    this.doc.root = new RootNode(this.doc, this.cRoot(view).id);
    delete this.clockDecoder;
    return this.doc;
  }

  protected decodeClockTable(): void {
    const reader = this.decoder.reader;
    const clockTableOffset = reader.u32();
    const offset = reader.x;
    reader.x += clockTableOffset;
    const length = reader.vu39();
    const [sessionId, time] = reader.u53vu39();
    this.clockDecoder = new ClockDecoder(sessionId, time);
    for (let i = 1; i < length; i++) {
      const [sid, time] = reader.u53vu39();
      this.clockDecoder.pushTuple(sid, time);
    }
    reader.x = offset;
  }

  protected ts(): ITimestampStruct {
    const decoderTime = this.time!;
    const [sessionIndex, timeDiff] = this.decoder.reader.id();
    return this.clockDecoder!.decodeId(sessionIndex, timeDiff);
  }

  protected cRoot(view: unknown): JsonNode {
    const reader = this.decoder.reader;
    const peek = reader.uint8[reader.x];
    return !peek ? UNDEFINED : this.cNode(view);
  }

  protected cNode(view: unknown): JsonNode {
    const reader = this.decoder.reader;
    const id = this.ts();
    const octet = reader.u8();
    const major = octet >> 5;
    const minor = octet & 0b11111;
    const length = minor < 24 ? minor : minor === 24 ? reader.u8() : minor === 25 ? reader.u16() : reader.u32();
    switch (major) {
      case CRDT_MAJOR.CON:
        return this.cCon(view, id);
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
      // case CRDT_MAJOR.ARR:
      //   return this.cArr(id, length);
    }
    throw new Error('UNKNOWN_NODE');
  }

  protected cCon(view: unknown, id: ITimestampStruct): ConNode {
    const doc = this.doc;
    const node = new ConNode(id, view);
    doc.index.set(id, node);
    return node;
  }

  protected cVal(view: unknown, id: ITimestampStruct): ValNode {
    const child = this.cNode(view);
    const doc = this.doc;
    const node = new ValNode(doc, id, child.id);
    doc.index.set(id, node);
    return node;
  }

  protected cObj(view: unknown, id: ITimestampStruct, length: number): ObjNode {
    const obj = new ObjNode(this.doc, id);
    if (!view || typeof view !== 'object') throw new Error('INVALID_OBJ');
    const keys = sort(Object.keys(view));
    if (keys.length !== length) throw new Error('INVALID_OBJ');
    const objKeys = obj.keys;
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      const childNode = this.cNode((view as any)[key]);
      objKeys.set(key, childNode.id);
    }
    this.doc.index.set(id, obj);
    return obj;
  }

  protected cVec(view: unknown, id: ITimestampStruct, length: number): VecNode {
    const obj = new VecNode(this.doc, id);
    if (!Array.isArray(view) || view.length !== length) throw new Error('INVALID_VEC');
    const elements = obj.elements;
    const reader = this.decoder.reader;
    for (let i = 0; i < length; i++) {
      const octet = reader.peak();
      if (octet === 0xff) {
        reader.x++;
        elements.push(undefined);
      } else elements.push(this.cNode(view[i]).id);
    }
    this.doc.index.set(id, obj);
    return obj;
  }

  protected cStr(view: unknown, id: ITimestampStruct, length: number): StrNode {
    if (typeof view !== 'string') throw new Error('INVALID_STR');
    const node = new StrNode(id);
    const reader = this.decoder.reader;
    let offset = 0;
    node.ingest(length, (): StrChunk => {
      const id = this.ts();
      const span = reader.vu39();
      if (!span) return new StrChunk(id, length, '');
      const text = view.slice(offset, offset + span);
      offset += span;
      return new StrChunk(id, text.length, text);
    });
    this.doc.index.set(id, node);
    return node;
  }

  protected cBin(view: unknown, id: ITimestampStruct, length: number): BinNode {
    if (!(view instanceof Uint8Array)) throw new Error('INVALID_BIN');
    const node = new BinNode(id);
    const reader = this.decoder.reader;
    let offset = 0;
    node.ingest(length, (): BinChunk => {
      const id = this.ts();
      const span = reader.vu39();
      if (!span) return new BinChunk(id, length, undefined);
      const slice = view.slice(offset, offset + span);
      offset += span;
      return new BinChunk(id, slice.length, slice);
    });
    this.doc.index.set(id, node);
    return node;
  }

  // protected cBin(id: ITimestampStruct, length: number): BinNode {
  //   const node = new BinNode(id);
  //   if (length) node.ingest(length, this.cBinChunk);
  //   this.doc.index.set(id, node);
  //   return node;
  // }

  // private cBinChunk = (): BinChunk => {
  //   const reader = this.reader;
  //   const [deleted, length] = reader.b1vu28();
  //   const id = this.ts();
  //   if (deleted) return new BinChunk(id, length, undefined);
  //   else return new BinChunk(id, length, reader.buf(length));
  // };

  // protected cArr(id: ITimestampStruct, length: number): ArrNode {
  //   const obj = new ArrNode(this.doc, id);
  //   if (length) obj.ingest(length, this.cArrChunk);
  //   this.doc.index.set(id, obj);
  //   return obj;
  // }

  // private readonly cArrChunk = (): ArrChunk => {
  //   const [deleted, length] = this.reader.b1vu28();
  //   const id = this.ts();
  //   if (deleted) return new ArrChunk(id, length, undefined);
  //   const ids: ITimestampStruct[] = [];
  //   for (let i = 0; i < length; i++) ids.push(this.cNode().id);
  //   return new ArrChunk(id, length, ids);
  // };
}
