import {Key} from './Key';
import {resolveFilter} from './util';
import type {KeySource, KeySink, KeyEvent, KeySourceFilter} from './types';

export interface KeySourceElOpts {
  filter?: KeySourceFilter;
}

export class KeySourceEl implements KeySource {
  private readonly filter: ((event: KeyboardEvent) => boolean) | undefined;

  constructor(
    public readonly el: HTMLElement,
    opts?: KeySourceElOpts,
  ) {
    this.filter = resolveFilter(opts?.filter);
  }

  public bind(sink: KeySink): () => void {
    const filter = this.filter;
    const onKeyDown = (event: KeyEvent): void => {
      if (filter && !filter(event as KeyboardEvent)) return;
      const key = Key.fromEvent(event);
      sink.onPress(key);
    };
    const onKeyUp = (event: KeyEvent): void => {
      if (filter && !filter(event as KeyboardEvent)) return;
      const key = Key.fromEvent(event);
      sink.onRelease(key);
    };
    const onReset = (): void => {
      sink.onReset();
    };
    const onFocus = (): void => {
      sink.onFocus();
    };
    const el = this.el;
    const doc = typeof document !== 'undefined' ? document : void 0;
    el?.addEventListener('keydown', onKeyDown);
    el?.addEventListener('keyup', onKeyUp);
    el?.addEventListener('focus', onFocus);
    el?.addEventListener('blur', onReset);
    el?.addEventListener('compositionstart', onReset);
    el?.addEventListener('compositionend', onReset);
    doc?.addEventListener('fullscreenchange', onReset);
    return () => {
      el?.removeEventListener('keydown', onKeyDown);
      el?.removeEventListener('keyup', onKeyUp);
      el?.removeEventListener('focus', onFocus);
      el?.removeEventListener('blur', onReset);
      el?.removeEventListener('compositionstart', onReset);
      el?.removeEventListener('compositionend', onReset);
      doc?.removeEventListener('fullscreenchange', onReset);
    };
  }
}
