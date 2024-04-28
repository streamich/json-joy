/**
 * Represents a logical clock timestamp. Logical timestamps are used to identify
 * all JSON CRDT operations, objects, and parts of their contents, e.g. timestamps
 * serve as unique IDs.
 */
export interface ITimestampStruct {
  /**
   * Session ID (or actor ID, site ID, process ID, etc.), a random identifier
   * randomly assigned to each editing session.
   */
  sid: number;

  /**
   * Logical time (or sequence number, tick, etc.), a monotonically increasing
   * integer, starting from 0. It does not produce gaps on local machine, but
   * it can produce gaps when merged with other clocks.
   *
   * Needs to be mutable in vector clock. Other than that, it should be
   * treated as immutable.
   */
  time: number;
}

/**
 * Similar to ITimestamp, but represents a logical time interval, instead of
 * just a single time point.
 */
export interface ITimespanStruct extends ITimestampStruct {
  /**
   * Length of the logical time interval.
   */
  readonly span: number;
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

/**
 * Interface which represents a local clock and a list of remote clocks.
 */
export interface IClockVector extends IClock {
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
  clone(): IClockVector;

  /** Copy the clock with a new session ID. */
  fork(sessionId: number): IClockVector;

  /** Returns a textual human-readable representation, useful for debugging. */
  toString(tab?: string): string;
}
