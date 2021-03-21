/**
 * Immutable timestamp, represents a single point int time of a LogicalClock.
 * Logical timestamps are used to identify every CRDT operation.
 * 
 * `time` component is left mutable, so VectorClock can mutate it without needing
 * to create a new object.
 */
export class LogicalTimestamp {
  constructor (public readonly sessionId: number, public time: number) {}

  public isEqual(ts: LogicalTimestamp) {
    return (this.sessionId === ts.sessionId) && (this.time === ts.time);
  }

  public compare(ts: LogicalTimestamp): -1 | 0 | 1 {
    if (this.time > ts.time) return 1;
    if (this.time < ts.time) return -1;
    if (this.sessionId > ts.sessionId) return 1;
    if (this.sessionId < ts.sessionId) return -1;
    return 0;
  }

  public toString() {
    // "!" is used as separator as it has the lowest ASCII value.
    return this.sessionId + '!' + this.time;
  }

  /**
   * @returns Returns logical clock which starts from this timestamp.
   */
  public clock(): LogicalClock {
    return new LogicalClock(this.sessionId, this.time);
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

  constructor (sessionId: number, time: number) {
    super(sessionId, 0);
    this.sessionId = sessionId;
    this.time = time;
  }

  public tick(cycles: number): LogicalTimestamp {
    const timestamp = new LogicalTimestamp(this.sessionId, this.time);
    this.time += cycles;
    return timestamp;
  }
}

export class VectorClock {
  /**
   * Mapping of session IDs to logical timestamps.
   */
  public readonly clocks = new Map<number, LogicalTimestamp>();
}
