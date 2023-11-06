import {ConNode, RootNode, JsonNode, ValNode, VecNode, ArrNode, BinNode, ObjNode, StrNode} from '../../../nodes';
import {ClockEncoder} from '../../../../json-crdt-patch/codec/clock/ClockEncoder';
import {CrdtWriter} from '../../../../json-crdt-patch/util/binary/CrdtWriter';
import {ITimestampStruct, Timestamp} from '../../../../json-crdt-patch/clock';
import {CborEncoder} from '../../../../json-pack/cbor/CborEncoder';
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

  protected cRoot(root: RootNode): void {
    const val = root.val;
    if (val.sid === SESSION.SYSTEM) this.writer.u8(0);
    else this.cNode(root.node());
  }

  protected writeTL(majorOverlay: CRDT_MAJOR_OVERLAY, length: number): void {
    const writer = this.writer;
    if (length < 24) writer.u8(majorOverlay + length);
    else if (length <= 0xff) writer.u16(((majorOverlay + 24) << 8) + length);
    else if (length <= 0xffff) writer.u8u16(majorOverlay + 25, length);
    else writer.u8u32(majorOverlay + 26, length);
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
      this.writeTL(CRDT_MAJOR_OVERLAY.CON, 1);
      this.ts(val as Timestamp);
    } else {
      this.writeTL(CRDT_MAJOR_OVERLAY.CON, 0);
      this.writeAny(val);
    }
  }

  protected cVal(node: ValNode): void {
    this.ts(node.id);
    this.writeTL(CRDT_MAJOR_OVERLAY.VAL, 0);
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
    const writer = this.writer;
    ts(node.id);
    this.writeTL(CRDT_MAJOR_OVERLAY.STR, node.count);
    for (let chunk = node.first(); chunk; chunk = node.next(chunk)) {
      ts(chunk.id);
      if (chunk.del) {
        writer.u8(0);
        writer.vu39(chunk.span);
      } else this.writeStr(chunk.data!);
    }
  }

  protected cBin(node: BinNode): void {
    const ts = this.ts;
    const writer = this.writer;
    ts(node.id);
    this.writeTL(CRDT_MAJOR_OVERLAY.BIN, node.count);
    for (let chunk = node.first(); chunk; chunk = node.next(chunk)) {
      const length = chunk.span;
      const deleted = chunk.del;
      writer.b1vu28(chunk.del, length);
      ts(chunk.id);
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
      const span = chunk.span;
      const deleted = chunk.del;
      writer.b1vu28(deleted, span);
      ts(chunk.id);
      if (deleted) continue;
      const nodes = chunk.data!;
      for (let i = 0; i < span; i++) this.cNode(index.get(nodes[i])!);
    }
  }
}
