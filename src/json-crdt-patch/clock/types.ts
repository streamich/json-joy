/**
 * Represents a unique logical timestamp used to identify things such as
 * objects, chunks and operations in a document.
 */
export interface ITimestamp {
  time: number;

  getSessionId(): number;

  /**
   * @returns True if timestamps are equal.
   */
  isEqual(ts: ITimestamp): boolean;

  /**
   * @param ts The other timestamp.
   * @returns 1 if current timestamp is larger, -1 if smaller, and 0 otherwise.
   */
  compare(ts: ITimestamp): -1 | 0 | 1;

  /**
   * Checks if `ts` is contained in a time span starting from this timestamp
   * up until `span` ticks in the future.
   *
   * @param span Time span clock ticks.
   * @param ts Timestamp which to check if it fits in the time span.
   * @returns True if timestamp is contained within the time span.
   */
  inSpan(span: number, ts: ITimestamp, tsSpan: number): boolean;

  /**
   * Check if two time intervals have any part overlapping. Returns the length
   * of the overlapping span.
   *
   * @param span Span of the current timestamp.
   * @param ts The other timestamp.
   * @param tsSpan Span of the other timestamp.
   * @returns Size of the overlapping time span.
   */
  overlap(span: number, ts: ITimestamp, tsSpan: number): number;

  /**
   * @returns Returns a new timestamps with the same session ID and time advanced
   *          by the number of specified clock cycles.
   */
  tick(cycles: number): ITimestamp;

  interval(cycles: number, span: number): ITimespan;

  toString(): string;

  /**
   * Similar to `toString()` but shortens the `sessionId`.
   */
  toDisplayString(): string;

  /**
   * @returns Returns logical clock which starts from this timestamp.
   */
  clock(): IClock;

  compact(): string;
}

/**
 * Similar to ITimestamp, but represents an interval, instead of just a
 * single time point.
 */
export interface ITimespan extends ITimestamp {
  /**
   * Length of the time interval.
   */
  span: number;
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
export interface IClock extends ITimestamp {
  /**
   * Returns the current clock timestamp and advances the clock given number of
   * ticks.
   */
  tick(cycles: number): ITimestamp;
}

/** A vector clock. Used in CRDT Model. */
export interface IVectorClock extends IClock {
  /**
   * Mapping of session IDs to logical timestamps.
   */
  readonly clocks: Map<number, ITimestamp>;

  /**
   * Advances clocks when we observe higher time values.
   *
   * @param ts Operation timestamp that was observed.
   */
  observe(ts: ITimestamp, span: number): void;

  /** Copy the clock while keeping the same session ID. */
  clone(): IVectorClock;

  /** Copy the clock with a new session ID. */
  fork(sessionId: number): IVectorClock;
}
