import {saveSelection} from 'json-joy/lib/util/dom';
import type {UndoManager, UndoItem} from '../../types';
import type {UiLifeCycles} from '../../types';

/**
 * A DOM-based undo manager. Integrates with native undo/redo functionality of
 * the browser. Supports user Ctrl+Z and Ctrl+Shift+Z shortcuts and application
 * context menu undo/redo events.
 */
export class WebUndo implements UndoManager, UiLifeCycles {
  /** Whether we are in a process of pushing a new undo item. */
  private _push: boolean = false;
  /** The DOM element, which keeps text content for native undo/redo integration. */
  protected el!: HTMLElement;
  /** Undo stack. */
  public uStack: UndoItem[] = [];
  /** Redo stack. */
  public rStack: UndoItem[] = [];

  protected _undo() {
    const undo = this.uStack.pop();
    if (undo) {
      const redo = undo[1](undo[0]);
      this.rStack.push(redo);
    }
  }

  protected _redo() {
    const redo = this.rStack.pop();
    if (redo) {
      const undo = redo[1](redo[0]);
      this.uStack.push(undo);
    }
  }

  // /** ------------------------------------------------------ {@link UndoRedo} */

  public push<U, R>(undo: UndoItem<U, R>): void {
    const el = this.el;
    const restoreSelection = saveSelection();
    try {
      this._push = true;
      this.rStack = [];
      el.setAttribute('aria-hidden', 'false');
      el.focus();
      document.execCommand?.('insertText', false, '.');
      const tlen = this.el.innerText.length;
      if (tlen - 1 === this.uStack.length) this.uStack.push(undo as UndoItem);
    } finally {
      el.blur();
      this._push = false;
      el.setAttribute('aria-hidden', 'true');
      restoreSelection?.();
    }
  }

  undo(): void {
    document?.execCommand?.('undo');
  }

  redo(): void {
    document?.execCommand?.('redo');
  }

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public start() {
    const el = (this.el = document.createElement('div'));
    el.tabIndex = -1;
    el.contentEditable = 'true';
    el.setAttribute('aria-hidden', 'true');
    const style = el.style;
    style.pointerEvents = 'none';
    style.position = 'fixed';
    style.fontSize = '1px';
    style.top = '-1000px';
    style.opacity = '0';
    const body = document.body;
    body.appendChild(el);
    el.addEventListener('focus', this.onFocus);
    el.addEventListener('input', this.onInput);
    return () => {
      body.removeChild(el);
      el.removeEventListener('focus', this.onFocus);
      el.removeEventListener('input', this.onInput);
    };
  }

  public readonly onFocus = () => {
    const el = this.el;
    setTimeout(() => el.blur(), 0);
  };

  public readonly onInput = () => {
    const tlen = this.el.innerText.length;
    if (!this._push) {
      const {uStack: undo, rStack: redo} = this;
      while (undo.length && undo.length > tlen) this._undo();
      while (redo.length && undo.length < tlen) this._redo();
    }
  };
}
