import {Peritext} from '../../json-crdt-extensions';
import type {Printable} from 'tree-dump';
import type {UiLifeCycles} from './types';
import type {Patch} from '../../json-crdt-patch';
import type {UndoRedoCollector} from '../types';

export interface UndoRedoControllerOpts {
  txt: Peritext;
}

export class UndoRedoController implements UndoRedoCollector, UiLifeCycles, Printable {
  private _duringUpdate: boolean = false;
  private _stack: unknown[] = [];
  private el!: HTMLElement;

  constructor (
    public readonly opts: UndoRedoControllerOpts,
    // public onundo?: (state: unknown) => void,
    // public onredo?: (state: unknown) => void,
  ) {}

  protected captured = new WeakSet<Patch>();
  // protected undoable(patch: Patch): void {}

  // public live: boolean = false;

  // public capture(callback: () => void): void {
  public capture(): void {
    const currentPatch = this.opts.txt.model.api.builder.patch;
    this.captured.add(currentPatch);
    // this.live = true;
    // try {
    //   callback();
    // } finally {
    //   this.undoable.add(this.opts.txt.model.api.builder.patch);
    //   // this.live = false;
    // }
  }

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
    // style.fontSize = '2px';
    style.fontSize = '8px';
    // style.visibility = 'hidden';
    document.body.appendChild(el);
    el.addEventListener('focus', this.onFocus);
    el.addEventListener('input', this.onInput);
    const {opts, captured} = this;
    const {txt} = opts;
    txt.model.api.onFlush.listen((patch) => {
      const isCaptured = captured.has(patch);
      if (isCaptured) {
        captured.delete(patch);
        console.log('flush 2', patch + '');
      }
    });
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
