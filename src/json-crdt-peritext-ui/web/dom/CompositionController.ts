import type {Printable} from 'tree-dump';
import type {UiLifeCycles} from '../types';
import type {DomController} from './DomController';

export class CompositionController implements UiLifeCycles, Printable {
  public composing = false;
  public data: string = '';

  public constructor(public readonly dom: DomController) {}

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public start() {
    const onStart = (event: CompositionEvent): void => {
      this.composing = true;
      this.data = event.data;
    };
    const onUpdate = (event: CompositionEvent): void => {
      this.composing = true;
      this.data = event.data;
    };
    const onEnd = (event: CompositionEvent): void => {
      this.composing = false;
      this.data = '';
      const text = event.data;
      if (text) this.dom.et.insert(text);
    };
    const el = this.dom.el;
    el.addEventListener('compositionstart', onStart);
    el.addEventListener('compositionupdate', onUpdate);
    el.addEventListener('compositionend', onEnd);
    return () => {
      el.removeEventListener('compositionstart', onStart);
      el.removeEventListener('compositionupdate', onUpdate);
      el.removeEventListener('compositionend', onEnd);
    };
  }

  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab?: string): string {
    return `composition { composing: ${this.composing}, data: ${JSON.stringify(this.data)} }`;
  }
}
