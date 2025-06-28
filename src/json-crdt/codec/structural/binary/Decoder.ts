import * as nodes from '../../../nodes';
import {ClockDecoder} from '../../../../json-crdt-patch/codec/clock/ClockDecoder';
import {CrdtReader} from '../../../../json-crdt-patch/util/binary/CrdtReader';
import {type ITimestampStruct, Timestamp} from '../../../../json-crdt-patch/clock';
import {Model, UNDEFINED} from '../../../model/Model';
import {CborDecoderBase} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoderBase';
import {SESSION} from '../../../../json-crdt-patch/constants';
import {CRDT_MAJOR} from './constants';

export class Decoder extends CborDecoderBase<CrdtReader> {
  protected doc!: Model;
  protected clockDecoder?: ClockDecoder = undefined;
  protected time: number = -1;

  constructor() {
    super(new CrdtReader());
  }

  public decode(data: Uint8Array, model?: Model): Model {
    this.clockDecoder = undefined;
    this.time = -1;
    const reader = this.reader;
    reader.reset(data);
    const isServerTime = reader.peak() & 0b10000000;
    if (isServerTime) {
      reader.x++;
      const time = (this.time = reader.vu57());
      if (!model) model = Model.withServerClock(time);
    } else {
      this.decodeClockTable();
      if (!model) {
        const clock = this.clockDecoder!.clock;
        model = Model.create(void 0, clock);
      }
    }
    this.doc = model;
    model.root = new nodes.RootNode(this.doc, this.cRoot().id);
    this.clockDecoder = undefined;
    return model;
  }

  protected decodeClockTable(): void {
    const reader = this.reader;
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
    const decoderTime = this.time!;
    const isLogical = decoderTime < 0;
    if (isLogical) {
      const [sessionIndex, timeDiff] = this.reader.id();
      return this.clockDecoder!.decodeId(sessionIndex, timeDiff);
    } else {
      return new Timestamp(SESSION.SERVER, this.reader.vu57());
    }
  }

  protected cRoot(): nodes.JsonNode {
    const reader = this.reader;
    const peek = reader.uint8[reader.x];
    return !peek ? UNDEFINED : this.cNode();
  }

  protected cNode(): nodes.JsonNode {
    const reader = this.reader;
    const id = this.ts();
    const octet = reader.u8();
    const major = octet >> 5;
    const minor = octet & 0b11111;
    switch (major) {
      case CRDT_MAJOR.CON:
        return this.cCon(id, minor);
      case CRDT_MAJOR.VAL:
        return this.cVal(id);
      case CRDT_MAJOR.OBJ:
        return this.cObj(id, minor !== 0b11111 ? minor : reader.vu57());
      case CRDT_MAJOR.VEC:
        return this.cVec(id, minor !== 0b11111 ? minor : reader.vu57());
      case CRDT_MAJOR.STR:
        return this.cStr(id, minor !== 0b11111 ? minor : reader.vu57());
      case CRDT_MAJOR.BIN:
        return this.cBin(id, minor !== 0b11111 ? minor : reader.vu57());
      case CRDT_MAJOR.ARR:
        return this.cArr(id, minor !== 0b11111 ? minor : reader.vu57());
    }
    throw new Error('UNKNOWN_NODE');
  }

  protected cCon(id: ITimestampStruct, length: number): nodes.ConNode {
    const doc = this.doc;
    const data = !length ? this.val() : this.ts();
    const node = new nodes.ConNode(id, data);
    doc.index.set(id, node);
    return node;
  }

  protected cVal(id: ITimestampStruct): nodes.ValNode {
    const child = this.cNode();
    const doc = this.doc;
    const node = new nodes.ValNode(doc, id, child.id);
    doc.index.set(id, node);
    return node;
  }

  protected cObj(id: ITimestampStruct, length: number): nodes.ObjNode {
    const obj = new nodes.ObjNode(this.doc, id);
    for (let i = 0; i < length; i++) this.cObjChunk(obj);
    this.doc.index.set(id, obj);
    return obj;
  }

  protected cObjChunk(obj: nodes.ObjNode): void {
    const key: string = this.key();
    obj.keys.set(key, this.cNode().id);
  }

  protected cVec(id: ITimestampStruct, length: number): nodes.VecNode {
    const reader = this.reader;
    const obj = new nodes.VecNode(this.doc, id);
    const elements = obj.elements;
    for (let i = 0; i < length; i++) {
      const octet = reader.peak();
      if (!octet) {
        reader.x++;
        elements.push(undefined);
      } else elements.push(this.cNode().id);
    }
    this.doc.index.set(id, obj);
    return obj;
  }

  protected cStr(id: ITimestampStruct, length: number): nodes.StrNode {
    const node = new nodes.StrNode(id);
    if (length) node.ingest(length, this.cStrChunk);
    this.doc.index.set(id, node);
    return node;
  }

  private cStrChunk = (): nodes.StrChunk => {
    const id = this.ts();
    const val = this.val();
    if (typeof val === 'string') return new nodes.StrChunk(id, val.length, val);
    return new nodes.StrChunk(id, ~~(<number>val), '');
  };

  protected cBin(id: ITimestampStruct, length: number): nodes.BinNode {
    const node = new nodes.BinNode(id);
    if (length) node.ingest(length, this.cBinChunk);
    this.doc.index.set(id, node);
    return node;
  }

  private cBinChunk = (): nodes.BinChunk => {
    const id = this.ts();
    const reader = this.reader;
    const [deleted, length] = reader.b1vu56();
    if (deleted) return new nodes.BinChunk(id, length, undefined);
    return new nodes.BinChunk(id, length, reader.buf(length));
  };

  protected cArr(id: ITimestampStruct, length: number): nodes.ArrNode {
    const obj = new nodes.ArrNode(this.doc, id);
    if (length) obj.ingest(length, this.cArrChunk);
    this.doc.index.set(id, obj);
    return obj;
  }

  private readonly cArrChunk = (): nodes.ArrChunk => {
    const id = this.ts();
    const [deleted, length] = this.reader.b1vu56();
    if (deleted) return new nodes.ArrChunk(id, length, undefined);
    const ids: ITimestampStruct[] = [];
    for (let i = 0; i < length; i++) ids.push(this.cNode().id);
    return new nodes.ArrChunk(id, length, ids);
  };
}
