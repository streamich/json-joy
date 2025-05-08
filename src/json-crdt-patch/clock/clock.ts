import {SESSION} from '../enums';
import type {IClock, IClockVector, ITimestampStruct, ITimespanStruct} from './types';

export class Timestamp implements ITimestampStruct {
  constructor(
    public readonly sid: number,
    public time: number,
  ) {}
}

export class Timespan implements ITimespanStruct {
  constructor(
    public readonly sid: number,
    public time: number,
    public span: number,
  ) {}
}

/**
 * A factory function for creating a new timestamp.
 *
 * @param sid Session ID.
 * @param time Logical clock sequence number.
 * @returns A new timestamp.
 */
export const ts = (sid: number, time: number): ITimestampStruct => new Timestamp(sid, time);

/**
 * A factory function for creating a new timespan.
 *
 * @param sid Session ID.
 * @param time Logical clock sequence number.
 * @param span Length of the timespan.
 * @returns A new timespan.
 */
export const tss = (sid: number, time: number, span: number): ITimespanStruct => new Timespan(sid, time, span);

/**
 * Advance a timestamp by a number of cycles.
 *
 * @param stamp A reference timestamp.
 * @param cycles Number of cycles to advance.
 * @returns A new timestamp.
 */
export const tick = (stamp: ITimestampStruct, cycles: number): ITimestampStruct => ts(stamp.sid, stamp.time + cycles);

/**
 * Compares for equality two timestamps, time first.
 *
 * @returns True if timestamps are equal.
 */
export const equal = (ts1: ITimestampStruct, ts2: ITimestampStruct): boolean =>
  ts1.time === ts2.time && ts1.sid === ts2.sid;

/**
 * Compares two timestamps, time first.
 *
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

/**
 * Checks if the first timespan contains the second timespan.
 *
 * @param ts1 Start of container timespan.
 * @param span1 Length of container timespan.
 * @param ts2 Start of contained timespan.
 * @param span2 Length of contained timespan.
 * @returns Returns true if the first timespan contains the second timespan.
 */
export const contains = (ts1: ITimestampStruct, span1: number, ts2: ITimestampStruct, span2: number): boolean => {
  if (ts1.sid !== ts2.sid) return false;
  const t1 = ts1.time;
  const t2 = ts2.time;
  if (t1 > t2) return false;
  if (t1 + span1 < t2 + span2) return false;
  return true;
};

/**
 * Checks if a timespan contains the `ts2` point.
 *
 * @param ts1 Start of container timespan.
 * @param span1 Length of container timespan.
 * @param ts2 A point in time.
 * @returns Returns true if the first timespan contains the `ts2` point.
 */
export const containsId = (ts1: ITimestampStruct, span1: number, ts2: ITimestampStruct): boolean => {
  if (ts1.sid !== ts2.sid) return false;
  const t1 = ts1.time;
  const t2 = ts2.time;
  if (t1 > t2) return false;
  if (t1 + span1 < t2 + 1) return false;
  return true;
};

/**
 * Returns a human-readable string representation of the timestamp.
 *
 * @param id A timestamp.
 * @returns Human-readable string representation of the timestamp.
 */
export const printTs = (id: ITimestampStruct): string => {
  if (id.sid === SESSION.SERVER) return '.' + id.time;
  let session = '' + id.sid;
  if (session.length > 4) session = '..' + session.slice(session.length - 4);
  return session + '.' + id.time;
};

/**
 * Advances a given timestamp by a number of cycles and then returns a timespan
 * starting from that position.
 *
 * @param ts A start timestamp.
 * @param tick Number of cycles to advance the starting timestamp.
 * @param span Length of the timespan.
 * @returns A new timespan.
 */
export const interval = (ts: ITimestampStruct, tick: number, span: number): ITimespanStruct =>
  new Timespan(ts.sid, ts.time + tick, span);

/**
 * Represents a *Logical Clock*, which can be advanced by a number of cycles.
 */
export class LogicalClock extends Timestamp implements IClock {
  /**
   * Returns a new timestamp, which is the current clock value, and advances the
   * clock by a number of cycles.
   *
   * @param cycles Number of cycles to advance the clock.
   * @returns A new timestamp, which is the current clock value.
   */
  public tick(cycles: number): ITimestampStruct {
    const timestamp = new Timestamp(this.sid, this.time);
    this.time += cycles;
    return timestamp;
  }
}

/**
 * Represents a clock vector, which is a local logical clock together with a set
 * of logical clocks of other peers.
 */
export class ClockVector extends LogicalClock implements IClockVector {
  /**
   * A set of logical clocks of other peers.
   */
  public readonly peers = new Map<number, ITimestampStruct>();

  /**
   * Advances local time every time we see any timestamp with higher time value.
   * This is an idempotent method which can be called every time a new timestamp
   * is observed, it advances the local time only if the observed timestamp is
   * greater than the current local time.
   *
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

  /**
   * Returns a deep copy of the current vector clock with the same session ID.
   *
   * @returns A new vector clock, which is a clone of the current vector clock.
   */
  public clone(): ClockVector {
    return this.fork(this.sid);
  }

  /**
   * Returns a deep copy of the current vector clock with a different session ID.
   *
   * @param sessionId The session ID of the new vector clock.
   * @returns A new vector clock, which is a fork of the current vector clock.
   */
  public fork(sessionId: number): ClockVector {
    const clock = new ClockVector(sessionId, this.time);
    if (sessionId !== this.sid) clock.observe(tick(this, -1), 1);
    // biome-ignore lint: using .forEach() on Map is the fastest way to iterate
    this.peers.forEach((peer) => {
      clock.observe(peer, 1);
    });
    return clock;
  }

  public toCompact(): number[] {
    const result: number[] = [this.sid, this.time - 1];
    this.peers.forEach(ts => {
      result.push(ts.sid, ts.time);
    });
    return result;
  }

  /**
   * Returns a human-readable string representation of the clock vector.
   *
   * @param tab String to use for indentation.
   * @returns Human-readable string representation of the clock vector.
   */
  public toString(tab: string = ''): string {
    const last = this.peers.size;
    let i = 1;
    let lines = '';
    // biome-ignore lint: using .forEach() on Map is the fastest way to iterate
    this.peers.forEach((clock) => {
      const isLast = i === last;
      lines += `\n${tab}${isLast ? '└─' : '├─'} ${clock.sid}.${clock.time}`;
      i++;
    });
    return `clock ${this.sid}.${this.time}${lines}`;
  }
}

/**
 * Implements a clock vector with a fixed session ID. The *server clock*
 * is used when the CRDT is powered by a central server.
 */
export class ServerClockVector extends LogicalClock implements IClockVector {
  /** A stub for other peers. Not used in the server clock. */
  public readonly peers = new Map<number, ITimespanStruct>();

  public observe(ts: ITimespanStruct, span: number) {
    if (ts.sid > 8) throw new Error('INVALID_SERVER_SESSION');
    if (this.time < ts.time) throw new Error('TIME_TRAVEL');
    const time = ts.time + span;
    if (time > this.time) this.time = time;
  }

  public clone(): ServerClockVector {
    return this.fork();
  }

  public fork(): ServerClockVector {
    return new ServerClockVector(SESSION.SERVER, this.time);
  }

  /**
   * Returns a human-readable string representation of the clock vector.
   *
   * @returns Human-readable string representation of the clock vector.
   */
  public toString(): string {
    return `clock ${this.sid}.${this.time}`;
  }
}
