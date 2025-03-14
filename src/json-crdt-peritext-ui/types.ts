export interface UndoCollector {
  /**
   * Captures events for undo/redo withing the callback. And sets `live` state
   * to `false` after the callback is executed.
   *
   * @param callback The callback to execute while undo/redo events are being
   *     captured.
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