import type {Ace, Range} from 'ace-builds';
import type {SimpleChange, EditorFacade} from '@jsonjoy.com/collaborative-str';

export class AceEditorFacade implements EditorFacade {
  public onchange?: (changes: SimpleChange[] | void) => void;

  constructor(protected readonly editor: Ace.Editor) {
    editor.on('change', this.onChange);
  }

  private readonly onChange = (delta: Ace.Delta) => {
    if (delta && typeof delta === 'object' && delta.start && delta.end) {
      const doc = this.editor.session.doc;
      const start = doc.positionToIndex(delta.start);
      const text = delta.lines.join('\n');
      switch (delta.action) {
        case 'insert':
          // console.log([start, 0, text]);
          this.onchange?.([[start, 0, text]]);
          break;
        case 'remove':
          // console.log([start, text.length, '']);
          this.onchange?.([[start, text.length, '']]);
          break;
        default:
          this.onchange?.();
      }
    } else this.onchange?.();
  };

  public get(): string {
    return this.editor.getValue();
  }

  public getLength(): number {
    const doc = this.editor.session.doc;
    const nl = doc.getNewLineCharacter().length;
    const lines = doc.getAllLines();
    let length = 0;
    for (let i = 0; i < lines.length; i++) length += lines[i].length + nl;
    length -= nl;
    return length;
  }

  public set(text: string): void {
    this.editor.setValue(text);
  }

  public ins(pos: number, text: string): void {
    const session = this.editor.session;
    const doc = session.doc;
    const position = doc.indexToPosition(pos, 0);
    session.insert(position, text);
  }

  public del(pos: number, len: number): void {
    const session = this.editor.session;
    const doc = session.doc;
    const R = session.selection.getRange().constructor as typeof Range;
    const start = doc.indexToPosition(pos, 0);
    const end = doc.indexToPosition(pos + len, 0);
    const range = new R(start.row, start.column, end.row, end.column);
    session.remove(range);
  }

  public dispose(): void {
    this.editor.off('change', this.onChange);
  }
}
