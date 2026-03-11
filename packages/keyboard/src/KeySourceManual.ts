import {Key} from './Key';
import type {KeySource, KeySink, SigMod} from './types';

export class KeySourceManual implements KeySource {
  private sink: KeySink | null = null;

  public bind(sink: KeySink): () => void {
    this.sink = sink;
    return () => {
      this.sink = null;
    };
  }

  public press(press: Key | string, mod: SigMod = '', code?: string): void {
    if (!this.sink) return;
    if (!(press instanceof Key)) press = new Key(press, Date.now(), mod, undefined, code);
    this.sink.onPress(press);
  }

  public release(press: Key | string, mod: SigMod = '', code?: string): void {
    if (!this.sink) return;
    if (!(press instanceof Key)) press = new Key(press, Date.now(), mod, undefined, code);
    this.sink.onRelease(press);
  }

  public reset(): void {
    if (!this.sink) return;
    this.sink.onReset();
  }

  public async send(key: string, mod: SigMod = '', code?: string): Promise<void> {
    const pressDown = new Key(key, Date.now(), mod, undefined, code);
    this.press(pressDown);
    await Promise.resolve();
    const pressUp = new Key(key, Date.now(), mod, undefined, code);
    this.release(pressUp);
  }

  public async sendSequence(keys: [key: string, mod?: SigMod][]): Promise<void> {
    for (const [key, mod] of keys) {
      await this.send(key, mod ?? '');
    }
  }
}
