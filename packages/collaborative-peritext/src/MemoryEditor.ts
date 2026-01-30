import type {RichtextEditorFacade, EditorSelection, SimpleChange} from './types';

export class MemoryEditor0 implements RichtextEditorFacade {
  public __str: string = '';
  public __cursorStart: number = -1;
  public __cursorEnd: number = -1;
  public __cursorDirection: -1 | 0 | 1 = 0;
  public __onchange = () => {
    this.onchange?.();
  };
  public __onselection = () => {
    this.onselection?.();
  };

  onchange?: (change: SimpleChange[] | void) => void;
  onselection?: () => void;

  public get(): string {
    return this.__str;
  }

  public set(str: string): void {
    this.__str = str;
    if (this.__cursorStart > 0) this.__cursorStart = str.length;
    if (this.__cursorEnd > 0) this.__cursorEnd = str.length;
  }
}

export class MemoryEditor1 extends MemoryEditor0 {
  public getLength(): number {
    return this.__str.length;
  }

  public set(): void {
    throw new Error('.set() should not be needed');
  }

  public ins(position: number, text: string): void {
    this.__str = this.__str.slice(0, position) + text + this.__str.slice(position);
    if (this.__cursorStart > 0 && this.__cursorStart >= position) this.__cursorStart += text.length;
    if (this.__cursorEnd > 0 && this.__cursorEnd >= position) this.__cursorEnd += text.length;
  }

  public del(position: number, length: number): void {
    this.__str = this.__str.slice(0, position) + this.__str.slice(position + length);
    if (this.__cursorStart > 0 && this.__cursorStart >= position)
      this.__cursorStart -= Math.min(length, this.__cursorStart - position);
    if (this.__cursorEnd > 0 && this.__cursorEnd >= position)
      this.__cursorEnd -= Math.min(length, this.__cursorEnd - position);
  }
}

export class MemoryEditor2 extends MemoryEditor1 {
  getSelection?(): EditorSelection | null {
    if (this.__cursorStart < 0) return null;
    if (this.__cursorEnd < 0) return null;
    return [this.__cursorStart, this.__cursorEnd, this.__cursorDirection];
  }

  setSelection?(start: number, end: number, direction: -1 | 0 | 1): void {
    const length = this.__str.length;
    if (start > end) [start, end] = [end, start];
    this.__cursorStart = Math.max(0, Math.min(length, start));
    this.__cursorEnd = Math.max(0, Math.min(length, end));
    this.__cursorDirection = direction;
  }
}
