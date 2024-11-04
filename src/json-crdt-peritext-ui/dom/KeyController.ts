import type {Printable} from 'tree-dump';
import type {UiLifeCycles} from './types';

/**
 * Keeps track of all pressed down keys.
 */
export class KeyController implements UiLifeCycles, Printable {
  /**
   * All currently pressed keys.
   */
  public readonly pressed = new Set<string>();

  public start(): void {
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('focus', this.onReset);
    document.addEventListener('compositionstart', this.onReset);
    document.addEventListener('compositionend', this.onReset);
  }

  public stop(): void {
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('focus', this.onReset);
    document.removeEventListener('compositionstart', this.onReset);
    document.removeEventListener('compositionend', this.onReset);
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.isComposing || event.key === 'Dead') return;
    this.pressed.add(event.key);
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    if (event.isComposing || event.key === 'Dead') return;
    this.pressed.delete(event.key);
  };

  private onReset = (): void => {
    this.pressed.clear();
  };

  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab?: string): string {
    return `keys { pressed: [ ${[...this.pressed].map((key) => JSON.stringify(key)).join(', ')} ] }`;
  }
}
