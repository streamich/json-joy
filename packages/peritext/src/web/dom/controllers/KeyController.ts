import {ValueSyncStore} from 'json-joy/lib/util/events/sync-store';
import type {Printable} from 'tree-dump';
import type {UiLifeCycles} from '../../types';
import type {DomController} from './../DomController';

class KeyPress {
  public constructor(
    public readonly key: string,
    public readonly ts: number,
  ) {}
}

/**
 * Keeps track of all pressed down keys.
 */
export class KeyController implements UiLifeCycles, Printable {
  /**
   * All currently pressed keys.
   */
  public readonly pressed = new Set<string>();

  /**
   * History of last 5 pressed keys.
   */
  public readonly history = new ValueSyncStore<KeyPress[]>([]);

  public constructor(public readonly dom: DomController) {}

  /** ----------------------------------------------------- {@link Printable} */

  public start() {
    const onKeyDown = (event: KeyboardEvent): void => {
      const key = event.key;
      if (event.isComposing || key === 'Dead') return;
      const {pressed, history} = this;
      pressed.add(key);
      const press = new KeyPress(key, Date.now());
      const historyList = history.value;
      historyList.push(press);
      if (historyList.length > 5) historyList.shift();
      history.next(historyList, true);
    };
    const onKeyUp = (event: KeyboardEvent): void => {
      const key = event.key;
      if (event.isComposing || key === 'Dead') return;
      this.pressed.delete(key);
    };
    const onReset = (): void => {
      this.pressed.clear();
    };
    const {el, doc} = this.dom.facade;
    doc?.addEventListener('keydown', onKeyDown);
    doc?.addEventListener('keyup', onKeyUp);
    doc?.addEventListener('focus', onReset);
    doc?.addEventListener('compositionstart', onReset);
    doc?.addEventListener('compositionend', onReset);
    el.addEventListener('blur', onReset);
    return () => {
      doc?.removeEventListener('keydown', onKeyDown);
      doc?.removeEventListener('keyup', onKeyUp);
      doc?.removeEventListener('focus', onReset);
      doc?.removeEventListener('compositionstart', onReset);
      doc?.removeEventListener('compositionend', onReset);
      el.removeEventListener('blur', onReset);
    };
  }

  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab?: string): string {
    return `keys { hold: [ ${[...this.pressed].map((key) => JSON.stringify(key)).join(', ')} ], hist: [ ${this.history.value.map((press) => JSON.stringify(press.key)).join(', ')} ] ] }`;
  }
}
