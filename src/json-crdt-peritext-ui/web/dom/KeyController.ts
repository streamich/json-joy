import type {Printable} from 'tree-dump';
import type {UiLifeCycles} from '../types';

export interface KeyControllerOpts {
  source: HTMLElement;
}

/**
 * Keeps track of all pressed down keys.
 */
export class KeyController implements UiLifeCycles, Printable {
  /**
   * All currently pressed keys.
   */
  public readonly pressed = new Set<string>();

  public constructor(protected readonly opts: KeyControllerOpts) {}

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
    this.opts.source.addEventListener('blur', onReset);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('focus', onReset);
      document.removeEventListener('compositionstart', onReset);
      document.removeEventListener('compositionend', onReset);
      this.opts.source.removeEventListener('blur', onReset);
    };
  }

  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab?: string): string {
    return `keys { pressed: [ ${[...this.pressed].map((key) => JSON.stringify(key)).join(', ')} ] }`;
  }
}
