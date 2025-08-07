import {
  ConNode,
  ValNode,
  RootNode,
  ObjNode,
  VecNode,
  StrNode,
  BinNode,
  ArrNode,
  JsonNode
} from '../../../nodes';
import {ClockEncoder} from '../../../../json-crdt-patch/codec/clock/ClockEncoder';
import {CrdtWriter} from '../../../../json-crdt-patch/util/binary/CrdtWriter';
import {type ITimestampStruct, Timestamp} from '../../../../json-crdt-patch/clock';
import {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';
import {SESSION} from '../../../../json-crdt-patch/constants';
import {CRDT_MAJOR_OVERLAY} from './constants';
import type {Model} from '../../../model';

export class Encoder extends CborEncoder<CrdtWriter> {
  protected clockEncoder: ClockEncoder = new ClockEncoder();
  protected time: number = 0;
  protected doc!: Model;

  constructor(writer?: CrdtWriter) {
    super(writer || new CrdtWriter());
  }

  public encode(doc: Model<any>): Uint8Array {
    this.doc = doc;
    const writer = this.writer;
    writer.reset();
    if (doc.clock.sid === SESSION.SERVER) this.encodeServer(doc);
    else this.encodeLogical(doc);
    return writer.flush();
  }

  public encodeLogical(model: Model): void {
    const writer = this.writer;
    this.ts = this.tsLogical;
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
    const writer = this.writer;
    writer.u8(0b10000000);
    writer.vu57((this.time = model.clock.time));
    this.cRoot(model.root);
  }

  protected encodeClockTable(x0: number, x: number) {
    const writer = this.writer;
    const shift = writer.x0 - x0;
    writer.view.setUint32(writer.x0 + (x - x0), writer.x - x - shift - 4);
    const clockEncoder = this.clockEncoder!;
    const table = clockEncoder.table;
    const length = table.size;
    writer.vu57(length);
    table.forEach(this.cTableEntry);
  }

  protected readonly cTableEntry = (entry: {clock: ITimestampStruct}) => {
    const clock = entry.clock;
    const writer = this.writer;
    writer.vu57(clock.sid);
    writer.vu57(clock.time);
  };

  protected readonly tsLogical = (ts: ITimestampStruct): void => {
    const relativeId = this.clockEncoder!.append(ts);
    this.writer.id(relativeId.sessionIndex, relativeId.timeDiff);
  };

  protected readonly tsServer = (ts: ITimestampStruct): void => {
    this.writer.vu57(ts.time);
  };

  protected ts: (ts: ITimestampStruct) => void = this.tsLogical;

  protected cRoot(root: RootNode): void {
    const val = root.val;
    if (val.sid === SESSION.SYSTEM) this.writer.u8(0);
    else this.cNode(root.node());
  }

  protected writeTL(majorOverlay: CRDT_MAJOR_OVERLAY, length: number): void {
    const writer = this.writer;
    if (length < 0b11111) writer.u8(majorOverlay | length);
    else {
      writer.u8(majorOverlay | 0b11111);
      writer.vu57(length);
    }
  }

  protected cNode(node: JsonNode): void {
    // TODO: PERF: use a switch?
    if (node instanceof ConNode) this.cCon(node);
    else if (node instanceof ValNode) this.cVal(node);
    else if (node instanceof StrNode) this.cStr(node);
    else if (node instanceof ObjNode) this.cObj(node);
    else if (node instanceof VecNode) this.cVec(node);
    else if (node instanceof ArrNode) this.cArr(node);
    else if (node instanceof BinNode) this.cBin(node);
  }

  protected cCon(node: ConNode): void {
    const val = node.val;
    this.ts(node.id);
    if (val instanceof Timestamp) {
      this.writer.u8(1); // this.writeTL(CRDT_MAJOR_OVERLAY.CON, 1);
      this.ts(val as Timestamp);
    } else {
      this.writer.u8(0); // this.writeTL(CRDT_MAJOR_OVERLAY.CON, 0);
      this.writeAny(val);
    }
  }

  protected cVal(node: ValNode): void {
    this.ts(node.id);
    this.writer.u8(0b00100000); // this.writeTL(CRDT_MAJOR_OVERLAY.VAL, 0);
    this.cNode(node.node());
  }

  protected cObj(node: ObjNode): void {
    this.ts(node.id);
    const keys = node.keys;
    this.writeTL(CRDT_MAJOR_OVERLAY.OBJ, keys.size);
    keys.forEach(this.cKey);
  }

  protected readonly cKey = (val: ITimestampStruct, key: string) => {
    this.writeStr(key);
    this.cNode(this.doc.index.get(val)!);
  };

  protected cVec(node: VecNode): void {
    const elements = node.elements;
    const length = elements.length;
    this.ts(node.id);
    this.writeTL(CRDT_MAJOR_OVERLAY.VEC, length);
    const index = this.doc.index;
    for (let i = 0; i < length; i++) {
      const elementId = elements[i];
      if (!elementId) this.writer.u8(0);
      else this.cNode(index.get(elementId)!);
    }
  }

  protected cStr(node: StrNode): void {
    const ts = this.ts;
    ts(node.id);
    this.writeTL(CRDT_MAJOR_OVERLAY.STR, node.count);
    for (let chunk = node.first(); chunk; chunk = node.next(chunk)) {
      ts(chunk.id);
      if (chunk.del) this.writeUInteger(chunk.span);
      else this.writeStr(chunk.data!);
    }
  }

  protected cBin(node: BinNode): void {
    const ts = this.ts;
    const writer = this.writer;
    ts(node.id);
    this.writeTL(CRDT_MAJOR_OVERLAY.BIN, node.count);
    for (let chunk = node.first(); chunk; chunk = node.next(chunk)) {
      ts(chunk.id);
      const length = chunk.span;
      const deleted = chunk.del;
      writer.b1vu56(~~deleted as 0 | 1, length);
      if (deleted) continue;
      writer.buf(chunk.data!, length);
    }
  }

  protected cArr(node: ArrNode): void {
    const ts = this.ts;
    const writer = this.writer;
    ts(node.id);
    this.writeTL(CRDT_MAJOR_OVERLAY.ARR, node.count);
    const index = this.doc.index;
    for (let chunk = node.first(); chunk; chunk = node.next(chunk)) {
      ts(chunk.id);
      const span = chunk.span;
      const deleted = chunk.del;
      writer.b1vu56(~~deleted as 0 | 1, span);
      if (deleted) continue;
      const nodes = chunk.data!;
      for (let i = 0; i < span; i++) this.cNode(index.get(nodes[i])!);
    }
  }
}
