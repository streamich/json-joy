export interface UndoItem {
  undo(): RedoItem;
}

export interface RedoItem {
  redo(): UndoItem;
}

export class UndoRedoStack {
  private undoStack: UndoItem[] = [];
  private redoStack: RedoItem[] = [];

  public undoLength(): number {
    return this.undoStack.length;
  }

  public redoLength(): number {
    return this.redoStack.length;
  }

  public push(undo: UndoItem): RedoItem[] {
    const redoStack = this.redoStack;
    this.redoStack = [];
    this.undoStack.push(undo);
    return redoStack;
  }

  public undo(): void {
    const undo = this.undoStack.pop();
    if (!undo) return;
    const redo = undo.undo();
    this.redoStack.push(redo);
  }

  public redo(): void {
    const redo = this.redoStack.pop();
    if (!redo) return;
    const undo = redo.redo();
    this.undoStack.push(undo);
  }
}
