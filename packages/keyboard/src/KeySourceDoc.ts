import {Key} from './Key';
import type {KeySource, KeySink, KeyEvent} from './types';

export class KeySourceDoc implements KeySource {
  public bind(sink: KeySink): () => void {
    const onKeyDown = (event: KeyEvent): void => {
      const key = Key.fromEvent(event);
      sink.onPress(key);
    };
    const onKeyUp = (event: KeyEvent): void => {
      const key = Key.fromEvent(event);
      sink.onRelease(key);
    };
    const onReset = (): void => {
      sink.onReset();
    };
    const doc = typeof document !== 'undefined' ? document : void 0;
    const wnd = typeof window !== 'undefined' ? window : void 0;
    doc?.addEventListener('keydown', onKeyDown);
    doc?.addEventListener('keyup', onKeyUp);
    doc?.addEventListener('compositionstart', onReset);
    doc?.addEventListener('compositionend', onReset);
    doc?.addEventListener('fullscreenchange', onReset);
    wnd?.addEventListener('focus', onReset);
    wnd?.addEventListener('blur', onReset);
    return () => {
      doc?.removeEventListener('keydown', onKeyDown);
      doc?.removeEventListener('keyup', onKeyUp);
      doc?.removeEventListener('compositionstart', onReset);
      doc?.removeEventListener('compositionend', onReset);
      doc?.removeEventListener('fullscreenchange', onReset);
      wnd?.removeEventListener('focus', onReset);
      wnd?.removeEventListener('blur', onReset);
    };
  }
}
