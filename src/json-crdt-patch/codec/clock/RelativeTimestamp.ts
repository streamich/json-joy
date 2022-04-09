/**
 * Relative timestamp, which can be decoded give a table
 * of clocks.
 */
export class RelativeTimestamp {
  /**
   * 
   * @param sessionIndex Index of the clock in clock table.
   * @param timeDiff Time difference relative to the clock time from the table.
   */
  public constructor(public readonly sessionIndex: number, public readonly timeDiff: number) {}

  public toJson() {
    return [this.sessionIndex, this.timeDiff];
  }

  public compact(): string {
    return this.sessionIndex + ',' + this.timeDiff;
  }

  public encode(buf: Uint8Array, offset: number): number {
    return 0;
  }

  public push(arr: unknown[]) {
    arr.push(this.sessionIndex, this.timeDiff);
  }
}
