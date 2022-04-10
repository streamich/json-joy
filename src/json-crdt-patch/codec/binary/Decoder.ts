import {Code} from '../compact/constants';
import {CrdtDecoder} from './CrdtDecoder';
import {ITimestamp, LogicalTimestamp, LogicalVectorClock} from '../../clock';
import {Patch} from '../../Patch';
import {PatchBuilder} from '../../PatchBuilder';

export class Decoder extends CrdtDecoder {
  protected builder!: PatchBuilder;

  public decode(data: Uint8Array): Patch {
    this.reset(data);
    const id = this.decodeId();
    const clock = new LogicalVectorClock(id.getSessionId(), id.time);
    this.builder = new PatchBuilder(clock);
    this.decodeOperations();
    return this.builder.patch
  }

  protected decodeId(): ITimestamp {
    const [sessionId, time] = this.uint53vuint39();
    return new LogicalTimestamp(sessionId, time);
  }

  public decodeOperations(): void {
    while (this.x < this.uint8.length) this.decodeOperation();
  }

  protected decodeOperation(): void {
    const opcode = this.u8();
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
        this.builder.val(this.val());
        return;
      }
      case Code.MakeNumber: {
        this.builder.num();
        return;
      }
      case Code.SetRoot: {
        this.builder.root(this.decodeId());
        return;
      }
      case Code.SetObjectKeys: {
        const object = this.decodeId();
        const fields = this.vuint57();
        const tuples: [key: string, value: ITimestamp][] = [];
        for (let i = 0; i < fields; i++) {
          const value = this.decodeId();
          const key = this.val();
          if (typeof key !== 'string') continue;
          tuples.push([key, value]);
        }
        this.builder.setKeys(object, tuples);
        return;
      }
      case Code.SetValue: {
        const after = this.decodeId();
        const value = this.val();
        this.builder.setVal(after, value);
        return;
      }
      case Code.SetNumber: {
        const after = this.decodeId();
        const value = this.val();
        if (typeof value !== 'number') return;
        this.builder.setNum(after, value);
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
        const length = this.vuint57();
        const elements: ITimestamp[] = [];
        for (let i = 0; i < length; i++)
          elements.push(this.decodeId());
        this.builder.insArr(arr, after, elements);
        return;
      }
      case Code.Delete: {
        const obj = this.decodeId();
        const after = this.decodeId();
        const length = this.vuint57();
        this.builder.del(obj, after, length);
        return;
      }
      case Code.DeleteOne: {
        const obj = this.decodeId();
        const after = this.decodeId();
        this.builder.del(obj, after, 1);
        return;
      }
      case Code.NoopOne: {
        this.builder.noop(1);
        return;
      }
      case Code.Noop: {
        this.builder.noop(this.vuint57());
        return;
      }
      case Code.MakeBinary: {
        this.builder.bin();
        return;
      }
      case Code.InsertBinaryData: {
        const obj = this.decodeId();
        const after = this.decodeId();
        const length = this.vuint57();
        const data = this.bin(length);
        this.builder.insBin(obj, after, data);
        return;
      }
      default: {
        throw new Error('UNKNOWN_OP');
      }
    }
  }
}
