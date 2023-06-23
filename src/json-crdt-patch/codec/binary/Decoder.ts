import {Code} from '../compact/constants';
import {CrdtDecoder} from '../../util/binary/CrdtDecoder';
import {interval, ITimespanStruct, ITimestampStruct, VectorClock, ServerVectorClock, ts} from '../../clock';
import {Patch} from '../../Patch';
import {PatchBuilder} from '../../PatchBuilder';
import {SESSION} from '../../constants';
import {MsgPackDecoderFast} from '../../../json-pack/msgpack';

export class Decoder extends MsgPackDecoderFast<CrdtDecoder> {
  protected builder!: PatchBuilder;
  private patchId!: ITimestampStruct;

  constructor() {
    super(new CrdtDecoder());
  }

  public decode(data: Uint8Array): Patch {
    this.reader.reset(data);
    const [isServerClock, x] = this.reader.b1vu56();
    const clock = isServerClock ? new ServerVectorClock(SESSION.SERVER, x) : new VectorClock(x, this.reader.vu57());
    this.patchId = ts(clock.sid, clock.time);
    this.builder = new PatchBuilder(clock);
    this.decodeOperations();
    return this.builder.patch;
  }

  protected decodeId(): ITimestampStruct {
    const [isServerClock, x] = this.reader.b1vu56();
    if (isServerClock) {
      return ts(SESSION.SERVER, x);
    } else {
      const patchId = this.patchId;
      if (x === 1) {
        const delta = this.reader.vu57();
        return ts(patchId.sid, patchId.time + delta);
      } else {
        const time = this.reader.vu57();
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
    while (this.reader.x < this.reader.uint8.length) this.decodeOperation();
  }

  protected decodeOperation(): void {
    const reader = this.reader;
    const opcode = reader.u8();
    switch (opcode) {
      case Code.MakeObject: {
        this.builder.obj();
        return;
      }
      case Code.MakeArray: {
        this.builder.arr();
        return;
      }
      case Code.MakeString: {
        this.builder.str();
        return;
      }
      case Code.MakeValue: {
        this.builder.val(this.decodeId());
        return;
      }
      case Code.MakeConstant: {
        const val = this.val();
        this.builder.const(val);
        return;
      }
      case Code.MakeUndefined: {
        this.builder.const(undefined);
        return;
      }
      case Code.SetObjectKeys: {
        const object = this.decodeId();
        const fields = reader.vu57();
        const tuples: [key: string | number, value: ITimestampStruct][] = [];
        for (let i = 0; i < fields; i++) {
          const value = this.decodeId();
          const key = this.val();
          if (typeof key !== 'string' && typeof key !== 'number') continue;
          tuples.push([key, value]);
        }
        this.builder.setKeys(object, tuples);
        return;
      }
      case Code.SetValue: {
        const obj = this.decodeId();
        const val = this.decodeId();
        this.builder.setVal(obj, val);
        return;
      }
      case Code.InsertStringSubstring: {
        const obj = this.decodeId();
        const after = this.decodeId();
        const str = this.val();
        if (typeof str !== 'string') return;
        this.builder.insStr(obj, after, str);
        return;
      }
      case Code.InsertArrayElements: {
        const arr = this.decodeId();
        const after = this.decodeId();
        const length = reader.vu57();
        const elements: ITimestampStruct[] = [];
        for (let i = 0; i < length; i++) elements.push(this.decodeId());
        this.builder.insArr(arr, after, elements);
        return;
      }
      case Code.Delete: {
        const obj = this.decodeId();
        const length = reader.vu57();
        const what: ITimespanStruct[] = [];
        for (let i = 0; i < length; i++) what.push(this.decodeTss());
        this.builder.del(obj, what);
        return;
      }
      case Code.DeleteOne: {
        const obj = this.decodeId();
        const span = this.decodeTss();
        this.builder.del(obj, [span]);
        return;
      }
      case Code.NoopOne: {
        this.builder.noop(1);
        return;
      }
      case Code.Noop: {
        this.builder.noop(reader.vu57());
        return;
      }
      case Code.MakeBinary: {
        this.builder.bin();
        return;
      }
      case Code.InsertBinaryData: {
        const obj = this.decodeId();
        const after = this.decodeId();
        const length = this.reader.vu57();
        const data = reader.buf(length);
        this.builder.insBin(obj, after, data);
        return;
      }
      case Code.MakeTuple: {
        this.builder.tup();
        return;
      }
      case Code.MakeConstId: {
        const id = this.decodeId();
        this.builder.const(id);
        return;
      }
      default: {
        throw new Error('UNKNOWN_OP');
      }
    }
  }
}
