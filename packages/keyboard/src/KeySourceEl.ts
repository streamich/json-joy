import {Key} from './Key';
import type {KeySource, KeySink, KeyEvent} from './types';

export class KeySourceEl implements KeySource {
  constructor (public readonly el: HTMLElement) {}

  public bind(sink: KeySink): () => void {
    const onKeyDown = (event: KeyEvent): void => {
      const key = Key.fromEvent(event);
      sink.onDown(key);
    };
    const onKeyUp = (event: KeyEvent): void => {
      const key = Key.fromEvent(event);
      sink.onUp(key);
    };
    const onReset = (): void => {
      sink.onReset();
    };
    const el = this.el;
    el?.addEventListener('keydown', onKeyDown);
    el?.addEventListener('keyup', onKeyUp);
    el?.addEventListener('focus', onReset);
    el?.addEventListener('blur', onReset);
    el?.addEventListener('compositionstart', onReset);
    el?.addEventListener('compositionend', onReset);
    return () => {
      el?.removeEventListener('keydown', onKeyDown);
      el?.removeEventListener('keyup', onKeyUp);
      el?.removeEventListener('focus', onReset);
      el?.removeEventListener('blur', onReset);
      el?.removeEventListener('compositionstart', onReset);
      el?.removeEventListener('compositionend', onReset);
    };
  }
}
