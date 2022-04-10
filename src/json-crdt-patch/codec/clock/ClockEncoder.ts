import type {ITimestamp, IVectorClock} from '../../clock';
import {RelativeTimestamp} from './RelativeTimestamp';

export class ClockEncoder {
  /** Clock session ID to session index. */
  public readonly table: Map<number, number>;
  public index: number;

  public constructor(public readonly clock: IVectorClock) {
    this.index = 1;
    this.table = new Map();
    this.table.set(clock.getSessionId(), this.index++);
  }

  public append(ts: ITimestamp): RelativeTimestamp {
    const {time} = ts;
    const sessionId = ts.getSessionId();
    if (sessionId === 0) return new RelativeTimestamp(0, ts.time);
    const clock = this.clock.clocks.get(sessionId);
    if (!clock) throw new Error(`Clock not found (${sessionId}, ${time}).`);
    if (!this.table.has(sessionId)) this.table.set(sessionId, this.index++);
    const sessionIndex = this.table.get(sessionId)!;
    const timeDiff = clock.time - time;
    if (timeDiff < 0) throw new Error('INVALID_RELATIVE_TIME');
    const relativeTimestamp = new RelativeTimestamp(sessionIndex, timeDiff);
    return relativeTimestamp;
  }

  public toJson(): number[] {
    const out: number[] = [];
    for (const sessionId of this.table.keys()) {
      const clock = this.clock.clocks.get(sessionId);
      if (clock) out.push(clock.getSessionId(), clock.time);
      else if (this.clock.getSessionId() === sessionId) {
        out.push(sessionId, this.clock.time);
      } else {
        // Should not happen.
      }
    }
    return out;
  }

  public *clocks(): IterableIterator<ITimestamp | undefined> {
    for (const sessionId of this.table.keys()) yield this.clock.clocks.get(sessionId);
  }
}
