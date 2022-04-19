import {RandomJson} from '../../../json-random';
import {Fuzzer} from '../../../util/Fuzzer';
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

export class PatchFuzzer extends Fuzzer {
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
      const build = Fuzzer.pick([
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
            Fuzzer.repeat(Fuzzer.generateInteger(1, 10), () => [RandomJson.genString(), ts()]),
          ),
        () => builder.setNum(ts(), RandomJson.genNumber()),
        () => builder.setVal(ts(), RandomJson.generate()),
        () => builder.insStr(ts(), ts(), RandomJson.genString()),
        () => builder.insBin(ts(), ts(), RandomJson.genBinary()),
        () =>
          builder.insArr(
            ts(),
            ts(),
            Fuzzer.repeat(Fuzzer.generateInteger(1, 10), () => ts()),
          ),
        () => builder.del(ts(), ts(), this.generateSpan()),
        () => builder.noop(Fuzzer.generateInteger(1, 20)),
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
    const sessionId = Fuzzer.generateInteger(0xffff + 1, 0xffffffffff);
    const time = Fuzzer.generateInteger(0, 0xffffff);
    return new LogicalTimestamp(sessionId, time);
  };

  public readonly generateServerTimestamp = (): ServerTimestamp => {
    const time = Fuzzer.generateInteger(0, 0xffffff);
    return new ServerTimestamp(time);
  };

  public readonly generateLogicalTimespan = (): LogicalTimespan => {
    const sessionId = this.generateSessionId();
    const time = this.generateTime();
    const span = this.generateSpan();
    return new LogicalTimespan(sessionId, time, span);
  };

  public generateSessionId(): number {
    return Fuzzer.generateInteger(0xffff + 1, 0xffffffffff);
  }

  public generateTime(): number {
    return Fuzzer.generateInteger(0, 0xffffffffff);
  }

  public generateSpan(): number {
    return Fuzzer.generateInteger(1, 0xffff);
  }

  public generatePatchLength(): number {
    return Fuzzer.generateInteger(1, 20);
  }
}
