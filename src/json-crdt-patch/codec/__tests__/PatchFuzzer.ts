import {RandomJson} from '../../../json-random';
import {
  ITimestamp,
  LogicalTimespan,
  LogicalTimestamp,
  LogicalVectorClock,
  ServerTimestamp,
  ServerVectorClock,
} from '../../clock';
import {DeleteOperation} from '../../operations/DeleteOperation';
import {JsonCrdtPatchOperation, Patch} from '../../Patch';
import {PatchBuilder} from '../../PatchBuilder';

export class PatchFuzzer {
  public generateLogicalPatch(): Patch {
    const clock = this.generateLogicalClock();
    const builder = new PatchBuilder(clock);
    this.generateLogicalPatchBase(builder, this.generateLogicalTimestamp);
    return builder.patch;
  }

  public generateServerPatch(): Patch {
    const clock = this.generateServerClock();
    const builder = new PatchBuilder(clock);
    this.generateLogicalPatchBase(builder, this.generateServerTimestamp);
    return builder.patch;
  }

  public generateLogicalPatchBase(builder: PatchBuilder, ts: () => ITimestamp): Patch {
    const length = this.generatePatchLength();
    for (let i = 0; i < length; i++) {
      const build = this.pick([
        () => builder.obj(),
        () => builder.arr(),
        () => builder.str(),
        () => builder.bin(),
        () => builder.num(),
        () => builder.val(RandomJson.generate()),
        () => builder.root(ts()),
        () =>
          builder.setKeys(
            ts(),
            this.repeat(this.generateInteger(1, 10), () => [RandomJson.genString(), ts()]),
          ),
        () => builder.setNum(ts(), RandomJson.genNumber()),
        () => builder.setVal(ts(), RandomJson.generate()),
        () => builder.insStr(ts(), ts(), RandomJson.genString()),
        () => builder.insBin(ts(), ts(), RandomJson.genBinary()),
        () =>
          builder.insArr(
            ts(),
            ts(),
            this.repeat(this.generateInteger(1, 10), () => ts()),
          ),
        () => builder.del(ts(), ts(), this.generateSpan()),
        () => builder.noop(this.generateInteger(1, 20)),
      ]);
      build();
    }
    return builder.patch;
  }

  public generateLogicalClock(): LogicalVectorClock {
    const sessionId = this.generateSessionId();
    const time = this.generateTime();
    return new LogicalVectorClock(sessionId, time);
  }

  public generateServerClock(): ServerVectorClock {
    return new ServerVectorClock(this.generateTime());
  }

  public generateLogicalOperation(): JsonCrdtPatchOperation {
    return new DeleteOperation(
      this.generateLogicalTimestamp(),
      this.generateLogicalTimestamp(),
      this.generateLogicalTimespan(),
    );
  }

  public readonly generateLogicalTimestamp = (): LogicalTimestamp => {
    const sessionId = this.generateInteger(0xffff + 1, 0xffffffffff);
    const time = this.generateInteger(0, 0xffffff);
    return new LogicalTimestamp(sessionId, time);
  };

  public readonly generateServerTimestamp = (): ServerTimestamp => {
    const time = this.generateInteger(0, 0xffffff);
    return new ServerTimestamp(time);
  };

  public readonly generateLogicalTimespan = (): LogicalTimespan => {
    const sessionId = this.generateSessionId();
    const time = this.generateTime();
    const span = this.generateSpan();
    return new LogicalTimespan(sessionId, time, span);
  };

  public generateSessionId(): number {
    return this.generateInteger(0xffff + 1, 0xffffffffff);
  }

  public generateTime(): number {
    return this.generateInteger(0, 0xffffffffff);
  }

  public generateSpan(): number {
    return this.generateInteger(1, 0xffff);
  }

  public generatePatchLength(): number {
    return this.generateInteger(1, 20);
  }

  public generateInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public pick<T>(elements: T[]): T {
    return elements[Math.floor(Math.random() * elements.length)];
  }

  public repeat<T>(times: number, callback: () => T): T[] {
    const result: T[] = [];
    for (let i = 0; i < times; i++) result.push(callback());
    return result;
  }
}
