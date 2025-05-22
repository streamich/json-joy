export interface UndoManager {
  push<U, R>(undo: UndoItem<U, R>): void;
  undo(): void;
  redo(): void;
}

export type UndoItem<UndoState = unknown, RedoState = unknown> = [
  state: UndoState,
  undo: UndoCallback<UndoState, RedoState>,
];
export type UndoCallback<UndoState = unknown, RedoState = unknown> = (
  state: UndoState,
) => RedoItem<RedoState, UndoState>;
export type RedoItem<RedoState = unknown, UndoState = unknown> = [
  state: RedoState,
  redo: RedoCallback<RedoState, UndoState>,
];
export type RedoCallback<RedoState = unknown, UndoState = unknown> = (
  state: RedoState,
) => UndoItem<UndoState, RedoState>;
