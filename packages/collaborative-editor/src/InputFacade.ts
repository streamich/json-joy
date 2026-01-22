import type {Selection} from './Selection';
import type {EditorFacade, SimpleChange} from './types';

export class InputFacade0 implements EditorFacade {
  constructor(protected readonly input: HTMLInputElement | HTMLTextAreaElement) {}

  public get(): string {
    return this.input.value;
  }

  public set(text: string): void {
    this.input.value = text;
  }
}

export class InputFacade1 extends InputFacade0 {
  public onchange?: (change: SimpleChange[] | void) => void;

  protected readonly onInput: (e: Event) => void = (e) => {
    this._onInput(e);
  };

  protected _onInput(): void;
  protected _onInput(e: Event): void;
  protected _onInput(): void {
    this.onchange?.();
  }

  constructor(protected readonly input: HTMLInputElement | HTMLTextAreaElement) {
    super(input);
    input.addEventListener('input', this.onInput as any);
  }

  public getLength(): number {
    return this.input.value.length;
  }

  public dispose(): void {
    this.input.removeEventListener('input', this.onInput as any);
  }
}

export class InputFacade2 extends InputFacade1 {
  public onselection?: () => void;

  constructor(protected readonly input: HTMLInputElement | HTMLTextAreaElement) {
    super(input);
    document.addEventListener('selectionchange', this.onSelectionChange);
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

  private readonly onSelectionChange = () => {
    this.onselection?.();
  };

  public dispose(): void {
    super.dispose();
    document.removeEventListener('selectionchange', this.onSelectionChange);
  }
}

export class InputFacade3 extends InputFacade2 {
  public selection!: Selection;

  protected _onInput(e?: Event): void {
    const event = e as InputEvent;
    const {input} = this;
    const {data, inputType, isComposing} = event;
    if (isComposing) return;
    switch (inputType) {
      case 'insertText': {
        if (!data || data.length !== 1) break;
        const {selectionStart, selectionEnd} = input;
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
    }
    this.onchange!();
  }
}

export class InputFacade4 extends InputFacade3 {
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
}
