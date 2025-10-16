export interface UndoCollector {
  /**
   * Mark the currently minted change {@link Patch} in {@link Builder} for undo.
   * It will be picked up during the next flush.
   */
  capture(): void;
}
