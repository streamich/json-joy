import type {UiLifeCycles} from './types';

/**
 * Keeps track of all pressed down keys.
 */
export class KeyController implements UiLifeCycles {
  /**
   * All currently pressed keys.
   */
  public readonly pressed = new Set<string>();

  public start(): void {
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('focus', this.onFocus);
  }

  public stop(): void {
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('focus', this.onFocus);
  }


  private onKeyDown = (event: KeyboardEvent): void => {
    this.pressed.add(event.key);
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    this.pressed.delete(event.key);
  };

  private onFocus = (): void => {
    this.pressed.clear();
  };
}
