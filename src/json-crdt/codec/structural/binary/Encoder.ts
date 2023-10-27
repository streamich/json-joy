import {ArrayRga} from '../../../types/rga-array/ArrayRga';
import {BinaryRga} from '../../../types/rga-binary/BinaryRga';
import {ClockEncoder} from '../../../../json-crdt-patch/codec/clock/ClockEncoder';
import {Const} from '../../../types/const/Const';
import {CrdtWriter} from '../../../../json-crdt-patch/util/binary/CrdtEncoder';
import {ITimestampStruct, Timestamp} from '../../../../json-crdt-patch/clock';
import {JsonNode} from '../../../types';
import {MsgPackEncoder} from '../../../../json-pack/msgpack';
import {ObjectLww} from '../../../types/lww-object/ObjectLww';
import {RootLww} from '../../../types/lww-root/RootLww';
import {SESSION} from '../../../../json-crdt-patch/constants';
import {StringRga} from '../../../types/rga-string/StringRga';
import {ValueLww} from '../../../types/lww-value/ValueLww';
import {ArrayLww} from '../../../types/lww-array/ArrayLww';
import type {Model} from '../../../model';

export class Encoder extends MsgPackEncoder<CrdtWriter> {
  protected clockEncoder: ClockEncoder = new ClockEncoder();
  protected time: number = 0;
  protected doc!: Model;

  constructor() {
    super(new CrdtWriter());
  }

  public encode(doc: Model<any>): Uint8Array {
    this.doc = doc;
    this.writer.reset();
    if (doc.clock.sid === SESSION.SERVER) this.encodeServer(doc);
    else this.encodeLogical(doc);
    return this.writer.flush();
  }

  public encodeLogical(model: Model): void {
    const writer = this.writer;
    this.ts = this.tsLogical;
    writer.u8(1);
    this.clockEncoder.reset(model.clock);
    writer.ensureCapacity(4);
    const x0 = writer.x0;
    const x = writer.x;
    writer.x += 4;
    this.cRoot(model.root);
    this.encodeClockTable(x0, x);
  }

  public encodeServer(model: Model): void {
    this.ts = this.tsServer;
    this.writer.u8(0);
    this.writer.vu57((this.time = model.clock.time));
    this.cRoot(model.root);
  }

  protected encodeClockTable(x0: number, x: number) {
    const writer = this.writer;
    const shift = writer.x0 - x0;
    writer.view.setUint32(writer.x0 + (x - x0), writer.x - x - shift - 4);
    const clockEncoder = this.clockEncoder!;
    const table = clockEncoder.table;
    const length = table.size;
    writer.vu39(length);
    table.forEach(this.cTableEntry);
  }

  protected readonly cTableEntry = (entry: {clock: ITimestampStruct}) => {
    const clock = entry.clock;
    this.writer.u53vu39(clock.sid, clock.time);
  };

  protected readonly tsLogical = (ts: ITimestampStruct): void => {
    const relativeId = this.clockEncoder!.append(ts);
    this.writer.id(relativeId.sessionIndex, relativeId.timeDiff);
  };

  protected readonly tsServer = (ts: ITimestampStruct): void => {
    this.writer.vu57(ts.time);
  };

  protected ts: (ts: ITimestampStruct) => void = this.tsLogical;

  protected cRoot(root: RootLww): void {
    const val = root.val;
    if (val.sid === SESSION.SYSTEM) this.writer.u8(0);
    else this.cNode(root.node());
  }

  protected cNode(node: JsonNode): void {
    // TODO: PERF: use a switch
    if (node instanceof Const) this.cConst(node);
    else if (node instanceof ValueLww) this.cVal(node);
    else if (node instanceof StringRga) this.cStr(node);
    else if (node instanceof ObjectLww) this.cObj(node);
    else if (node instanceof ArrayLww) this.cTup(node);
    else if (node instanceof ArrayRga) this.cArr(node);
    else if (node instanceof BinaryRga) this.cBin(node);
  }

  protected cObj(obj: ObjectLww): void {
    this.ts(obj.id);
    this.writeObjHdr(obj.keys.size);
    obj.keys.forEach(this.cKey);
  }

  protected readonly cKey = (val: ITimestampStruct, key: string) => {
    this.writeStr(key);
    this.cNode(this.doc.index.get(val)!);
  };

  protected cTup(obj: ArrayLww): void {
    this.ts(obj.id);
    const elements = obj.elements;
    const length = elements.length;
    const writer = this.writer;
    writer.u8u16(0xc7, length << 8);
    const index = this.doc.index;
    for (let i = 0; i < length; i++) {
      const elementId = elements[i];
      if (!elementId) this.writer.u8(0);
      else this.cNode(index.get(elementId)!);
    }
  }

  protected cArr(obj: ArrayRga): void {
    const ts = this.ts;
    const writer = this.writer;
    ts(obj.id);
    this.writeArrHdr(obj.size());
    const index = this.doc.index;
    for (let chunk = obj.first(); chunk; chunk = obj.next(chunk)) {
      const span = chunk.span;
      const deleted = chunk.del;
      writer.b1vu28(deleted, span);
      ts(chunk.id);
      if (deleted) continue;
      const nodes = chunk.data!;
      for (let i = 0; i < span; i++) this.cNode(index.get(nodes[i])!);
    }
  }

  protected cStr(obj: StringRga): void {
    const ts = this.ts;
    const writer = this.writer;
    ts(obj.id);
    const length = obj.size();
    this.writeStrHdr(length);
    for (let chunk = obj.first(); chunk; chunk = obj.next(chunk)) {
      ts(chunk.id);
      if (chunk.del) {
        writer.u8(0);
        writer.vu39(chunk.span);
      } else this.encodeString(chunk.data!);
    }
  }

  protected cBin(obj: BinaryRga): void {
    const ts = this.ts;
    const writer = this.writer;
    ts(obj.id);
    const length = obj.size();
    this.writeBinHdr(length);
    for (let chunk = obj.first(); chunk; chunk = obj.next(chunk)) {
      const length = chunk.span;
      const deleted = chunk.del;
      writer.b1vu28(chunk.del, length);
      ts(chunk.id);
      if (deleted) continue;
      writer.buf(chunk.data!, length);
    }
  }

  protected cVal(obj: ValueLww): void {
    this.ts(obj.id);
    this.writer.u8(0xd6);
    this.cNode(obj.node());
  }

  protected cConst(obj: Const): void {
    this.ts(obj.id);
    const val = obj.val;
    if (val instanceof Timestamp) {
      this.writer.u8(0xd5);
      this.ts(val as Timestamp);
    } else {
      this.writer.u8(0xd4);
      this.writeAny(val);
    }
  }
}
