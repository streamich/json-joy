/**
 * This module contains "logical clock" implementation when there are no peers,
 * but all operations go through a central server and the server ensures the
 * total order of operations. In this case session ID is not used, it is always
 * set to zero. The time is sequentially monotonically incrementing integer, it
 * is incremented by the server.
 *
 * @module
 */

import {IClock, ITimespan, ITimestamp, IVectorClock} from './types';

const SERVER_SESSION_ID = 1;

export class ServerTimestamp implements ITimestamp {
  constructor(public time: number) {}

  public getSessionId(): number {
    return SERVER_SESSION_ID;
  }

  public isEqual(ts: ITimestamp): boolean {
    return this.time === ts.time;
  }

  public compare(ts: ITimestamp): -1 | 0 | 1 {
    if (this.time > ts.time) return 1;
    if (this.time < ts.time) return -1;
    return 0;
  }

  public inSpan(span: number, ts: ITimestamp, tsSpan: number): boolean {
    if (this.time > ts.time) return false;
    if (this.time + span < ts.time + tsSpan) return false;
    return true;
  }

  public overlap(span: number, ts: ITimestamp, tsSpan: number): number {
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
    return new ServerTimestamp(this.time + cycles);
  }

  public interval(cycles: number, span: number): ITimespan {
    return new ServerTimespan(this.time + cycles, span);
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
    return new ServerClock(this.time);
  }

  public compact(): string {
    return this.getSessionId() + ',' + this.time;
  }
}

export class ServerTimespan extends ServerTimestamp implements ITimespan {
  constructor(time: number, public span: number) {
    super(time);
  }
}

export class ServerClock extends ServerTimestamp implements IClock {
  public tick(cycles: number): ITimestamp {
    const timestamp = new ServerTimestamp(this.time);
    this.time += cycles;
    return timestamp;
  }
}

export class ServerVectorClock extends ServerClock implements IVectorClock {
  public readonly clocks = new Map<number, ITimestamp>();

  public observe(ts: ITimestamp, span: number) {
    if (ts.getSessionId() !== SERVER_SESSION_ID) throw new Error('INVALID_SERVER_SESSION');
    if (this.time + 1 < ts.time) throw new Error('TIME_TRAVEL');
    const time = ts.time + span;
    if (time > this.time) this.time = time;
  }

  public clone(): ServerVectorClock {
    return this.fork();
  }

  public fork(): ServerVectorClock {
    return new ServerVectorClock(this.time);
  }
}
