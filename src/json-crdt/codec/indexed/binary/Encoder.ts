import {ITimestampStruct, Timestamp} from '../../../../json-crdt-patch/clock';
import {ClockTable} from '../../../../json-crdt-patch/codec/clock/ClockTable';
import {CrdtWriter} from '../../../../json-crdt-patch/util/binary/CrdtWriter';
import {CborEncoder} from '../../../../json-pack/cbor/CborEncoder';
import {Model} from '../../../model';
import {ConNode, JsonNode, ValNode, ArrNode, BinNode, ObjNode, StrNode} from '../../../nodes';
import {CRDT_MAJOR_OVERLAY} from '../../structural/binary/constants';
import {IndexedFields, FieldName} from './types';

const EMPTY = new Uint8Array(0);

export class Encoder {
  public readonly enc: CborEncoder<CrdtWriter>;
  protected clockTable?: ClockTable;
  protected model?: IndexedFields;

  constructor(writer?: CrdtWriter) {
    this.enc = new CborEncoder<CrdtWriter>(writer || new CrdtWriter());
  }

  public encode(doc: Model, clockTable: ClockTable = ClockTable.from(doc.clock)): IndexedFields {
    this.clockTable = clockTable;
    const writer = this.enc.writer;
    writer.reset();
    clockTable.write(writer);
    const encodedClock = writer.flush();
    const rootValueId = doc.root.val;
    const model: IndexedFields = (this.model = {
      c: encodedClock,
    });
    if (rootValueId.sid !== 0) {
      writer.reset();
      this.ts(rootValueId);
      model.r = writer.flush();
    }
    doc.index.forEach(({v: node}) => this.onNode(node));
    return model;
  }

  protected readonly onNode = (node: JsonNode) => {
    const id = node.id;
    const sid = id.sid;
    const time = id.time;
    const model = this.model!;
    const sidIndex = this.clockTable!.getBySid(sid).index;
    const sidFieldPart = sidIndex.toString(36) + '_';
    const field = (sidFieldPart + time.toString(36)) as FieldName;
    model[field] = this.encodeNode(node);
  };

  public encodeNode(node: JsonNode): Uint8Array {
    if (node instanceof ValNode) return this.encodeVal(node);
    else if (node instanceof ConNode) return this.encodeCon(node);
    else if (node instanceof StrNode) return this.encodeStr(node);
    else if (node instanceof ObjNode) return this.encodeObj(node);
    else if (node instanceof ArrNode) return this.encodeArr(node);
    else if (node instanceof BinNode) return this.encodeBin(node);
    else return EMPTY;
  }

  protected ts(id: ITimestampStruct): void {
    const index = this.clockTable!.getBySid(id.sid).index;
    this.enc.writer.id(index, id.time);
  }

  protected writeTL(majorOverlay: CRDT_MAJOR_OVERLAY, length: number): void {
    const writer = this.enc.writer;
    if (length < 24) writer.u8(majorOverlay + length);
    else if (length <= 0xff) writer.u16(((majorOverlay + 24) << 8) + length);
    else if (length <= 0xffff) writer.u8u16(majorOverlay + 25, length);
    else writer.u8u32(majorOverlay + 26, length);
  }

  public encodeCon(node: ConNode): Uint8Array {
    const encoder = this.enc;
    const writer = encoder.writer;
    const val = node.val;
    writer.reset();
    if (val instanceof Timestamp) {
      this.writeTL(CRDT_MAJOR_OVERLAY.CON, 1);
      this.ts(val as Timestamp);
    } else {
      this.writeTL(CRDT_MAJOR_OVERLAY.CON, 0);
      encoder.writeAny(val);
    }
    return writer.flush();
  }

  public encodeVal(node: ValNode): Uint8Array {
    const writer = this.enc.writer;
    const child = node.node();
    writer.reset();
    this.writeTL(CRDT_MAJOR_OVERLAY.VAL, 0);
    this.ts(child.id);
    return writer.flush();
  }

  public encodeStr(node: StrNode): Uint8Array {
    throw new Error('TODO');
    // const encoder = this.enc;
    // const writer = encoder.writer;
    // writer.reset();
    // encoder.writeStrHdr(node.size());
    // for (let chunk = node.first(); chunk; chunk = node.next(chunk)) {
    //   this.ts(chunk.id);
    //   if (chunk.del) encoder.u32(chunk.span);
    //   else encoder.encodeString(chunk.data!);
    // }
    // return writer.flush();
  }

  public encodeBin(node: BinNode): Uint8Array {
    const encoder = this.enc;
    const writer = encoder.writer;
    writer.reset();
    encoder.writeBinHdr(node.size());
    for (let chunk = node.first(); chunk; chunk = node.next(chunk)) {
      this.ts(chunk.id);
      const deleted = chunk.del;
      const length = chunk.span;
      writer.b1vu28(deleted, length);
      if (deleted) continue;
      writer.buf(chunk.data!, length);
    }
    return writer.flush();
  }

  public encodeObj(node: ObjNode): Uint8Array {
    const encoder = this.enc;
    const writer = encoder.writer;
    writer.reset();
    encoder.writeObjHdr(node.keys.size);
    node.keys.forEach(this.onObjectKey);
    return writer.flush();
  }

  protected readonly onObjectKey = (value: ITimestampStruct, key: string) => {
    this.enc.writeStr(key);
    this.ts(value);
  };

  public encodeArr(node: ArrNode): Uint8Array {
    const encoder = this.enc;
    const writer = encoder.writer;
    writer.reset();
    encoder.writeArrHdr(node.size());
    for (let chunk = node.first(); chunk; chunk = node.next(chunk)) {
      const length = chunk.span;
      const deleted = chunk.del;
      this.ts(chunk.id);
      writer.b1vu28(deleted, length);
      if (deleted) continue;
      const data = chunk.data!;
      for (let i = 0; i < length; i++) this.ts(data[i]);
    }
    return writer.flush();
  }
}
