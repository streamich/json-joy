import {ITimestamp, LogicalTimestamp, LogicalVectorClock} from '../../clock';
import {FALSE_ID, NULL_ID, SESSION, SYSTEM_SESSION_TIME, TRUE_ID, UNDEFINED_ID} from '../../constants';

export class ClockDecoder {
  /** Clock session index to logical clock. */
  private readonly table: Map<number, LogicalTimestamp> = new Map();

  private index: number;
  public readonly clock: LogicalVectorClock;

  public static fromArr(arr: number[]): ClockDecoder {
    const decoder = new ClockDecoder(arr[0], 0);
    const length = arr.length;
    for (let i = 0; i < length; i += 2) decoder.pushTuple(arr[i], arr[i + 1]);
    return decoder;
  }

  public constructor(sessionId: number, time: number) {
    this.index = 1;
    this.clock = new LogicalVectorClock(sessionId, time);
    if (time) this.clock.observe(new LogicalTimestamp(sessionId, time - 1), 1);
  }

  public pushTuple(sessionId: number, time: number) {
    const ts = new LogicalTimestamp(sessionId, time);
    this.clock.observe(ts, 1);
    this.table.set(this.index++, ts);
  }

  public decodeId(sessionIndex: number, timeDiff: number): ITimestamp {
    if (sessionIndex === SESSION.SYSTEM) {
      switch (timeDiff) {
        case SYSTEM_SESSION_TIME.NULL:
          return NULL_ID;
        case SYSTEM_SESSION_TIME.TRUE:
          return TRUE_ID;
        case SYSTEM_SESSION_TIME.FALSE:
          return FALSE_ID;
        case SYSTEM_SESSION_TIME.UNDEFINED:
          return UNDEFINED_ID;
      }
      return new LogicalTimestamp(SESSION.SYSTEM, timeDiff);
    }
    const ts = this.table.get(sessionIndex);
    if (!ts) throw new Error('INVALID_CLOCK_TABLE');
    return new LogicalTimestamp(ts.getSessionId(), ts.time - timeDiff);
  }
}
