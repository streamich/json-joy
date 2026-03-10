import {FanOut} from 'thingies/lib/fanout';
import {Key} from './Key';
import {KeySourceDoc} from './KeySourceDoc';
import {KeySourceEl} from './KeySourceEl';
import {KeyMap} from './KeyMap';
import {KeySet} from './KeySet';
import {printTree} from 'tree-dump/lib/printTree';
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

  public readonly onChange = new FanOut<void>();

  /** Shortcut/hotkey definition map. */
  public readonly map: KeyMap;

  /** All currently pressed keys. */
  public readonly pressed: KeySet = new KeySet();

  /** History of last N pressed keys. */
  public readonly history: Key[] = [];
  public historyLimit: number = KeyControllerConstants.HistoryLimit;

  public _child: KeyContext | undefined = void 0;
  public _feedChild: boolean = false; 
  public _childUnbind?: () => void = void 0;

  public constructor(
    public readonly parent: KeyContext | undefined = void 0,
  ) {
    this.map = new KeyMap();
  }

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

  // ------------------------------------------------------- pausing / resuming

  public paused: boolean = false;

  public pause(): void {
    this.paused = true;
  }

  public resume(): void {
    this.paused = false;
  }

  /** ------------------------------------------------------- {@link KeySink} */

  public onPress(press: Key): void {
    if (this.paused) return;
    const child = this._child;
    if (child) {
      if (this._feedChild) child.onPress(press);
    } else this.onPress_(press);
  }

  protected onPress_(press: Key): void {
    const match = this.map.match(press);
    if (match) {
      // press.propagate = false;
      match();
    }

    const {key, event} = press;
    if (event?.isComposing || key === 'Dead') return;

    const {pressed, history} = this;
    pressed.add(press);
    history.push(press);
    while (history.length > this.historyLimit) history.shift();

    this.onChange.emit();
  }

  public onRelease(release: Key): void {
    this.pressed.remove(release);
    if (this.paused) return;
    const child = this._child;
    if (child) {
      if (this._feedChild) child.onRelease(release);
    } else this.onRelease_(release);
  }

  protected onRelease_(press: Key): void {
    const {key, event} = press;

    if (event?.isComposing || key === 'Dead') return;
  }

  public onReset(): void {
    this.pressed.reset();
    const child = this._child;
    if (child) {
      if (this._feedChild) child.onReset();
    } else this.onReset_();
  }

  protected onReset_(): void {}

  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab?: string): string {
    return 'keys' + printTree(tab, [
      (tab) => this.pressed.toString(tab),
    ]);
  }
}
