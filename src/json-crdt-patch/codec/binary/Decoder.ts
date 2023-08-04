import {CrdtDecoder} from '../../util/binary/CrdtDecoder';
import {interval, ITimespanStruct, ITimestampStruct, VectorClock, ServerVectorClock, Timestamp} from '../../clock';
import {Patch} from '../../Patch';
import {PatchBuilder} from '../../PatchBuilder';
import {SESSION} from '../../constants';
import {CborDecoder} from '../../../json-pack/cbor/CborDecoder';
import {JsonCrdtPatchOpcode} from '../../constants';

/**
 * JSON CRDT Patch "binary" codec decoder.
 */
export class Decoder extends CborDecoder<CrdtDecoder> {
  protected builder!: PatchBuilder;
  private patchSid?: number;

  /**
   * Creates a new JSON CRDT patch decoder.
   *
   * @param reader An optional custom implementation of a CRDT decoder.
   */
  constructor(reader: CrdtDecoder = new CrdtDecoder()) {
    super(reader);
  }

  /**
   * Decodes a JSON CRDT patch from a binary blob.
   *
   * @param data Binary data to decode.
   * @returns A JSON CRDT patch.
   */
  public decode(data: Uint8Array): Patch {
    const reader = this.reader;
    reader.reset(data);
    const sid = reader.vu57();
    const time = reader.vu57();
    const isServerClock = sid === SESSION.SERVER;
    const clock = isServerClock ? new ServerVectorClock(SESSION.SERVER, time) : new VectorClock(sid, time);
    this.patchSid = clock.sid;
    const builder = (this.builder = new PatchBuilder(clock));
    const map = this.val();
    if (map instanceof Array) builder.patch.meta = map[0];
    this.decodeOperations();
    return builder.patch;
  }

  protected decodeId(): ITimestampStruct {
    const reader = this.reader;
    const [isRelativeTime, x] = reader.b1vu56();
    return isRelativeTime ? new Timestamp(this.patchSid!, x) : new Timestamp(x, reader.vu57());
  }

  protected decodeTss(): ITimespanStruct {
    const id = this.decodeId();
    const span = this.reader.vu57();
    return interval(id, 0, span);
  }

  protected decodeOperations(): void {
    const reader = this.reader;
    const length = reader.vu57();
    for (let i = 0; i < length; i++) this.decodeOperation();
  }

  protected decodeOperation(): void {
    const builder = this.builder;
    const reader = this.reader;
    const octet = reader.u8();
    const opcode = octet & 0b11111;
    switch (opcode) {
      case JsonCrdtPatchOpcode.new_con: {
        const length = octet >> 5;
        builder.const(length === 0 ? this.val() : this.decodeId());
        break;
      }
      case JsonCrdtPatchOpcode.new_val: {
        builder.val(this.decodeId());
        break;
      }
      case JsonCrdtPatchOpcode.new_obj: {
        builder.obj();
        break;
      }
      case JsonCrdtPatchOpcode.new_vec: {
        builder.vec();
        break;
      }
      case JsonCrdtPatchOpcode.new_str: {
        builder.str();
        break;
      }
      case JsonCrdtPatchOpcode.new_bin: {
        builder.bin();
        break;
      }
      case JsonCrdtPatchOpcode.new_arr: {
        builder.arr();
        break;
      }
      case JsonCrdtPatchOpcode.ins_val: {
        const obj = this.decodeId();
        const val = this.decodeId();
        builder.setVal(obj, val);
        break;
      }
      case JsonCrdtPatchOpcode.ins_obj: {
        let length = octet >> 5;
        if (length === 0) length = reader.vu57();
        const obj = this.decodeId();
        const tuples: [key: string, value: ITimestampStruct][] = [];
        for (let i = 0; i < length; i++) {
          const key = this.val();
          if (typeof key !== 'string') continue;
          const value = this.decodeId();
          tuples.push([key, value]);
        }
        builder.setKeys(obj, tuples);
        break;
      }
      case JsonCrdtPatchOpcode.ins_vec: {
        let length = octet >> 5;
        if (length === 0) length = reader.vu57();
        const obj = this.decodeId();
        const tuples: [index: number, value: ITimestampStruct][] = [];
        for (let i = 0; i < length; i++) {
          const index = this.val();
          if (typeof index !== 'number') continue;
          const value = this.decodeId();
          tuples.push([index, value]);
        }
        builder.insVec(obj, tuples);
        break;
      }
      case JsonCrdtPatchOpcode.ins_str: {
        let length = octet >> 5;
        if (length === 0) length = reader.vu57();
        const obj = this.decodeId();
        const after = this.decodeId();
        const str = reader.utf8(length);
        builder.insStr(obj, after, str);
        break;
      }
      case JsonCrdtPatchOpcode.ins_bin: {
        let length = octet >> 5;
        if (length === 0) length = reader.vu57();
        const obj = this.decodeId();
        const after = this.decodeId();
        const buf = reader.buf(length);
        if (!(buf instanceof Uint8Array)) return;
        builder.insBin(obj, after, buf);
        break;
      }
      case JsonCrdtPatchOpcode.ins_arr: {
        let length = octet >> 5;
        if (length === 0) length = reader.vu57();
        const obj = this.decodeId();
        const after = this.decodeId();
        const elements: ITimestampStruct[] = [];
        for (let i = 0; i < length; i++) elements.push(this.decodeId());
        builder.insArr(obj, after, elements);
        break;
      }
      case JsonCrdtPatchOpcode.del: {
        let length = octet >> 5;
        if (length === 0) length = reader.vu57();
        const obj = this.decodeId();
        const what: ITimespanStruct[] = [];
        for (let i = 0; i < length; i++) what.push(this.decodeTss());
        builder.del(obj, what);
        break;
      }
      case JsonCrdtPatchOpcode.nop: {
        let length = octet >> 5;
        if (length === 0) length = reader.vu57();
        builder.nop(length);
        break;
      }
      default: {
        throw new Error('UNKNOWN_OP');
      }
    }
  }
}
