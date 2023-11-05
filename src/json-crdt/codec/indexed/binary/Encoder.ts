import {ITimestampStruct, Timestamp} from '../../../../json-crdt-patch/clock';
import {ClockTable} from '../../../../json-crdt-patch/codec/clock/ClockTable';
import {CrdtWriter} from '../../../../json-crdt-patch/util/binary/CrdtEncoder';
import {MsgPackEncoder} from '../../../../json-pack/msgpack';
import {Model} from '../../../model';
import {JsonNode} from '../../../types';
import {ConNode} from '../../../types/con/Const';
import {ObjectLww} from '../../../types/lww-object/ObjectLww';
import {ValueLww} from '../../../types/lww-value/ValueLww';
import {ArrayRga} from '../../../types/rga-array/ArrayRga';
import {BinaryRga} from '../../../types/rga-binary/BinaryRga';
import {StringRga} from '../../../types/rga-string/StringRga';
import {IndexedFields, FieldName} from './types';

const EMPTY = new Uint8Array(0);

export class Encoder {
  protected clockTable?: ClockTable;
  public readonly enc = new MsgPackEncoder(new CrdtWriter());
  protected model?: IndexedFields;

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
    if (node instanceof ValueLww) return this.encodeVal(node);
    else if (node instanceof ConNode) return this.encodeConst(node);
    else if (node instanceof StringRga) return this.encodeStr(node);
    else if (node instanceof ObjectLww) return this.encodeObj(node);
    else if (node instanceof ArrayRga) return this.encodeArr(node);
    else if (node instanceof BinaryRga) return this.encodeBin(node);
    else return EMPTY;
  }

  protected ts(id: ITimestampStruct): void {
    const index = this.clockTable!.getBySid(id.sid).index;
    this.enc.writer.id(index, id.time);
  }

  public encodeVal(node: ValueLww): Uint8Array {
    const writer = this.enc.writer;
    const child = node.node();
    writer.reset();
    writer.u8(0xd6);
    this.ts(child.id);
    return writer.flush();
  }

  public encodeConst(node: ConNode): Uint8Array {
    const encoder = this.enc;
    const writer = encoder.writer;
    const val = node.val;
    writer.reset();
    if (val instanceof Timestamp) {
      writer.u8(0xd5);
      this.ts(val);
    } else {
      writer.u8(0xd4);
      encoder.writeAny(node.val);
    }
    return writer.flush();
  }

  public encodeStr(node: StringRga): Uint8Array {
    const encoder = this.enc;
    const writer = encoder.writer;
    writer.reset();
    encoder.writeStrHdr(node.size());
    for (let chunk = node.first(); chunk; chunk = node.next(chunk)) {
      this.ts(chunk.id);
      if (chunk.del) encoder.u32(chunk.span);
      else encoder.encodeString(chunk.data!);
    }
    return writer.flush();
  }

  public encodeBin(node: BinaryRga): Uint8Array {
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

  public encodeObj(node: ObjectLww): Uint8Array {
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

  public encodeArr(node: ArrayRga): Uint8Array {
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
