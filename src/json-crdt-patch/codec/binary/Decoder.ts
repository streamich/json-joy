import {CrdtDecoder} from '../../util/binary/CrdtDecoder';
import {interval, ITimespanStruct, ITimestampStruct, VectorClock, ServerVectorClock, ts} from '../../clock';
import {Patch} from '../../Patch';
import {PatchBuilder} from '../../PatchBuilder';
import {SESSION} from '../../constants';
import {CborDecoder} from '../../../json-pack/cbor/CborDecoder';
import {JsonCrdtPatchOpcode} from '../../constants';

export class Decoder extends CborDecoder<CrdtDecoder> {
  protected builder!: PatchBuilder;
  private patchId!: ITimestampStruct;

  constructor() {
    super(new CrdtDecoder());
  }

  public decode(data: Uint8Array): Patch {
    const reader = this.reader;
    reader.reset(data);
    const [isServerClock, x] = reader.b1vu56();
    const clock = isServerClock ? new ServerVectorClock(SESSION.SERVER, x) : new VectorClock(x, reader.vu57());
    this.patchId = ts(clock.sid, clock.time);
    this.builder = new PatchBuilder(clock);
    const map = this.val();
    if (map instanceof Array) this.builder.patch.meta = map[0];
    this.decodeOperations();
    return this.builder.patch;
  }

  protected decodeId(): ITimestampStruct {
    const reader = this.reader;
    const [isServerClock, x] = reader.b1vu56();
    if (isServerClock) {
      return ts(SESSION.SERVER, x);
    } else {
      const patchId = this.patchId;
      if (x === 1) {
        const delta = reader.vu57();
        return ts(patchId.sid, patchId.time + delta);
      } else {
        const time = reader.vu57();
        return ts(x, time);
      }
    }
  }

  protected decodeTss(): ITimespanStruct {
    const id = this.decodeId();
    const span = this.reader.vu57();
    return interval(id, 0, span);
  }

  public decodeOperations(): void {
    const reader = this.reader;
    while (reader.x < reader.uint8.length) this.decodeOperation();
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
