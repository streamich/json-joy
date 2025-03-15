export interface UndoCollector {
  /**
   * Mark the currently minted change {@link Patch} in {@link Builder} for undo.
   * It will be picked up during the next flush.
   */
  capture(): void;
}

export interface UndoManager {
  push<U, R>(undo: UndoItem<U, R>): void;
}

export type UndoItem<UndoState = unknown, RedoState = unknown> = [state: UndoState, undo: UndoCallback<UndoState, RedoState>];
export type UndoCallback<UndoState = unknown, RedoState = unknown> = (state: UndoState) => RedoItem<RedoState, UndoState>;
export type RedoItem<RedoState = unknown, UndoState = unknown> = [state: RedoState, redo: RedoCallback<RedoState, UndoState>];
export type RedoCallback<RedoState = unknown, UndoState = unknown> = (state: RedoState) => UndoItem<UndoState, RedoState>;