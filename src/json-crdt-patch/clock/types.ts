export interface ITimestampStruct {
  readonly sid: number;

  /**
   * Needs to be mutable in vector clock. Other than that, it should be
   * treated as immutable.
   */
  time: number;
}

/**
 * Similar to ITimestamp, but represents an interval, instead of just a
 * single time point.
 */
export interface ITimespanStruct extends ITimestampStruct {
  /**
   * Length of the time interval.
   */
  readonly span: number;
}

/**
 * Represents a unique logical timestamp used to identify things such as
 * objects, chunks and operations in a document.
 *
 * @deprecated
 */
export interface ITimestamp extends ITimestampStruct {
  toString(): string;
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
export interface IClock extends ITimestampStruct {
  /**
   * Returns the current clock timestamp and advances the clock given number of
   * ticks.
   */
  tick(cycles: number): ITimestampStruct;
}

/** A vector clock. Used in CRDT Model. */
export interface IVectorClock extends IClock {
  /**
   * Mapping of session IDs to logical timestamps.
   */
  readonly peers: Map<number, ITimestampStruct>;

  /**
   * Advances clocks when we observe higher time values.
   *
   * @param ts Operation timestamp that was observed.
   */
  observe(ts: ITimestampStruct, span: number): void;

  /** Copy the clock while keeping the same session ID. */
  clone(): IVectorClock;

  /** Copy the clock with a new session ID. */
  fork(sessionId: number): IVectorClock;

  toString(tab?: string): string;
}
