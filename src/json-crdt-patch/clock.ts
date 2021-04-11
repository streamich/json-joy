import type {json_string} from 'ts-brand-json';

/**
 * Immutable timestamp, represents a single point int time of a LogicalClock.
 * Logical timestamps are used to identify every CRDT operation.
 *
 * `time` component is left mutable, so VectorClock can mutate it without needing
 * to create a new object.
 */
export class LogicalTimestamp {
  constructor(public readonly sessionId: number, public time: number) {}

  /**
   * @returns True if timestamps are equal.
   */
  public isEqual(ts: LogicalTimestamp): boolean {
    return this.sessionId === ts.sessionId && this.time === ts.time;
  }

  /**
   * @param ts The other timestamp.
   * @returns 1 if current timestamp is larger, -1 if smaller, and 0 otherwise.
   */
  public compare(ts: LogicalTimestamp): -1 | 0 | 1 {
    if (this.time > ts.time) return 1;
    if (this.time < ts.time) return -1;
    if (this.sessionId > ts.sessionId) return 1;
    if (this.sessionId < ts.sessionId) return -1;
    return 0;
  }

  /**
   * Checks if `ts` is contained in a time span starting from this timestamp
   * up until `span` ticks in the future.
   *
   * @param span Time span clock ticks.
   * @param ts Timestamp which to check if it fits in the time span.
   * @returns True if timestamp is contained within the time span.
   */
  public inSpan(span: number, ts: LogicalTimestamp, tsSpan: number): boolean {
    if (this.sessionId !== ts.sessionId) return false;
    if (this.time > ts.time) return false;
    if (this.time + span < ts.time + tsSpan) return false;
    return true;
  }

  /**
   * Check if two time intervals have any part overlapping. Returns the length
   * of the overlapping span.
   *
   * @param span Span of the current timestamp.
   * @param ts The other timestamp.
   * @param tsSpan Span of the other timestamp.
   * @returns Size of the overlapping time span.
   */
  public overlap(span: number, ts: LogicalTimestamp, tsSpan: number): number {
    if (this.sessionId !== ts.sessionId) return 0;
    const x1 = this.time;
    const x2 = x1 + span;
    const y1 = ts.time;
    const y2 = y1 + tsSpan;
    const min = Math.max(x1, y1);
    const max = Math.min(x2, y2);
    const diff = max - min;
    return diff <= 0 ? 0 : diff;
  }

  /**
   * @returns Returns a new timestamps with the same session ID and time advanced
   *          by the number of specified clock cycles.
   */
  public tick(cycles: number): LogicalTimestamp {
    return new LogicalTimestamp(this.sessionId, this.time + cycles);
  }

  public interval(cycles: number, span: number): LogicalTimespan {
    return new LogicalTimespan(this.sessionId, this.time + cycles, span);
  }

  public toString() {
    // "!" is used as separator as it has the lowest ASCII value.
    return this.sessionId + '!' + this.time;
  }

  /**
   * Similar to `toString()` but shortens the `sessionId`.
   */
  public toDisplayString() {
    let session = String(this.sessionId);
    if (session.length > 4) session = '..' + session.substr(session.length - 4);
    return session + '!' + this.time;
  }

  /**
   * @returns Returns logical clock which starts from this timestamp.
   */
  public clock(): LogicalClock {
    return new LogicalClock(this.sessionId, this.time);
  }

  public compact(): string {
    return this.sessionId + ',' + this.time;
  }
}

/**
 * Similar to LogicalTimestamp, but represents an interval, instead of just a
 * single time point.
 */
export class LogicalTimespan extends LogicalTimestamp {
  constructor(sessionId: number, time: number, public span: number) {
    super(sessionId, time);
  }
}

/**
 * A single logical clock. Session ID is a random identifier randomly assigned
 * to each new editing session. (It could be called "actorId" or "clientId", but
 * the same user can have multiple editing sessions, hence "sessionId" is better.)
 *
 * The `time` component is a monotonically increasing integer, starting from 0.
 * It does not produce gaps. The `tick()` method should be used to increment the time.
 * When the time is incremented by multiple cycles, say 10, i.e. `clock.tick(10)`, it
 * means that the user has implicitly generated 10 logical timestamps, but only
 * the first one is returned. This means that the user has 10 consecutive operations
 * which they wish to identify by a single LogicalTimestamp for space saving purposes,
 * but it is possible find the exact operation for each distinct implicit logical timestamp.
 */
export class LogicalClock extends LogicalTimestamp {
  public sessionId: number;
  public time: number;

  constructor(sessionId: number, time: number) {
    super(sessionId, 0);
    this.sessionId = sessionId;
    this.time = time;
  }

  /**
   * Returns the current clock timestamp and advances the clock given number of ticks.
   */
  public tick(cycles: number): LogicalTimestamp {
    const timestamp = new LogicalTimestamp(this.sessionId, this.time);
    this.time += cycles;
    return timestamp;
  }
}

export class VectorClock extends LogicalClock {
  /**
   * Mapping of session IDs to logical timestamps.
   */
  public readonly clocks = new Map<number, LogicalTimestamp>();

  constructor(sessionId: number, time: number) {
    super(sessionId, time);
    this.clocks.set(sessionId, this);
  }

  /**
   * Advances clocks when we observe higher time values.
   *
   * @param ts Operation timestamp that was observed.
   */
  public observe(ts: LogicalTimestamp, span: number) {
    const time = ts.time + span - 1;
    const clock = this.clocks.get(ts.sessionId);
    if (!clock) this.clocks.set(ts.sessionId, ts.tick(span - 1));
    else if (time > clock.time) clock.time = ts.time;
    if (time >= this.time) this.time = time + 1;
  }

  /**
   * Serializes the vector clock into a JSON string.
   *
   * - Output is a plain array with just number entries.
   * - Each two subsequent numbers represent a (session ID, time) tuple.
   * - The first tuple is the local clock.
   */
  public serialize(): json_string<number[]> {
    let str: string = '[' + this.sessionId + ',' + this.time;
    for (const clock of this.clocks.values())
      if (clock.sessionId !== this.sessionId) str += ',' + clock.sessionId + ',' + clock.time;
    return (str + ']') as json_string<number[]>;
  }

  public static deserialize(data: number[]): VectorClock {
    const [sessionId, time] = data;
    const clock = new VectorClock(sessionId, time);
    const length = data.length;
    let i = 2;
    while (i < length) {
      const sessionId = data[i++];
      const time = data[i++];
      clock.observe(new LogicalTimestamp(sessionId, time), 1);
    }
    return clock;
  }

  public fork(sessionId: number): VectorClock {
    const clock = new VectorClock(sessionId, this.time);
    for (const ts of this.clocks.values()) clock.observe(ts.tick(0), 1);
    return clock;
  }

  public clone(): VectorClock {
    return this.fork(this.sessionId);
  }
}
