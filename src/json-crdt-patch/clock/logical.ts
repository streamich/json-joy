/**
 * This module implements logical clock, where each session ID (we call it
 * session because it can be different user or even the same user from a
 * different device or even the same device but from a different browser tab) is
 * a randomly generated 53-bit integer (as 53 bits is the maximum integer value
 * in JavaScript) and time is a monotonically incrementing integer.
 * 
 * @module
 */

import {IClock, ITimespan, ITimestamp} from './types';

 export class LogicalTimestamp implements ITimestamp {
  constructor(public sessionId: number, public time: number) {}

  public getSessionId(): number {
    return this.sessionId;
  }

  public isEqual(ts: ITimestamp): boolean {
    return this.getSessionId() === ts.getSessionId() && this.time === ts.time;
  }

  public compare(ts: ITimestamp): -1 | 0 | 1 {
    if (this.time > ts.time) return 1;
    if (this.time < ts.time) return -1;
    if (this.getSessionId() > ts.getSessionId()) return 1;
    if (this.getSessionId() < ts.getSessionId()) return -1;
    return 0;
  }

  public inSpan(span: number, ts: ITimestamp, tsSpan: number): boolean {
    if (this.getSessionId() !== ts.getSessionId()) return false;
    if (this.time > ts.time) return false;
    if (this.time + span < ts.time + tsSpan) return false;
    return true;
  }

  public overlap(span: number, ts: ITimestamp, tsSpan: number): number {
    if (this.getSessionId() !== ts.getSessionId()) return 0;
    const x1 = this.time;
    const x2 = x1 + span;
    const y1 = ts.time;
    const y2 = y1 + tsSpan;
    const min = Math.max(x1, y1);
    const max = Math.min(x2, y2);
    const diff = max - min;
    return diff <= 0 ? 0 : diff;
  }

  public tick(cycles: number): ITimestamp {
    return new LogicalTimestamp(this.getSessionId(), this.time + cycles);
  }

  public interval(cycles: number, span: number): ITimespan {
    return new LogicalTimespan(this.getSessionId(), this.time + cycles, span);
  }

  public toString() {
    // "!" is used as separator as it has the lowest ASCII value.
    return this.getSessionId() + '!' + this.time;
  }

  public toDisplayString() {
    let session = String(this.getSessionId());
    if (session.length > 4) session = '..' + session.substr(session.length - 4);
    return session + '!' + this.time;
  }

  public clock(): IClock {
    return new LogicalClock(this.getSessionId(), this.time);
  }

  public compact(): string {
    return this.getSessionId() + ',' + this.time;
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
