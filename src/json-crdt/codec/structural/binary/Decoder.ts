import {ClockDecoder} from '../../../../json-crdt-patch/codec/clock/ClockDecoder';
import {CrdtReader} from '../../../../json-crdt-patch/util/binary/CrdtDecoder';
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
import {CRDT_MAJOR} from './constants';

export class Decoder extends CborDecoderBase<CrdtReader> {
  protected doc!: Model;
  protected clockDecoder?: ClockDecoder;
  protected time: number = -1;

  constructor() {
    super(new CrdtReader());
  }

  public decode(data: Uint8Array): Model {
    delete this.clockDecoder;
    this.time = -1;
    const reader = this.reader;
    reader.reset(data);
    const isServerTime = reader.u8() === 0;
    if (isServerTime) {
      const time = (this.time = reader.vu57());
      this.doc = Model.withServerClock(time);
    } else {
      this.decodeClockTable();
      const clock = this.clockDecoder!.clock;
      this.doc = Model.withLogicalClock(clock);
    }
    this.doc.root = new RootNode(this.doc, this.cRoot().id);
    delete this.clockDecoder;
    return this.doc;
  }

  protected decodeClockTable(): void {
    const reader = this.reader;
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
    const isLogical = decoderTime < 0;
    if (isLogical) {
      const [sessionIndex, timeDiff] = this.reader.id();
      return this.clockDecoder!.decodeId(sessionIndex, timeDiff);
    } else {
      return new Timestamp(SESSION.SERVER, this.reader.vu57());
    }
  }

  protected cRoot(): JsonNode {
    const reader = this.reader;
    const peek = reader.uint8[reader.x];
    return !peek ? UNDEFINED : this.cNode();
  }

  protected nodeLength(minor: number): number {
    if (minor < 24) return minor;
    switch (minor) {
      case 24:
        return this.reader.u8();
      case 25:
        return this.reader.u16();
      case 26:
        return this.reader.u32();
    }
    return 0;
  }

  public cNode(): JsonNode {
    const reader = this.reader;
    const id = this.ts();
    const octet = reader.u8();
    const major = octet >> 5;
    const minor = octet & 0b11111;
    const length = this.nodeLength(minor);
    switch (major) {
      case CRDT_MAJOR.CON: return this.cCon(id, length);
      case CRDT_MAJOR.VAL: return this.cVal(id);
      case CRDT_MAJOR.VEC: return this.cVec(id, length);
      case CRDT_MAJOR.OBJ: return this.cObj(id, length);
      case CRDT_MAJOR.STR: return this.cStr(id, length);
      case CRDT_MAJOR.BIN: return this.cBin(id, length);
      case CRDT_MAJOR.ARR: return this.cArr(id, length);
    }
    throw new Error('UNKNOWN_NODE');
  }

  public cCon(id: ITimestampStruct, length: number): ConNode {
    const doc = this.doc;
    const data = !length ? this.val() : this.ts();
    const node = new ConNode(id, data);
    doc.index.set(id, node);
    return node;
  }

  public cVal(id: ITimestampStruct): ValNode {
    const child = this.cNode();
    const doc = this.doc;
    const node = new ValNode(doc, id, child.id);
    doc.index.set(id, node);
    return node;
  }

  public cObj(id: ITimestampStruct, length: number): ObjNode {
    const obj = new ObjNode(this.doc, id);
    for (let i = 0; i < length; i++) this.cObjChunk(obj);
    this.doc.index.set(id, obj);
    return obj;
  }

  private cObjChunk(obj: ObjNode): void {
    const key: string = this.key();
    obj.keys.set(key, this.cNode().id);
  }

  public cVec(id: ITimestampStruct, length: number): VecNode {
    const reader = this.reader;
    const obj = new VecNode(this.doc, id);
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

  public cArr(id: ITimestampStruct, length: number): ArrNode {
    const obj = new ArrNode(this.doc, id);
    obj.ingest(length, this.cArrChunk);
    this.doc.index.set(id, obj);
    return obj;
  }

  private readonly cArrChunk = (): ArrChunk => {
    const [deleted, length] = this.reader.b1vu28();
    const id = this.ts();
    if (deleted) return new ArrChunk(id, length, undefined);
    const ids: ITimestampStruct[] = [];
    for (let i = 0; i < length; i++) ids.push(this.cNode().id);
    return new ArrChunk(id, length, ids);
  };

  public cStr(id: ITimestampStruct, length: number): StrNode {
    const node = new StrNode(id);
    if (length) node.ingest(length, this.cStrChunk);
    this.doc.index.set(id, node);
    return node;
  }

  private cStrChunk = (): StrChunk => {
    const reader = this.reader;
    const id = this.ts();
    const isTombstone = reader.uint8[reader.x] === 0;
    if (isTombstone) {
      reader.x++;
      const length = reader.vu39();
      return new StrChunk(id, length, '');
    }
    const text: string = this.readAsStr() as string;
    return new StrChunk(id, text.length, text);
  };

  public cBin(id: ITimestampStruct, length: number): BinNode {
    const node = new BinNode(id);
    if (length) node.ingest(length, this.cBinChunk);
    this.doc.index.set(id, node);
    return node;
  }

  private cBinChunk = (): BinChunk => {
    const reader = this.reader;
    const [deleted, length] = reader.b1vu28();
    const id = this.ts();
    if (deleted) return new BinChunk(id, length, undefined);
    else return new BinChunk(id, length, reader.buf(length));
  };
}
