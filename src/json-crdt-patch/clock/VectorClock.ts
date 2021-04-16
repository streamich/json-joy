import {LogicalClock} from './logical';
import {ITimestamp} from './types';

export class VectorClock extends LogicalClock {
  /**
   * Mapping of session IDs to logical timestamps.
   */
  public readonly clocks = new Map<number, ITimestamp>();

  constructor(sessionId: number, time: number) {
    super(sessionId, time);
    this.clocks.set(sessionId, this);
  }

  /**
   * Advances clocks when we observe higher time values.
   *
   * @param ts Operation timestamp that was observed.
   */
  public observe(ts: ITimestamp, span: number) {
    if (this.time + 1 < ts.time) throw new Error('TIME_TRAVEL');
    const time = ts.time + span - 1;
    const clock = this.clocks.get(ts.getSessionId());
    if (!clock) this.clocks.set(ts.getSessionId(), ts.tick(span - 1));
    else if (time > clock.time) clock.time = ts.time;
    if (time >= this.time) this.time = time + 1;
  }

  public fork(sessionId: number): VectorClock {
    const clock = new VectorClock(sessionId, this.time);
    for (const ts of this.clocks.values()) clock.observe(ts.tick(0), 1);
    return clock;
  }

  public clone(): VectorClock {
    return this.fork(this.getSessionId());
  }
}
