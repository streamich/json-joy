import {ITimestamp, LogicalTimestamp, LogicalVectorClock} from '../../clock';

export class ClockDecoder {
  /** Clock session index to logical clock. */
  private readonly table: Map<number, LogicalTimestamp> = new Map();

  private index: number;
  public readonly clock: LogicalVectorClock;

  public static fromArr(arr: number[]): ClockDecoder {
    const decoder = new ClockDecoder(arr[0], arr[1]);
    const length = arr.length;
    for (let i = 2; i < length; i += 2) decoder.pushTuple(arr[i], arr[i + 1]);
    return decoder;
  }

  public constructor(sessionId: number, time: number) {
    this.index = 1;
    this.clock = new LogicalVectorClock(sessionId, time);
    if (time) this.clock.observe(new LogicalTimestamp(sessionId, time), 1);
    this.table.set(this.index++, this.clock);
  }

  public pushTuple(sessionId: number, time: number) {
    const ts = new LogicalTimestamp(sessionId, time);
    this.clock.observe(ts, 1);
    this.table.set(this.index++, ts);
  }

  public decodeId(sessionIndex: number, timeDiff: number): ITimestamp {
    if (!sessionIndex) return new LogicalTimestamp(0, timeDiff);
    const ts = this.table.get(sessionIndex);
    if (!ts) throw new Error('INVALID_CLOCK_TABLE');
    return new LogicalTimestamp(ts.getSessionId(), ts.time - timeDiff - 1);
  }
}
