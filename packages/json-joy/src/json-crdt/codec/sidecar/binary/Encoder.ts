import * as nodes from '../../../nodes';
import {ClockEncoder} from '../../../../json-crdt-patch/codec/clock/ClockEncoder';
import {CrdtWriter} from '../../../../json-crdt-patch/util/binary/CrdtWriter';
import {type ITimestampStruct, Timestamp} from '../../../../json-crdt-patch/clock';
import {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';
import {SESSION} from '../../../../json-crdt-patch/constants';
import {CRDT_MAJOR_OVERLAY} from '../../structural/binary/constants';
import {sort} from '@jsonjoy.com/util/lib/sort/insertion';
import {UNDEFINED} from '../../../model/Model';
import type {Model} from '../../../model';

export class Encoder {
  protected clockEncoder: ClockEncoder = new ClockEncoder();
  protected time: number = 0;
  protected doc!: Model;
  protected readonly viewEncoder: CborEncoder<CrdtWriter> = new CborEncoder(new CrdtWriter());
  protected readonly metaEncoder: CborEncoder<CrdtWriter> = new CborEncoder(new CrdtWriter());
  protected index: number = 0;

  public encode(doc: Model<any>): [view: Uint8Array, meta: Uint8Array] {
    this.doc = doc;
    this.index = 0;
    this.metaEncoder.writer.reset();
    this.encodeLogical(doc);
    return [this.viewEncoder.writer.flush(), this.metaEncoder.writer.flush()];
  }

  public encodeLogical(model: Model): void {
    const writer = this.metaEncoder.writer;
    this.clockEncoder.reset(model.clock);
    writer.ensureCapacity(4);
    const x0 = writer.x0;
    const x = writer.x;
    writer.x += 4;
    this.cRoot(model.root);
    this.encodeClockTable(x0, x);
  }

  protected encodeClockTable(x0: number, x: number) {
    const writer = this.metaEncoder.writer;
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
    const writer = this.metaEncoder.writer;
    writer.vu57(clock.sid);
    writer.vu57(clock.time);
  };

  protected readonly ts = (ts: ITimestampStruct): void => {
    const relativeId = this.clockEncoder!.append(ts);
    this.metaEncoder.writer.id(relativeId.sessionIndex, relativeId.timeDiff);
  };

  protected cRoot(root: nodes.RootNode): void {
    const val = root.val;
    if (val.sid === SESSION.SYSTEM) this.metaEncoder.writer.u8(0);
    else this.cNode(root.node());
  }

  protected writeTL(majorOverlay: CRDT_MAJOR_OVERLAY, length: number): void {
    const writer = this.metaEncoder.writer;
    if (length < 24) writer.u8(majorOverlay + length);
    else if (length <= 0xff) writer.u16(((majorOverlay + 24) << 8) + length);
    else if (length <= 0xffff) writer.u8u16(majorOverlay + 25, length);
    else writer.u8u32(majorOverlay + 26, length);
  }

  protected cNode(node: nodes.JsonNode): void {
    // TODO: PERF: use a switch?
    if (node instanceof nodes.ConNode) this.cCon(node);
    else if (node instanceof nodes.ValNode) this.cVal(node);
    else if (node instanceof nodes.StrNode) this.cStr(node);
    else if (node instanceof nodes.ObjNode) this.cObj(node);
    else if (node instanceof nodes.VecNode) this.cVec(node);
    else if (node instanceof nodes.ArrNode) this.cArr(node);
    else if (node instanceof nodes.BinNode) this.cBin(node);
  }

  protected cCon(node: nodes.ConNode): void {
    const val = node.val;
    this.ts(node.id);
    const metaEncoder = this.metaEncoder;
    if (val instanceof Timestamp) {
      this.viewEncoder.writeNull();
      metaEncoder.writer.u8(1); // this.writeTL(CRDT_MAJOR_OVERLAY.CON, 1);
      this.ts(val);
    } else {
      this.viewEncoder.writeAny(val);
      metaEncoder.writer.u8(0); // this.writeTL(CRDT_MAJOR_OVERLAY.CON, 0);
    }
  }

  protected cVal(node: nodes.ValNode): void {
    this.ts(node.id);
    this.metaEncoder.writer.u8(0b00100000); // this.writeTL(CRDT_MAJOR_OVERLAY.VAL, 0);
    this.cNode(node.node());
  }

  protected cObj(node: nodes.ObjNode): void {
    this.ts(node.id);
    const keys = sort([...node.keys.keys()]);
    const size = keys.length;
    this.writeTL(CRDT_MAJOR_OVERLAY.OBJ, size);
    const viewEncoder = this.viewEncoder;
    viewEncoder.writeObjHdr(size);
    for (let i = 0; i < size; i++) {
      const key = keys[i];
      viewEncoder.writeStr(key);
      this.cNode(node.get(key)!);
    }
  }

  protected cVec(node: nodes.VecNode): void {
    this.ts(node.id);
    const elements = node.elements;
    const length = elements.length;
    this.writeTL(CRDT_MAJOR_OVERLAY.VEC, length);
    this.viewEncoder.writeArrHdr(length);
    const index = this.doc.index;
    for (let i = 0; i < length; i++) {
      const elementId = elements[i];
      if (!elementId) this.cCon(UNDEFINED);
      else this.cNode(index.get(elementId)!);
    }
  }

  protected cStr(node: nodes.StrNode): void {
    const ts = this.ts;
    ts(node.id);
    this.writeTL(CRDT_MAJOR_OVERLAY.STR, node.count);
    this.viewEncoder.writeStr(node.view());
    const writer = this.metaEncoder.writer;
    for (let chunk = node.first(); chunk; chunk = node.next(chunk)) {
      ts(chunk.id);
      writer.b1vu56(~~chunk.del as 0 | 1, chunk.span);
    }
  }

  protected cBin(node: nodes.BinNode): void {
    const ts = this.ts;
    ts(node.id);
    this.writeTL(CRDT_MAJOR_OVERLAY.BIN, node.count);
    this.viewEncoder.writeBin(node.view());
    const writer = this.metaEncoder.writer;
    for (let chunk = node.first(); chunk; chunk = node.next(chunk)) {
      ts(chunk.id);
      writer.b1vu56(~~chunk.del as 0 | 1, chunk.span);
    }
  }

  protected cArr(node: nodes.ArrNode): void {
    const ts = this.ts;
    ts(node.id);
    this.writeTL(CRDT_MAJOR_OVERLAY.ARR, node.count);
    this.viewEncoder.writeArrHdr(node.length());
    const writer = this.metaEncoder.writer;
    const index = this.doc.index;
    for (let chunk = node.first(); chunk; chunk = node.next(chunk)) {
      ts(chunk.id);
      const deleted = chunk.del;
      const span = chunk.span;
      writer.b1vu56(~~deleted as 0 | 1, span);
      if (!deleted) {
        const elements = chunk.data!;
        const elementsLength = elements.length;
        for (let i = 0; i < elementsLength; i++) this.cNode(index.get(elements[i])!);
      }
    }
  }
}
