export interface UndoRedoCollector {
  do<State>(state: State, undo: Undo<State>): void;
}

export type Undo<State> = (state: State) => [state: State, redo: Redo<State>];
export type Redo<State> = (state: State) => [state: State, undo: Undo<State>];
