import type {EditorView} from 'codemirror';
import type {SimpleChange, EditorFacade} from '@jsonjoy.com/collaborative-str';

export class CodemirrorEditorFacade implements EditorFacade {
  public onchange?: (changes: SimpleChange[] | void) => void;
  public onselection?: () => void;

  private disposed = false;
  private readonly d0: EditorView['dispatch'];
  private readonly d1: EditorView['dispatch'];

  constructor(protected readonly editor: EditorView) {
    this.d0 = editor.dispatch;
    this.d1 = (...specs: any) => {
      const res = this.d0!.apply(this.editor, specs);
      if (this.disposed) return res;
      this.onchange?.();
      this.onselection?.();
      return res;
    };
    Object.defineProperty(editor, 'dispatch', {
      ...Object.getOwnPropertyDescriptor(editor, 'dispatch'),
      value: this.d1,
    });
  }

  public get(): string {
    return this.editor.state.doc.toString();
  }

  public getLength(): number {
    return this.editor.state.doc.length;
  }

  public set(text: string): void {
    const editor = this.editor;
    const state = editor.state;
    this.d0({
      changes: {
        from: 0,
        to: state.doc.length,
        insert: text,
      },
    });
  }

  public ins(from: number, insert: string): void {
    this.d0({changes: {from, insert}});
  }

  public del(from: number, length: number): void {
    this.d0({
      changes: {
        from,
        to: from + length,
        insert: '',
      },
    });
  }

  public getSelection(): [number, number, -1 | 0 | 1] | null {
    const state = this.editor.state;
    const range = state.selection?.ranges[0];
    if (!range) return null;
    let start = range.anchor;
    let end = range.head;
    let direction: -1 | 0 | 1 = 1;
    if (end < start) {
      [start, end] = [end, start];
      direction = -1;
    }
    return [start, end, direction];
  }

  public setSelection(start: number, end: number, direction: -1 | 0 | 1): void {
    let anchor = start;
    let head = end;
    if (direction === -1) [anchor, head] = [head, anchor];
    this.d0?.({selection: {anchor, head}});
  }

  public dispose(): void {
    this.disposed = true;
    const editor = this.editor;
    const descriptor = Object.getOwnPropertyDescriptor(editor, 'dispatch');
    if (descriptor?.value === this.d1) {
      Object.defineProperty(editor, 'dispatch', {
        ...descriptor,
        value: this.d0,
      });
    }
  }
}
