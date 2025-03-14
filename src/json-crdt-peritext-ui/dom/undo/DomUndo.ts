import type {UndoManager, UndoItem} from '../../types';
import type {UiLifeCycles} from '../types';

/**
 * A DOM-based undo manager. Integrates with native undo/redo functionality of
 * the browser. Supports user Ctrl+Z and Ctrl+Shift+Z shortcuts and application
 * context menu undo/redo events.
 */
export class DomUndo implements UndoManager, UiLifeCycles {
  /** Whether we are in a process of pushing a new undo item. */
  private _push: boolean = false;
  /** The DOM element, which keeps text content for native undo/redo integration. */
  protected el!: HTMLElement;
  /** The last known text contents length of the `el`.  */
  protected tlen: number = 0;
  /** Undo stack. */
  public undo: UndoItem[] = [];
  /** Redo stack. */
  public redo: UndoItem[] = [];

  // /** ------------------------------------------------------ {@link UndoRedo} */

  public push<U, R>(undo: UndoItem<U, R>): void {
    const el = this.el;
    // TODO: restore previous selection (multiple ranges), not just focus
    const activeElement = document.activeElement;
    try {
      this._push = true;
      const style = el.style;
      this.undo.push(undo as UndoItem);
      this.redo = [];
      style.visibility = 'visible';
      el.focus();
      document.execCommand?.('insertText', false, '|');
    } finally {
      el.blur();
      this._push = false;
      // style.visibility = 'hidden';
      (activeElement as HTMLElement)?.focus?.();
    }
  }

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public start(): void {
    const el = this.el = document.createElement('div');
    el.tabIndex = -1;
    el.contentEditable = 'true';
    el.setAttribute('aria-hidden', 'true');
    const style = el.style;
    // style.opacity = '0';
    style.position = 'fixed';
    // style.top = '-1000px';
    style.top = '10px';
    style.left = '10px';
    style.pointerEvents = 'none';
    // style.fontSize = '2px';
    style.fontSize = '8px';
    // style.visibility = 'hidden';
    document.body.appendChild(el);
    el.addEventListener('focus', this.onFocus);
    el.addEventListener('input', this.onInput);
  }

  public stop(): void {
    const el = this.el;
    document.body.removeChild(el);
    el.removeEventListener('focus', this.onFocus);
    el.removeEventListener('input', this.onInput);
  }

  public readonly onFocus = () => {
    setTimeout(() => this.el.blur(), 0);
  };

  public readonly onInput = () => {
    if (this._push) {
      console.log('onInput PUSH');
      // callback(this.data);
    } else {
      console.log('onInput HISTORY');
    }
  };
}
