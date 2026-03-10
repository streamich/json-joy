import type {Key} from './Key';
import type {KeyBinding, Signature} from './types';

export class KeyMap {
  protected pressMap: Map<string, KeyBinding[]> = new Map();
  protected releaseMap: Map<string, KeyBinding[]> = new Map();

  private _set(map: Map<string, KeyBinding[]>, sig: Signature, action: () => void): void {
    const list: KeyBinding[] = map.get(sig) ?? [];
    const binding: KeyBinding = {
      sig,
      action,
    };
    list.push(binding);
    map.set(sig, list);
  }

  private _del(map: Map<string, KeyBinding[]>, sig: Signature, action: () => void): void {
    const list = map.get(sig);
    if (!list) return;
    const index = list.findIndex(b => b.action === action);
    if (index !== -1) {
      list.splice(index, 1);
      if (list.length === 0) map.delete(sig);
    }
  }

  private _match(map: Map<string, KeyBinding[]>, key: Key): KeyBinding[] | undefined {
    const sig = key.sig();
    const matches = map.get(sig);
    return matches;
  }

  public setPress(sig: Signature, action: () => void): void {
    this._set(this.pressMap, sig, action);
  }
  
  public delPress(sig: Signature, action: () => void): void {
    this._del(this.pressMap, sig, action);
  }

  public matchPress(press: Key): KeyBinding[] | undefined {
    return this._match(this.pressMap, press);
  }

  public setRelease(sig: Signature, action: () => void): void {
    this._set(this.releaseMap, sig, action);
  }

  public delRelease(sig: Signature, action: () => void): void {
    this._del(this.releaseMap, sig, action);
  }

  public matchRelease(press: Key): KeyBinding[] | undefined {
    return this._match(this.releaseMap, press);
  }
}
