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

/**
 * @todo Unify this with {@link UiLifeCycles}, join interfaces.
 * @todo Rename this to something like "disposable", as it does not have to be
 *     a UI component.
 */
export interface UiLifeCycles {
  /**
   * Called when UI component is mounted. Returns a function to be called when
   * the component is removed from the screen.
   */
  start(): () => void;
}

export {Rect} from 'json-joy/lib/json-crdt-extensions/peritext/events/defaults/ui/types';
