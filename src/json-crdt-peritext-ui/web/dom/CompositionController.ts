import type {Printable} from 'tree-dump';
import type {PeritextEventTarget} from '../../events/PeritextEventTarget';
import type {UiLifeCycles} from '../types';
import type {Peritext} from '../../../json-crdt-extensions/peritext';

export interface CompositionControllerOpts {
  source: HTMLElement;
  txt: Peritext;
  et: PeritextEventTarget;
}

export class CompositionController implements UiLifeCycles, Printable {
  public composing = false;
  public data: string = '';

  public constructor(public readonly opts: CompositionControllerOpts) {}

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public start(): void {
    const el = this.opts.source;
    el.addEventListener('compositionstart', this.onStart);
    el.addEventListener('compositionupdate', this.onUpdate);
    el.addEventListener('compositionend', this.onEnd);
  }

  public stop(): void {
    const el = this.opts.source;
    el.removeEventListener('compositionstart', this.onStart);
    el.removeEventListener('compositionupdate', this.onUpdate);
    el.removeEventListener('compositionend', this.onEnd);
  }

  private onStart = (event: CompositionEvent): void => {
    this.composing = true;
    this.data = event.data;
  };

  private onUpdate = (event: CompositionEvent): void => {
    this.composing = true;
    this.data = event.data;
  };

  private onEnd = (event: CompositionEvent): void => {
    this.composing = false;
    this.data = '';
    const text = event.data;
    if (text) this.opts.et.insert(text);
  };

  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab?: string): string {
    return `composition { composing: ${this.composing}, data: ${JSON.stringify(this.data)} }`;
  }
}
