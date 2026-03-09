import {ValueSyncStore} from 'json-joy/lib/util/events/sync-store';
import {Key} from './Key';
import {KeySourceDoc} from './KeySourceDoc';
import {KeySourceEl} from './KeySourceEl';
import type {Printable} from 'tree-dump';
import type {KeySink, KeySource} from './types';

const enum KeyControllerConstants {
  HistoryLimit = 25,
}

export class KeyContext implements KeySink, Printable {
  public static global(): [context: KeyContext, unbind: () => void] {
    const ctx = new KeyContext(void 0);
    const source = new KeySourceDoc();
    const unbind = source.bind(ctx);
    return [ctx, unbind];
  }

  /** All currently pressed keys. */
  public pressed: Key[] = [];

  /** History of last N pressed keys. */
  public readonly history = new ValueSyncStore<Key[]>([]);

  public _child: KeyContext | undefined = void 0;
  public _feedChild: boolean = false; 
  public _childUnbind?: () => void = void 0;

  public constructor(
    public readonly parent: KeyContext | undefined = void 0,
  ) {}

  public detach(): void {
    const child = this._child;
    child?.detach();
    this._child = void 0;
  }

  public child(source?: KeySource | HTMLElement): KeyContext {
    if (this._child) {
      this._child.detach();
      this._child = void 0;
      this._childUnbind?.();
      this._childUnbind = void 0;
    }
    const child = new KeyContext(this);
    this._child = child;
    const keySource = source instanceof HTMLElement ? new KeySourceEl(source) : source;
    this._feedChild = !keySource;
    this._childUnbind = keySource?.bind(child);
    return child;
  }

  /** ------------------------------------------------------- {@link KeySink} */

  public onDown(press: Key): void {
    const child = this._child;
    if (child) {
      if (this._feedChild) child.onDown(press);
    } else this.onDownRun(press);
  }

  protected onDownRun(press: Key): void {
    const {key, event} = press;
    if (event?.isComposing || key === 'Dead') return;
    const {pressed, history} = this;
    pressed.push(press);
    const list = history.value;
    list.push(press);
    if (list.length > KeyControllerConstants.HistoryLimit) list.shift();
    history.next(list, true);

    // this.parent?.onDownRun(press);
  }

  public onUp(press: Key): void {
    const child = this._child;
    if (child) {
      if (this._feedChild) child.onUp(press);
    } else this.onUpRun(press);
  }

  protected onUpRun(press: Key): void {
    const {key, event} = press;
    if (event?.isComposing || key === 'Dead') return;
    const index = this.pressed.indexOf(press);
    if (index !== -1) this.pressed.splice(index, 1);
  }

  public onReset(press: Key): void {
    const child = this._child;
    if (child) {
      if (this._feedChild) child.onReset(press);
    } else this.onReset(press);
  }

  protected onResetRun(): void {
    this.pressed = [];
  }

  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab?: string): string {
    return `keys { hold: [ ${[...this.pressed].map((key) => JSON.stringify(key)).join(', ')} ], hist: [ ${this.history.value.map((press) => JSON.stringify(press.key)).join(', ')} ] ] }`;
  }
}
