import {type ITimestampStruct, ClockVector, ts} from '../../clock';

export class ClockDecoder {
  /** Clock session index to logical clock. */
  protected readonly table: ITimestampStruct[] = [];
  public readonly clock: ClockVector;

  public static fromArr(arr: number[]): ClockDecoder {
    const decoder = new ClockDecoder(arr[0], arr[1]);
    const length = arr.length;
    for (let i = 2; i < length; i += 2) decoder.pushTuple(arr[i], arr[i + 1]);
    return decoder;
  }

  public constructor(sid: number, time: number) {
    this.clock = new ClockVector(sid, time + 1);
    this.table.push(ts(sid, time));
  }

  public pushTuple(sid: number, time: number) {
    const id = ts(sid, time);
    this.clock.observe(id, 1);
    this.table.push(id);
  }

  public decodeId(sessionIndex: number, timeDiff: number): ITimestampStruct {
    if (!sessionIndex) return ts(0, timeDiff);
    const clock = this.table[sessionIndex - 1];
    if (!clock) throw new Error('INVALID_CLOCK_TABLE');
    return ts(clock.sid, clock.time - timeDiff);
  }
}
