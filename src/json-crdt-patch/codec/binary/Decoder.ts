import {CrdtReader} from '../../util/binary/CrdtReader';
import {
  interval,
  type ITimespanStruct,
  type ITimestampStruct,
  ClockVector,
  ServerClockVector,
  Timestamp,
} from '../../clock';
import type {Patch} from '../../Patch';
import {PatchBuilder} from '../../PatchBuilder';
import {SESSION} from '../../constants';
import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';
import {JsonCrdtPatchOpcode} from '../../constants';

/**
 * JSON CRDT Patch "binary" codec decoder.
 */
export class Decoder extends CborDecoder<CrdtReader> {
  protected builder!: PatchBuilder;
  private patchSid?: number;

  /**
   * Creates a new JSON CRDT patch decoder.
   *
   * @param reader An optional custom implementation of a CRDT decoder.
   */
  constructor(reader: CrdtReader = new CrdtReader()) {
    super(reader);
  }

  /**
   * Decodes a JSON CRDT patch from a binary blob.
   *
   * @param data Binary data to decode.
   * @returns A JSON CRDT patch.
   */
  public decode(data: Uint8Array): Patch {
    this.reader.reset(data);
    return this.readPatch();
  }

  public readPatch(): Patch {
    const reader = this.reader;
    const sid = reader.vu57();
    const time = reader.vu57();
    const isServerClock = sid === SESSION.SERVER;
    const clock = isServerClock ? new ServerClockVector(SESSION.SERVER, time) : new ClockVector(sid, time);
    this.patchSid = clock.sid;
    const builder = (this.builder = new PatchBuilder(clock));
    const map = this.val();
    if (map instanceof Array) builder.patch.meta = map[0];
    this.decodeOperations();
    return builder.patch;
  }

  protected decodeId(): ITimestampStruct {
    const reader = this.reader;
    const [isSessionDifferent, x] = reader.b1vu56();
    return isSessionDifferent ? new Timestamp(reader.vu57(), x) : new Timestamp(this.patchSid!, x);
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
    const opcode = octet >> 3;
    switch (opcode) {
      case JsonCrdtPatchOpcode.new_con: {
        const length = octet & 0b111;
        builder.con(!length ? this.val() : this.decodeId());
        break;
      }
      case JsonCrdtPatchOpcode.new_val: {
        builder.val();
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
        const length = octet & 0b111 || reader.vu57();
        const obj = this.decodeId();
        const tuples: [key: string, value: ITimestampStruct][] = [];
        for (let i = 0; i < length; i++) {
          const key = this.val();
          if (typeof key !== 'string') continue;
          const value = this.decodeId();
          tuples.push([key, value]);
        }
        builder.insObj(obj, tuples);
        break;
      }
      case JsonCrdtPatchOpcode.ins_vec: {
        const length = octet & 0b111 || reader.vu57();
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
        const length = octet & 0b111 || reader.vu57();
        const obj = this.decodeId();
        const after = this.decodeId();
        const str = reader.utf8(length);
        builder.insStr(obj, after, str);
        break;
      }
      case JsonCrdtPatchOpcode.ins_bin: {
        const length = octet & 0b111 || reader.vu57();
        const obj = this.decodeId();
        const after = this.decodeId();
        const buf = reader.buf(length);
        if (!(buf instanceof Uint8Array)) return;
        builder.insBin(obj, after, buf);
        break;
      }
      case JsonCrdtPatchOpcode.ins_arr: {
        const length = octet & 0b111 || reader.vu57();
        const obj = this.decodeId();
        const after = this.decodeId();
        const elements: ITimestampStruct[] = [];
        for (let i = 0; i < length; i++) elements.push(this.decodeId());
        builder.insArr(obj, after, elements);
        break;
      }
      case JsonCrdtPatchOpcode.del: {
        const length = octet & 0b111 || reader.vu57();
        const obj = this.decodeId();
        const what: ITimespanStruct[] = [];
        for (let i = 0; i < length; i++) what.push(this.decodeTss());
        builder.del(obj, what);
        break;
      }
      case JsonCrdtPatchOpcode.nop: {
        const length = octet & 0b111 || reader.vu57();
        builder.nop(length);
        break;
      }
      default: {
        throw new Error('UNKNOWN_OP');
      }
    }
  }
}
