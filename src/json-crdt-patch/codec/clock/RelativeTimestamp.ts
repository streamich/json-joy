/**
 * Relative timestamp, which can be decoded give a table
 * of clocks. Session index specifies clock indes in the table.
 */
export class RelativeTimestamp {
  /**
   *
   * @param sessionIndex Index of the clock in clock table.
   * @param timeDiff Time difference relative to the clock time from the table.
   */
  public constructor(
    public readonly sessionIndex: number,
    public readonly timeDiff: number,
  ) {}
}
