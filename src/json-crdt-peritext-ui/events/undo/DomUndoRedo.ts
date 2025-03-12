import type {Printable} from 'tree-dump';
import type {UiLifeCycles} from '../../dom/types';
import type {UndoRedo} from './types';

export class DomUndoRedo<State> implements UndoRedo<State>, UiLifeCycles, Printable {
  private _duringUpdate: boolean = false;
  private _stack: State[] = [];
  private el: HTMLElement;

  constructor (
    public onundo?: (state: State) => void,
    public onredo?: (state: State) => void,
  ) {
    // nb. Previous versions of this used `input` for browsers other than Firefox (as Firefox
    // _only_ supports execCommand on contentEditable)
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

    el.addEventListener('focus', () => {
      // Timeout, as immediate blur doesn't work in some browsers.
      window.setTimeout(() => el.blur(), 0);
    });
    el.addEventListener('input', (ev) => {
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
    });
  }

  /** ------------------------------------------------------ {@link UndoRedo} */

  public do(state: State): void {
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
    throw new Error('Method not implemented.');
  }

  public stop(): void {
    throw new Error('Method not implemented.');
  }
  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab?: string): string {
    throw new Error('Method not implemented.');
  }
}
