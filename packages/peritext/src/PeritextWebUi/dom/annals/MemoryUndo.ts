import type {UndoManager, UndoItem} from '../../types';
import type {UiLifeCycles} from '../../types';

/**
 * A Memory-based undo manager.
 */
export class MemoryUndo implements UndoManager, UiLifeCycles {
  /** Undo stack. */
  public uStack: UndoItem[] = [];
  /** Redo stack. */
  public rStack: UndoItem[] = [];

  // /** ------------------------------------------------------ {@link UndoRedo} */

  public push<U, R>(undo: UndoItem<U, R>): void {
    this.rStack = [];
    this.uStack.push(undo as UndoItem);
  }

  undo(): void {
    const undo = this.uStack.pop();
    if (undo) {
      const redo = undo[1](undo[0]);
      this.rStack.push(redo);
    }
  }

  redo(): void {
    const redo = this.rStack.pop();
    if (redo) {
      const undo = redo[1](redo[0]);
      this.uStack.push(undo);
    }
  }

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public start() {
    return () => {};
  }
}
