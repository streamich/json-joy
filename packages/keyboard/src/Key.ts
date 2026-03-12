import {isMod} from './util';
import type {KeyEvent, SigMod, Signature} from './types';

export class Key {
  public static fromEvent(event: KeyEvent): Key {
    const parts: string[] = [];
    if (event.altKey) parts.push('Alt');
    if (event.ctrlKey) parts.push('Control');
    if (event.metaKey) parts.push('Meta');
    if (event.shiftKey) parts.push('Shift');
    const mod = parts.join('+');
    return new Key(event.key ?? '', Date.now(), mod as SigMod, event, event.code);
  }

  public propagate: boolean = true;

  public constructor(
    public readonly key: string,
    public readonly ts: number,
    public readonly mod: SigMod = '',
    public readonly event?: KeyEvent,
    public readonly code?: string,
  ) {}

  public sig(): Signature {
    const mod = this.mod;
    let key = this.key;
    if (key === ' ') key = 'Space';
    else if (key.length === 1) key = key.toLowerCase();
    const repeat = this.event?.repeat ? ':R' : '';
    // When the key itself is a modifier already present in the prefix, omit
    // the redundant key portion (e.g. pressing Shift alone: 'Shift', not 'Shift+Shift').
    if (mod && isMod(key)) return (mod + repeat) as Signature;
    const prefix = mod ? mod + '+' : '';
    return (prefix + key + repeat) as Signature;
  }

  /** Builds a signature from `event.code` (physical key position). */
  public codeSig(): string {
    const code = this.code;
    if (!code) return this.sig();
    const mod = this.mod;
    const prefix = mod ? mod + '+' : '';
    const repeat = this.event?.repeat ? ':R' : '';
    return prefix + '@' + code + repeat;
  }
}
