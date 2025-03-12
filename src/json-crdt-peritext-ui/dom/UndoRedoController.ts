import type {Printable} from 'tree-dump';
import type {UiLifeCycles} from './types';

export class UndoRedoController implements UiLifeCycles, Printable {
  private _duringUpdate: boolean = false;
  private _stack: unknown[] = [];
  private el!: HTMLElement;

  constructor (
    public onundo?: (state: unknown) => void,
    public onredo?: (state: unknown) => void,
  ) {}

  /** ------------------------------------------------------ {@link UndoRedo} */

  public do(state: unknown): void {
    const activeElement = document.activeElement;
    const el = this.el;
    const style = el.style;
    try {
      this._duringUpdate = true;
      style.visibility = 'visible';
      el.focus();
      document.execCommand?.('insertText', false, '|');
    } finally {
      el.blur();
      this._duringUpdate = false;
      // style.visibility = 'hidden';
    }
    (activeElement as HTMLElement)?.focus?.();
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
    style.fontSize = '2px';
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
    window.setTimeout(() => this.el.blur(), 0);
  };

  public readonly onInput = () => {
    if (!this._duringUpdate) {
      // callback(this.data);
    }
    // clear selection, otherwise user copy gesture will copy value
    // nb. this _probably_ won't work inside Shadow DOM
    // nb. this is mitigated by the fact that we set visibility: 'hidden'
    // const s = window.getSelection();
    // if (s.containsNode(this._ctrl, true)) {
    //   s.removeAllRanges();
    // }
  };

  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab?: string): string {
    throw new Error('Method not implemented.');
  }
}
