import {Key} from './Key';
import type {KeySource, KeySink, SigMod} from './types';

export class KeySourceManual implements KeySource {
  constructor () {}

  private sink: KeySink | null = null;

  public bind(sink: KeySink): () => void {
    this.sink = sink;
    return () => {
      this.sink = null;
    };
  }

  public onDown(press: Key | string): void {
    if (!this.sink) return;
    if (!(press instanceof Key)) press = new Key(press, Date.now());
    this.sink.onDown(press);
  }

  public onUp(press: Key | string): void {
    if (!this.sink) return;
    if (!(press instanceof Key)) press = new Key(press, Date.now());
    this.sink.onUp(press);
  }

  public onReset(): void {
    if (!this.sink) return;
    this.sink.onReset();
  }

  public async send(key: string, mod: SigMod = ''): Promise<void> {
    const pressDown = new Key(key, Date.now(), mod);
    this.onDown(pressDown);
    await Promise.resolve();
    const pressUp = new Key(key, Date.now(), mod);
    this.onUp(pressUp);
  }
}
