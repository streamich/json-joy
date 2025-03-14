export interface UndoRedoCollector {
  /**
   * Marks whether the collector is currently capturing events for undo/redo.
   * Can be mutated to turn on/off capturing.
   */
  // live: boolean;

  /**
   * Captures events for undo/redo withing the callback. And sets `live` state
   * to `false` after the callback is executed.
   *
   * @param callback The callback to execute while undo/redo events are being
   *     captured.
   */
  // capture(callback: () => void): void;
  capture(): void;
  // do<State>(state: State, undo: Undo<State>): void;
}

// export type Undo<State> = (state: State) => [state: State, redo: Redo<State>];
// export type Redo<State> = (state: State) => [state: State, undo: Undo<State>];
