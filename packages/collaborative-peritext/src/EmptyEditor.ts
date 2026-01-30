import type {RichtextEditorFacade, SimpleChange} from './types';

export class EmptyEditor implements RichtextEditorFacade {
  public onchange?: (change: SimpleChange[] | void) => void;
  public onselection?: () => void;

  constructor(protected readonly input: HTMLInputElement | HTMLTextAreaElement) {
    throw new Error('Not implemented');
  }

  public get(): string {
    throw new Error('Not implemented');
  }

  public getLength(): number {
    throw new Error('Not implemented');
  }

  public set(): void {
    throw new Error('Not implemented');
  }

  public getSelection(): [number, number, -1 | 0 | 1] | null {
    throw new Error('Not implemented');
  }

  public setSelection(): void {
    throw new Error('Not implemented');
  }

  public dispose(): void {
    throw new Error('Not implemented');
  }
}
