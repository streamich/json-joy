import type {KeyEvent} from './types';

export class Key {
  public static fromEvent(event: KeyEvent): Key {
    return new Key(event.key ?? '', Date.now(), event);
  }

  public constructor(
    public readonly key: string,
    public readonly ts: number,
    public readonly event?: KeyEvent,
  ) {}
}
