import type {SimpleChange, EditorFacade, Selection, CollaborativeStr} from '@jsonjoy.com/collaborative-str';

export class InputEditor implements EditorFacade {
  public selection!: Selection;
  public onchange?: (change: SimpleChange[] | void, verify?: boolean) => void;
  public onselection?: () => void;

  constructor(
    protected readonly str: () => CollaborativeStr,
    protected readonly input: HTMLInputElement | HTMLTextAreaElement,
  ) {
    input.addEventListener('input', this.onInput as any);
    document.addEventListener('selectionchange', this.onSelectionChange);
  }

  public get(): string {
    return this.input.value;
  }

  public getLength(): number {
    return this.input.value.length;
  }

  public set(text: string): void {
    this.input.value = text;
  }

  public ins(position: number, text: string): void {
    const selection = this.getSelection();
    const value = this.get();
    const next = value.slice(0, position) + text + value.slice(position);
    this.set(next);
    if (selection) {
      let [start, end] = selection;
      const length = text.length;
      if (start >= position) start += length;
      if (end > position) end += length;
      this.setSelection(start, end, selection[2]);
    }
  }

  public del(position: number, length: number): void {
    const selection = this.getSelection();
    const value = this.get();
    const next = value.slice(0, position) + value.slice(position + length);
    this.set(next);
    if (selection) {
      let [start, end] = selection;
      if (start >= position) start = Math.max(position, start - length);
      if (end >= position) end = Math.max(position, end - length);
      this.setSelection(start, end, selection[2]);
    }
  }

  public getSelection(): [number, number, -1 | 0 | 1] | null {
    const input = this.input;
    const {selectionStart, selectionEnd, selectionDirection} = input;
    const direction = selectionDirection === 'backward' ? -1 : selectionDirection === 'forward' ? 1 : 0;
    return [
      typeof selectionStart === 'number' ? selectionStart : -1,
      typeof selectionEnd === 'number' ? selectionEnd : -1,
      direction,
    ];
  }

  public setSelection(start: number, end: number, direction: -1 | 0 | 1): void {
    const input = this.input;
    input.selectionStart = start > -1 ? start : null;
    input.selectionEnd = end > -1 ? end : null;
    input.selectionDirection = direction === -1 ? 'backward' : direction === 1 ? 'forward' : 'none';
  }

  protected emitChange(event: InputEvent): void {
    if (event.isComposing) return;
    switch (event.inputType) {
      case 'insertText': {
        const data = event.data;
        if (!data || data.length !== 1) break;
        const {selectionStart, selectionEnd} = this.input;
        if (selectionStart === null || selectionEnd === null) break;
        if (selectionStart !== selectionEnd) break;
        if (selectionStart <= 0) break;
        const selection = this.selection;
        if (selectionStart - data.length !== selection.start) break;
        if (typeof selection.end !== 'number' || typeof selection.end !== 'number') break;
        const remove = selection.end - selection.start;
        const change: SimpleChange = [selection.start, remove, data];
        this.onchange!([change]);
        return;
      }
      case 'deleteContentBackward': {
        const {start, end} = this.selection;
        if (typeof start !== 'number' || typeof end !== 'number') break;
        const change: SimpleChange = start === end ? [start - 1, 1, ''] : [start, end - start, ''];
        this.onchange!([change]);
        return;
      }
      case 'deleteContentForward': {
        const {start, end} = this.selection;
        if (typeof start !== 'number' || typeof end !== 'number') break;
        const change: SimpleChange = start === end ? [start, 1, ''] : [start, end - start, ''];
        this.onchange!([change]);
        return;
      }
      case 'deleteByCut': {
        const {start, end} = this.selection;
        if (typeof start !== 'number' || typeof end !== 'number') break;
        if (start === end) break;
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        const view = this.str().view();
        const input = this.input;
        const value = input.value;
        if (view.length - value.length !== max - min) break;
        const change: SimpleChange = [min, max - min, ''];
        this.onchange!([change]);
        return;
      }
      case 'insertFromPaste': {
        const {start, end} = this.selection;
        if (typeof start !== 'number' || typeof end !== 'number') break;
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        const view = this.str().view();
        const input = this.input;
        const value = input.value;
        const newMax = Math.max(input.selectionStart ?? 0, input.selectionEnd ?? 0);
        if (newMax <= min) break;
        const remove = max - min;
        const insert = value.slice(min, newMax);
        if (value.length !== view.length - remove + insert.length) return;
        const change: SimpleChange = [min, remove, insert];
        this.onchange!([change]);
        return;
      }
    }
    this.onchange!();
  }

  private readonly onInput = (event: Event) => {
    this.emitChange(event as InputEvent);
  };

  private readonly onSelectionChange = () => {
    this.onselection!();
  };

  public dispose(): void {
    this.input.removeEventListener('input', this.onInput as any);
    document.removeEventListener('selectionchange', this.onSelectionChange);
  }
}
