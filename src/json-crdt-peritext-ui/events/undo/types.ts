export interface UndoRedo<State> {
  onundo?: (state: State) => void;
  onredo?: (state: State) => void;
  do(state: State): void;
}
