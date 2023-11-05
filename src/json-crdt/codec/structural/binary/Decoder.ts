import {ClockDecoder} from '../../../../json-crdt-patch/codec/clock/ClockDecoder';
import {CrdtReader} from '../../../../json-crdt-patch/util/binary/CrdtDecoder';
import {ITimestampStruct, Timestamp} from '../../../../json-crdt-patch/clock';
import {Model, UNDEFINED} from '../../../model/Model';
import {MsgPackDecoderFast} from '../../../../json-pack/msgpack';
import {SESSION} from '../../../../json-crdt-patch/constants';
import {
  ArrayRga,
  ArrayChunk,
  BinaryRga,
  BinaryChunk,
  ConNode,
  ObjNode,
  RootLww,
  StrNode,
  StrChunk,
  ValNode,
  VecNode,
  type JsonNode,
} from '../../../nodes';

export class Decoder extends MsgPackDecoderFast<CrdtReader> {
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
    this.doc.root = new RootLww(this.doc, this.cRoot().id);
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

  public cNode(): JsonNode {
    const reader = this.reader;
    const id = this.ts();
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
        case 0xd4: {
          const obj = new ConNode(id, this.val());
          this.doc.index.set(id, obj);
          return obj;
        }
        case 0xd5: {
          const obj = new ConNode(id, this.ts());
          this.doc.index.set(id, obj);
          return obj;
        }
        case 0xd6: {
          const val = this.cNode();
          const obj = new ValNode(this.doc, id, val.id);
          this.doc.index.set(id, obj);
          return obj;
        }
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
        case 0xc7:
          return this.cTup(id);
      }
    }
    throw new Error('UNKNOWN_NODE');
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

  public cTup(id: ITimestampStruct): VecNode {
    const reader = this.reader;
    const length = this.reader.u8();
    reader.x++;
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

  public cArr(id: ITimestampStruct, length: number): ArrayRga {
    const obj = new ArrayRga(this.doc, id);
    obj.ingest(length, this.cArrChunk);
    this.doc.index.set(id, obj);
    return obj;
  }

  private readonly cArrChunk = (): ArrayChunk => {
    const [deleted, length] = this.reader.b1vu28();
    const id = this.ts();
    if (deleted) return new ArrayChunk(id, length, undefined);
    const ids: ITimestampStruct[] = [];
    for (let i = 0; i < length; i++) ids.push(this.cNode().id);
    return new ArrayChunk(id, length, ids);
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
    const text: string = this.str() as string;
    return new StrChunk(id, text.length, text);
  };

  public cBin(id: ITimestampStruct, length: number): BinaryRga {
    const node = new BinaryRga(id);
    if (length) node.ingest(length, this.cBinChunk);
    this.doc.index.set(id, node);
    return node;
  }

  private cBinChunk = (): BinaryChunk => {
    const reader = this.reader;
    const [deleted, length] = reader.b1vu28();
    const id = this.ts();
    if (deleted) return new BinaryChunk(id, length, undefined);
    else return new BinaryChunk(id, length, reader.buf(length));
  };
}
