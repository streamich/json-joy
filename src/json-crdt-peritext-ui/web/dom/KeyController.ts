import type {Printable} from 'tree-dump';
import type {UiLifeCycles} from '../types';
import type {DomController} from './DomController';

export interface KeyControllerOpts {}

/**
 * Keeps track of all pressed down keys.
 */
export class KeyController implements UiLifeCycles, Printable {
  /**
   * All currently pressed keys.
   */
  public readonly pressed = new Set<string>();

  public constructor(public readonly dom: DomController) {}

  public start() {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.isComposing || event.key === 'Dead') return;
      this.pressed.add(event.key);
    };
    const onKeyUp = (event: KeyboardEvent): void => {
      if (event.isComposing || event.key === 'Dead') return;
      this.pressed.delete(event.key);
    };
    const onReset = (): void => {
      this.pressed.clear();
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('focus', onReset);
    document.addEventListener('compositionstart', onReset);
    document.addEventListener('compositionend', onReset);
    const el = this.dom.el;
    el.addEventListener('blur', onReset);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('focus', onReset);
      document.removeEventListener('compositionstart', onReset);
      document.removeEventListener('compositionend', onReset);
      el.removeEventListener('blur', onReset);
    };
  }

  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab?: string): string {
    return `keys { pressed: [ ${[...this.pressed].map((key) => JSON.stringify(key)).join(', ')} ] }`;
  }
}
