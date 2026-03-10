import type {Key} from './Key';
import type {KeySet} from './KeySet';
import type {ChordBinding, ChordBindingOptions, ChordSignature, KeyBinding, KeyBindingShorthand, Signature} from './types';

export class KeyMap {
  protected pressMap: Map<string, KeyBinding[]> = new Map();
  protected releaseMap: Map<string, KeyBinding[]> = new Map();
  protected chordMap: Map<ChordSignature, ChordBinding[]> = new Map();

  private _set(map: Map<string, KeyBinding[]>, binding: KeyBinding): void {
    const list: KeyBinding[] = map.get(binding.sig) ?? [];
    list.push(binding);
    map.set(binding.sig, list);
  }

  private _del(map: Map<string, KeyBinding[]>, sig: Signature, action: (key: Key) => void): void {
    const list = map.get(sig);
    if (!list) return;
    const index = list.findIndex(b => b.action === action);
    if (index !== -1) {
      list.splice(index, 1);
      if (list.length === 0) map.delete(sig);
    }
  }

  public bind(definitions: (KeyBinding | KeyBindingShorthand)[]): (() => void) {
    const pressDefs: KeyBinding[] = [];
    const releaseDefs: KeyBinding[] = [];
    for (const def of definitions) {
      const binding: KeyBinding = Array.isArray(def)
        ? ({...def[2], sig: def[0], action: def[1]} as KeyBinding)
        : def;
      if (binding.release) releaseDefs.push(binding);
      else pressDefs.push(binding);
    }
    for (const b of pressDefs) this._set(this.pressMap, b);
    for (const b of releaseDefs) this._set(this.releaseMap, b);
    return (): void => {
      for (const b of pressDefs) this._del(this.pressMap, b.sig, b.action);
      for (const b of releaseDefs) this._del(this.releaseMap, b.sig, b.action);
    };
  }

  public setPress(sig: Signature, action: (key: Key) => void): void {
    this._set(this.pressMap, {sig, action});
  }
  
  public delPress(sig: Signature, action: (key: Key) => void): void {
    this._del(this.pressMap, sig, action);
  }

  public matchPress(press: Key): KeyBinding[] | undefined {
    const sig = press.sig();
    const exact = this.pressMap.get(sig);
    const any = this.pressMap.get('');
    const fallback = exact ? undefined : this.pressMap.get('?');
    const combined = [...(exact ?? []), ...(any ?? []), ...(fallback ?? [])];
    return combined.length ? combined : undefined;
  }

  public setRelease(sig: Signature, action: (key: Key) => void): void {
    this._set(this.releaseMap, {sig, action});
  }

  public delRelease(sig: Signature, action: (key: Key) => void): void {
    this._del(this.releaseMap, sig, action);
  }

  public matchRelease(release: Key): KeyBinding[] | undefined {
    const sig = release.sig();
    const exact = this.releaseMap.get(sig);
    const any = this.releaseMap.get('');
    const fallback = exact ? undefined : this.releaseMap.get('?');
    const combined = [...(exact ?? []), ...(any ?? []), ...(fallback ?? [])];
    return combined.length ? combined : undefined;
  }

  public setChord(sig: ChordSignature, action: ChordBinding['action'], options?: ChordBindingOptions): void {
    const list = this.chordMap.get(sig) ?? [];
    list.push({...options, sig, action});
    this.chordMap.set(sig, list);
  }

  public delChord(sig: ChordSignature, action: ChordBinding['action']): void {
    const list = this.chordMap.get(sig);
    if (!list) return;
    const index = list.findIndex(b => b.action === action);
    if (index !== -1) {
      list.splice(index, 1);
      if (list.length === 0) this.chordMap.delete(sig);
    }
  }

  /**
   * Returns matching chord bindings for the current `pressed` set, or
   * `undefined` if there are fewer than 2 pressed keys or no match.
   */
  public matchChord(pressed: KeySet): ChordBinding[] | undefined {
    if (pressed.keys.length < 2) return undefined;
    const sig = pressed.chordSig();
    const matches = this.chordMap.get(sig);
    return matches?.length ? matches : undefined;
  }
}
