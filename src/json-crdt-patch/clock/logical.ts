/**
 * This module implements logical clock, where each session ID (we call it
 * session because it can be different user or even the same user from a
 * different device or even the same device but from a different browser tab) is
 * a randomly generated 53-bit integer (as 53 bits is the maximum integer value
 * in JavaScript) and time is a monotonically incrementing integer.
 *
 * @module
 */

import type {IClock, IVectorClock, ITimestampStruct, ITimespanStruct} from './types';
import {SESSION} from '../constants';

export class Timestamp implements ITimestampStruct {
  constructor(public readonly sid: number, public time: number) {}

  // toString() {
  //   return this.sid + '.' + this.time;
  // }
}

// TODO: Try this optimization:
// Timestamp.prototype = Object.create(null);

export class Timespan implements ITimespanStruct {
  constructor(public readonly sid: number, public time: number, public span: number) {}
}

export const ts = (sid: number, time: number): ITimestampStruct => new Timestamp(sid, time);
export const tss = (sid: number, time: number, span: number): ITimespanStruct => new Timespan(sid, time, span);

export const tick = (stamp: ITimestampStruct, cycles: number): ITimestampStruct => ts(stamp.sid, stamp.time + cycles);

/**
 * @returns True if timestamps are equal.
 */
export const equal = (ts1: ITimestampStruct, ts2: ITimestampStruct): boolean =>
  ts1.time === ts2.time && ts1.sid === ts2.sid;

/**
 * @returns 1 if current timestamp is larger, -1 if smaller, and 0 otherwise.
 */
export const compare = (ts1: ITimestampStruct, ts2: ITimestampStruct): -1 | 0 | 1 => {
  const t1 = ts1.time;
  const t2 = ts2.time;
  if (t1 > t2) return 1;
  if (t1 < t2) return -1;
  const s1 = ts1.sid;
  const s2 = ts2.sid;
  if (s1 > s2) return 1;
  if (s1 < s2) return -1;
  return 0;
};

export const contains = (ts1: ITimestampStruct, span1: number, ts2: ITimestampStruct, span2: number): boolean => {
  if (ts1.sid !== ts2.sid) return false;
  const t1 = ts1.time;
  const t2 = ts2.time;
  if (t1 > t2) return false;
  if (t1 + span1 < t2 + span2) return false;
  return true;
};

export const containsId = (ts1: ITimestampStruct, span1: number, ts2: ITimestampStruct): boolean => {
  if (ts1.sid !== ts2.sid) return false;
  const t1 = ts1.time;
  const t2 = ts2.time;
  if (t1 > t2) return false;
  if (t1 + span1 < t2 + 1) return false;
  return true;
};

export const toDisplayString = (id: ITimestampStruct) => {
  if (id.sid === SESSION.SERVER) return '.' + id.time;
  let session = '' + id.sid;
  if (session.length > 4) session = '..' + session.slice(session.length - 4);
  return session + '.' + id.time;
};

export const interval = (ts: ITimestampStruct, tick: number, span: number): ITimespanStruct =>
  new Timespan(ts.sid, ts.time + tick, span);

export class LogicalClock extends Timestamp implements IClock {
  public tick(cycles: number): ITimestampStruct {
    const timestamp = new Timestamp(this.sid, this.time);
    this.time += cycles;
    return timestamp;
  }
}

export class VectorClock extends LogicalClock implements IVectorClock {
  public readonly peers = new Map<number, ITimestampStruct>();

  /**
   * Advance local time every time we see any timestamp with higher time value.
   * @param id The time stamp we observed.
   * @param span Length of the time span.
   */
  public observe(id: ITimestampStruct, span: number) {
    // if (this.time < ts.time) throw new Error('TIME_TRAVEL');
    const edge = id.time + span - 1;
    const sid = id.sid;
    if (sid !== this.sid) {
      const clock = this.peers.get(id.sid);
      if (!clock) this.peers.set(id.sid, ts(sid, edge));
      else if (edge > clock.time) clock.time = edge;
    }
    if (edge >= this.time) this.time = edge + 1;
  }

  public clone(): VectorClock {
    return this.fork(this.sid);
  }

  public fork(sessionId: number): VectorClock {
    const clock = new VectorClock(sessionId, this.time);
    if (sessionId !== this.sid) clock.observe(tick(this, -1), 1);
    this.peers.forEach((peer) => {
      clock.observe(peer, 1);
    });
    return clock;
  }

  public toString(tab: string = ''): string {
    const last = this.peers.size;
    let i = 1;
    let lines = '';
    this.peers.forEach((clock) => {
      const isLast = i === last;
      lines += `\n${tab}${isLast ? '└─' : '├─'} ${clock.sid}.${clock.time}`;
      i++;
    });
    return `${this.constructor.name} ${this.sid}.${this.time}${lines}`;
  }
}

/**
 * This is not a vector clock. It implements the IVectorClock interface, but
 * under the hood it is just a single incrementing sequence integer.
 */
export class ServerVectorClock extends LogicalClock implements IVectorClock {
  public readonly peers = new Map<number, ITimespanStruct>();

  public observe(ts: ITimespanStruct, span: number) {
    if (ts.sid !== SESSION.SERVER) throw new Error('INVALID_SERVER_SESSION');
    if (this.time < ts.time) throw new Error('TIME_TRAVEL');
    const time = ts.time + span;
    if (time > this.time) this.time = time;
  }

  public clone(): ServerVectorClock {
    return this.fork();
  }

  public fork(): ServerVectorClock {
    return new ServerVectorClock(SESSION.SERVER, this.time);
  }
}
