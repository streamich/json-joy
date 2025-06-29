import * as operations from '../../operations';
import {JsonCrdtPatchOpcodeOverlay} from '../../constants';
import {CrdtWriter} from '../../util/binary/CrdtWriter';
import {type ITimespanStruct, type ITimestampStruct, Timestamp} from '../../clock';
import {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';
import type {JsonCrdtPatchOperation, Patch} from '../../Patch';

/**
 * JSON CRDT Patch "binary" codec encoder.
 */
export class Encoder extends CborEncoder<CrdtWriter> {
  private patchSid: number = 0;

  /**
   * Creates a new encoder instance.
   *
   * @param writer An optional custom implementation of CRDT writer.
   */
  constructor(public readonly writer: CrdtWriter = new CrdtWriter()) {
    super(writer);
  }

  /**
   * Encodes a JSON CRDT Patch into a {@link Uint8Array} blob.
   *
   * @param patch A JSON CRDT Patch to encode.
   * @returns A {@link Uint8Array} blob containing the encoded JSON CRDT Patch.
   */
  public encode(patch: Patch): Uint8Array {
    this.writer.reset();
    const id = patch.getId()!;
    const sid = (this.patchSid = id.sid);
    const writer = this.writer;
    writer.vu57(sid);
    writer.vu57(id.time);
    const meta = patch.meta;
    if (meta === undefined) this.writeUndef();
    else this.writeArr([meta]);
    this.encodeOperations(patch);
    return writer.flush();
  }

  protected encodeOperations(patch: Patch): void {
    const ops = patch.ops;
    const length = ops.length;
    this.writer.vu57(length);
    for (let i = 0; i < length; i++) this.encodeOperation(ops[i]);
  }

  protected encodeId(id: ITimestampStruct) {
    const sessionId = id.sid;
    const time = id.time;
    const writer = this.writer;
    if (sessionId === this.patchSid) {
      writer.b1vu56(0, time);
    } else {
      writer.b1vu56(1, time);
      writer.vu57(sessionId);
    }
  }

  protected encodeTss(span: ITimespanStruct): void {
    this.encodeId(span);
    this.writer.vu57(span.span);
  }

  private writeInsStr(length: number, obj: ITimestampStruct, ref: ITimestampStruct, str: string): number {
    const writer = this.writer;
    if (length <= 0b111) {
      writer.u8(JsonCrdtPatchOpcodeOverlay.ins_str + length);
    } else {
      writer.u8(JsonCrdtPatchOpcodeOverlay.ins_str);
      writer.vu57(length);
    }
    this.encodeId(obj);
    this.encodeId(ref);
    return writer.utf8(str);
  }

  protected encodeOperation(op: JsonCrdtPatchOperation): void {
    const writer = this.writer;
    const constr = op.constructor;
    switch (constr) {
      case operations.NewConOp: {
        const operation = <operations.NewConOp>op;
        const val = operation.val;
        if (val instanceof Timestamp) {
          writer.u8(JsonCrdtPatchOpcodeOverlay.new_con + 1);
          this.encodeId(val);
        } else {
          writer.u8(JsonCrdtPatchOpcodeOverlay.new_con);
          this.writeAny(val);
        }
        break;
      }
      case operations.NewValOp: {
        writer.u8(JsonCrdtPatchOpcodeOverlay.new_val);
        break;
      }
      case operations.NewObjOp: {
        writer.u8(JsonCrdtPatchOpcodeOverlay.new_obj);
        break;
      }
      case operations.NewVecOp: {
        writer.u8(JsonCrdtPatchOpcodeOverlay.new_vec);
        break;
      }
      case operations.NewStrOp: {
        writer.u8(JsonCrdtPatchOpcodeOverlay.new_str);
        break;
      }
      case operations.NewBinOp: {
        writer.u8(JsonCrdtPatchOpcodeOverlay.new_bin);
        break;
      }
      case operations.NewArrOp: {
        writer.u8(JsonCrdtPatchOpcodeOverlay.new_arr);
        break;
      }
      case operations.InsValOp: {
        const operation = <operations.InsValOp>op;
        writer.u8(JsonCrdtPatchOpcodeOverlay.ins_val);
        this.encodeId(operation.obj);
        this.encodeId(operation.val);
        break;
      }
      case operations.InsObjOp: {
        const operation = <operations.InsObjOp>op;
        const data = operation.data;
        const length = data.length;
        if (length <= 0b111) {
          writer.u8(JsonCrdtPatchOpcodeOverlay.ins_obj + length);
        } else {
          writer.u8(JsonCrdtPatchOpcodeOverlay.ins_obj);
          writer.vu57(length);
        }
        this.encodeId(operation.obj);
        for (let i = 0; i < length; i++) {
          const tuple = data[i];
          this.writeStr(tuple[0]);
          this.encodeId(tuple[1]);
        }
        break;
      }
      case operations.InsVecOp: {
        const operation = <operations.InsVecOp>op;
        const data = operation.data;
        const length = data.length;
        if (length <= 0b111) {
          writer.u8(JsonCrdtPatchOpcodeOverlay.ins_vec + length);
        } else {
          writer.u8(JsonCrdtPatchOpcodeOverlay.ins_vec);
          writer.vu57(length);
        }
        this.encodeId(operation.obj);
        for (let i = 0; i < length; i++) {
          const tuple = data[i];
          writer.u8(tuple[0]);
          this.encodeId(tuple[1]);
        }
        break;
      }
      case operations.InsStrOp: {
        const operation = <operations.InsStrOp>op;
        const obj = operation.obj;
        const ref = operation.ref;
        const str = operation.data;
        const len1 = str.length;
        writer.ensureCapacity(24 + len1 * 4);
        const x = writer.x;
        const len2 = this.writeInsStr(len1, obj, ref, str);
        if (len1 !== len2) {
          writer.x = x;
          this.writeInsStr(len2, obj, ref, str);
        }
        break;
      }
      case operations.InsBinOp: {
        const operation = <operations.InsBinOp>op;
        const buf = operation.data;
        const length = buf.length;
        if (length <= 0b111) {
          writer.u8(JsonCrdtPatchOpcodeOverlay.ins_bin + length);
        } else {
          writer.u8(JsonCrdtPatchOpcodeOverlay.ins_bin);
          writer.vu57(length);
        }
        this.encodeId(operation.obj);
        this.encodeId(operation.ref);
        writer.buf(buf, length);
        break;
      }
      case operations.InsArrOp: {
        const operation = <operations.InsArrOp>op;
        const elements = operation.data;
        const length = elements.length;
        if (length <= 0b111) {
          writer.u8(JsonCrdtPatchOpcodeOverlay.ins_arr + length);
        } else {
          writer.u8(JsonCrdtPatchOpcodeOverlay.ins_arr);
          writer.vu57(length);
        }
        this.encodeId(operation.obj);
        this.encodeId(operation.ref);
        for (let i = 0; i < length; i++) this.encodeId(elements[i]);
        break;
      }
      case operations.UpdArrOp: {
        const operation = <operations.UpdArrOp>op;
        writer.u8(JsonCrdtPatchOpcodeOverlay.upd_arr);
        this.encodeId(operation.obj);
        this.encodeId(operation.ref);
        this.encodeId(operation.val);
        break;
      }
      case operations.DelOp: {
        const operation = <operations.DelOp>op;
        const what = operation.what;
        const length = what.length;
        if (length <= 0b111) {
          writer.u8(JsonCrdtPatchOpcodeOverlay.del + length);
        } else {
          writer.u8(JsonCrdtPatchOpcodeOverlay.del);
          writer.vu57(length);
        }
        this.encodeId(operation.obj);
        for (let i = 0; i < length; i++) this.encodeTss(what[i]);
        break;
      }
      case operations.NopOp: {
        const operation = <operations.NopOp>op;
        const length = operation.len;
        if (length <= 0b111) {
          writer.u8(JsonCrdtPatchOpcodeOverlay.nop + length);
        } else {
          writer.u8(JsonCrdtPatchOpcodeOverlay.nop);
          writer.vu57(length);
        }
        break;
      }
      default: {
        throw new Error('UNKNOWN_OP');
      }
    }
  }
}
