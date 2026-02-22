import type {SimpleChange, EditorFacade, Selection, EditorSelection} from '@jsonjoy.com/collaborative-str';
import * as monaco from 'monaco-editor';

export class MonacoEditorFacade implements EditorFacade {
  public selection!: Selection;
  public onchange?: (changes: SimpleChange[] | void) => void;
  public onselection?: () => void;

  private readonly modelChangeDisposable: monaco.IDisposable;
  private readonly selectionDisposable: monaco.IDisposable;

  constructor(protected readonly editor: monaco.editor.IStandaloneCodeEditor) {
    this.modelChangeDisposable = editor.onDidChangeModelContent((event) => {
      const rawChanges = event.changes.sort((c1, c2) => c2.rangeOffset - c1.rangeOffset);
      const changes: SimpleChange[] = [];
      const length = rawChanges.length;
      for (let i = 0; i < length; i++) {
        const {rangeOffset, rangeLength, text} = rawChanges[i];
        changes.push([rangeOffset, rangeLength, text]);
      }
      this.onchange?.(changes);
    });
    this.selectionDisposable = editor.onDidChangeCursorSelection(() => this.onselection?.());
  }

  public get(): string {
    return this.editor.getValue();
  }

  public getLength(): number {
    return this.editor.getModel()!.getValueLength();
  }

  public set(text: string): void {
    this.editor.setValue(text);
  }

  private getRange(offset: number, length: number): monaco.IRange {
    const model = this.editor.getModel()!;
    const start = model.getPositionAt(offset);
    const end = length ? model.getPositionAt(offset + length) : start;
    return new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column);
  }

  public ins(pos: number, text: string): void {
    const range = this.getRange(pos, 0);
    this.editor.getModel()?.applyEdits([{range, text}]);
  }

  public del(pos: number, length: number): void {
    const range = this.getRange(pos, length);
    this.editor.getModel()?.applyEdits([{range, text: ''}]);
  }

  public getSelection(): EditorSelection | null {
    const editor = this.editor;
    const selection = editor.getSelection();
    if (!selection) return null;
    const model = editor.getModel();
    if (!model) return null;
    const start = model.getOffsetAt(selection.getSelectionStart());
    const end = model.getOffsetAt(selection.getPosition());
    const direction = selection.getDirection() === monaco.SelectionDirection.LTR ? 1 : -1;
    const editorSelection: EditorSelection = [start, end, direction];
    return editorSelection;
  }

  public setSelection(start: number, end: number, direction: -1 | 0 | 1): void {
    const editor = this.editor;
    const model = editor.getModel();
    if (!model) return;
    let startPosition = model.getPositionAt(start);
    let endPosition = model.getPositionAt(end);
    if (direction === -1) [startPosition, endPosition] = [endPosition, startPosition];
    const selection = new monaco.Selection(
      startPosition.lineNumber,
      startPosition.column,
      endPosition.lineNumber,
      endPosition.column,
    );
    editor.setSelection(selection);
  }

  public dispose(): void {
    this.modelChangeDisposable.dispose();
    this.selectionDisposable.dispose();
  }
}
