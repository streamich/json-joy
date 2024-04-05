/**
 * Represents an object which state can change over time.
 */
export interface Stateful {
  /**
   * Hash of the current state. Updated by calling `refresh()`.
   */
  hash: number;

  /**
   * Recomputes object's hash.
   * @returns The new hash.
   */
  refresh(): number;
}
