import type {KeyEvent, SigMod, Signature} from './types';

export class Key {
  public static fromEvent(event: KeyEvent): Key {
    let mod: SigMod = '';
    if (event.altKey) mod += 'A';
    if (event.ctrlKey) mod += 'C';
    if (event.metaKey) mod += 'M';
    if (event.shiftKey) mod += 'S';
    return new Key(event.key ?? '', Date.now(), mod as SigMod, event);
  }

  public constructor(
    public readonly key: string,
    public readonly ts: number,
    public readonly mod: SigMod = '',
    public readonly event?: KeyEvent,
  ) {}

  public sig(): Signature {
    let mod = this.mod;
    if (mod) mod += '+';
    let key = this.key;
    if (key.length === 1) key = key.toLowerCase();
    const repeat = this.event?.repeat ? ':R' : '';
    const signature: Signature = (mod + key + repeat) as Signature;
    return signature;
  }
}
