export interface HybridLogicalClock {
  /** Timestamp, wall clock, number in seconds or milliseconds. */
  readonly ts: number;
  /** Monotonically incrementing sequence counter. */
  readonly seq: number;
  /** Process ID (aka site ID, session ID). */
  readonly node: number;
}

/**
 * Hybrid Logical Clock (HLC) as a tuple, used when serializing for storage in
 * CBOR or JSON formats.
 */
export type HlcDto = [ts: number, seq: number, node: number];
