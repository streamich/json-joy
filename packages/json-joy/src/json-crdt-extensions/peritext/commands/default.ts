import type {Peritext} from '../Peritext';
import type {PeritextEventTarget} from '../events/PeritextEventTarget';

export interface PeritextDefaultCommands {
  Caret(gap: number): void;
  Delete(): void;
  Insert(text: string): void;
  MoveLeft(steps?: number): void;
  MoveRight(steps?: number): void;
  CharLeft(): string;
  CharRight(): string;
}

export class CommandsImpl implements PeritextDefaultCommands {
  constructor(
    public readonly txt: Peritext,
    public readonly et: PeritextEventTarget,
  ) {}

  public Caret(gap: number): void {
    this.et.cursor({at: [Number(gap)]});
  }

  public Delete(): void {
    this.et.delete({});
  }

  public Insert(text: string): void {
    this.et.insert(text + '');
  }

  public MoveLeft(steps: number = 1): void {
    this.et.cursor({move: [['focus', 'vchar', -steps, true]]});
  }

  public MoveRight(steps: number = 1): void {
    this.et.cursor({move: [['focus', 'vchar', steps, true]]});
  }

  public CharLeft(): string {
    return this.txt.editor.mainCursor()?.focus().leftChar()?.view() || '';
  }

  public CharRight(): string {
    return this.txt.editor.mainCursor()?.focus().rightChar()?.view() || '';
  }
}
