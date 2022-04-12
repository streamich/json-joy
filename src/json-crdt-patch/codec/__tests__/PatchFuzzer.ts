import {RandomJson} from "../../../json-random";
import {LogicalTimespan, LogicalTimestamp, LogicalVectorClock} from "../../clock";
import {DeleteOperation} from "../../operations/DeleteOperation";
import {JsonCrdtPatchOperation, Patch} from "../../Patch";
import {PatchBuilder} from "../../PatchBuilder";

export class PatchFuzzer {
  public generateLogicalPatch(): Patch {
    const clock = this.generateLogicalClock();
    const builder = new PatchBuilder(clock);
    const length = this.generatePatchLength();
    for (let i = 0; i < length; i++) {
      const build = this.pick([
        () => builder.obj(),
        () => builder.arr(),
        () => builder.str(),
        () => builder.bin(),
        () => builder.num(),
        () => builder.val(RandomJson.generate()),
        () => builder.root(this.generateLogicalTimestamp()),
        () => builder.setKeys(this.generateLogicalTimestamp(), this.repeat(this.generateInteger(1, 10), () => [RandomJson.genString(), this.generateLogicalTimestamp()])),
        () => builder.setNum(this.generateLogicalTimestamp(), RandomJson.genNumber()),
        () => builder.setVal(this.generateLogicalTimestamp(), RandomJson.generate()),
        () => builder.insStr(this.generateLogicalTimestamp(), this.generateLogicalTimestamp(), RandomJson.genString()),
        () => builder.insBin(this.generateLogicalTimestamp(), this.generateLogicalTimestamp(), RandomJson.genBinary()),
        () => builder.insArr(this.generateLogicalTimestamp(), this.generateLogicalTimestamp(), this.repeat(this.generateInteger(1, 10), () => this.generateLogicalTimestamp())),
        () => builder.del(this.generateLogicalTimestamp(), this.generateLogicalTimestamp(), this.generateSpan()),
        () => builder.noop(this.generateInteger(1, 20)),
      ]);
      build();
    }
    return builder.patch;
  }

  public generateLogicalClock(): LogicalVectorClock {
    return new LogicalVectorClock(343434343, 33);
  }

  public generateLogicalOperation(): JsonCrdtPatchOperation {
    return new DeleteOperation(this.generateLogicalTimestamp(), this.generateLogicalTimestamp(), this.generateLogicalTimespan());
  }

  public generateLogicalTimestamp(): LogicalTimestamp {
    const sessionId = this.generateInteger(0xFFFF + 1, 0xFFFFFFFFFF);
    const time = this.generateInteger(0, 0xFFFFFF)
    return new LogicalTimestamp(sessionId, time);
  }

  public generateLogicalTimespan(): LogicalTimespan {
    const sessionId = this.generateInteger(0xFFFF + 1, 0xFFFFFFFFFF);
    const time = this.generateInteger(0, 0xFFFFFF)
    const span = this.generateSpan();
    return new LogicalTimespan(sessionId, time, span);
  }

  public generateSpan(): number {
    return this.generateInteger(1, 0xFFFF);
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