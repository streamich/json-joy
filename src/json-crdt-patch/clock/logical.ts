/**
 * This module implements logical clock, where each session ID (we call it
 * session because it can be different user or even the same user from a
 * different device or even the same device but from a different browser tab) is
 * a randomly generated 53-bit integer (as 53 bits is the maximum integer value
 * in JavaScript) and time is a monotonically incrementing integer.
 *
 * @module
 */

import {ServerTimestamp} from './server';
import type {IClock, IVectorClock, ITimespan, ITimestamp} from './types';

export class LogicalTimestamp extends ServerTimestamp implements ITimestamp {
  constructor(public sessionId: number, public time: number) {
    super(time);
  }

  public getSessionId(): number {
    return this.sessionId;
  }

  public stamp(sessionId: number, time: number): ServerTimestamp {
    return new LogicalTimestamp(sessionId, time);
  }

  public tick(cycles: number): ITimestamp {
    return new LogicalTimestamp(this.getSessionId(), this.time + cycles);
  }

  public interval(cycles: number, span: number): ITimespan {
    return new LogicalTimespan(this.getSessionId(), this.time + cycles, span);
  }

  public clock(): IClock {
    return new LogicalClock(this.getSessionId(), this.time);
  }
}

export class LogicalTimespan extends LogicalTimestamp implements ITimespan {
  constructor(sessionId: number, time: number, public span: number) {
    super(sessionId, time);
  }
}

export class LogicalClock extends LogicalTimestamp implements IClock {
  public tick(cycles: number): ITimestamp {
    const timestamp = new LogicalTimestamp(this.sessionId, this.time);
    this.time += cycles;
    return timestamp;
  }
}

export class LogicalVectorClock extends LogicalClock implements IVectorClock {
  public readonly clocks = new Map<number, ITimestamp>();

  public observe(ts: ITimestamp, span: number) {
    // if (this.time < ts.time) throw new Error('TIME_TRAVEL');
    const time = ts.time + span - 1;
    const clock = this.clocks.get(ts.getSessionId());
    if (!clock) this.clocks.set(ts.getSessionId(), ts.tick(span - 1));
    else if (time > clock.time) clock.time = ts.time;

    // Advance local time every time we see any timestamp with higher time value.
    if (time >= this.time) this.time = time + 1;
  }

  public clone(): LogicalVectorClock {
    return this.fork(this.getSessionId());
  }

  public fork(sessionId: number): LogicalVectorClock {
    const clock = new LogicalVectorClock(sessionId, this.time);
    for (const ts of this.clocks.values()) clock.observe(ts.tick(0), 1);
    return clock;
  }
}
