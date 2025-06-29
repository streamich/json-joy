import {RandomJson} from '@jsonjoy.com/util/lib/json-random';
import {Fuzzer} from '@jsonjoy.com/util/lib/Fuzzer';
import {interval, type ITimestampStruct, Timespan, ClockVector, ServerClockVector, ts} from '../../clock';
import {SESSION} from '../../constants';
import type {Patch} from '../../Patch';
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

  public generateLogicalPatchBase(builder: PatchBuilder, ts: () => ITimestampStruct): Patch {
    const length = this.generatePatchLength();
    for (let i = 0; i < length; i++) {
      const build = Fuzzer.pick([
        () => builder.obj(),
        () => builder.arr(),
        () => builder.str(),
        () => builder.bin(),
        () => builder.val(),
        () => builder.con(RandomJson.generate()),
        () => builder.root(ts()),
        () =>
          builder.insObj(
            ts(),
            Fuzzer.repeat(Fuzzer.randomInt(1, 10), () => [RandomJson.genString(), ts()]),
          ),
        () => builder.setVal(ts(), ts()),
        () => builder.insStr(ts(), ts(), RandomJson.genString()),
        () => builder.insBin(ts(), ts(), RandomJson.genBinary()),
        () =>
          builder.insArr(
            ts(),
            ts(),
            Fuzzer.repeat(Fuzzer.randomInt(1, 10), () => ts()),
          ),
        () => builder.del(ts(), [interval(ts(), 0, this.generateSpan())]),
        () => builder.del(ts(), [interval(ts(), 0, this.generateSpan()), interval(ts(), 0, this.generateSpan())]),
        () => builder.nop(Fuzzer.randomInt(1, 20)),
      ]);
      build();
    }
    return builder.patch;
  }

  public generateLogicalClock(): ClockVector {
    const sessionId = this.generateSessionId();
    const time = this.generateTime();
    return new ClockVector(sessionId, time);
  }

  public generateServerClock(): ServerClockVector {
    return new ServerClockVector(SESSION.SERVER, this.generateTime());
  }

  public readonly generateLogicalTimestamp = (): ITimestampStruct => {
    const sessionId = Fuzzer.randomInt(0xffff + 1, SESSION.MAX);
    const time = Fuzzer.randomInt(0, 0xffffff);
    return ts(sessionId, time);
  };

  public readonly generateServerTimestamp = (): ITimestampStruct => {
    const time = Fuzzer.randomInt(0, 0xffffff);
    return ts(SESSION.SERVER, time);
  };

  public readonly generateLogicalTimespan = (): Timespan => {
    const sessionId = this.generateSessionId();
    const time = this.generateTime();
    const span = this.generateSpan();
    return new Timespan(sessionId, time, span);
  };

  public generateSessionId(): number {
    return Fuzzer.randomInt(0xffff + 1, SESSION.MAX);
  }

  public generateTime(): number {
    return Fuzzer.randomInt(0, 0xffffffffff);
  }

  public generateSpan(): number {
    return Fuzzer.randomInt(1, 0xffff);
  }

  public generatePatchLength(): number {
    return Fuzzer.randomInt(1, 20);
  }
}
