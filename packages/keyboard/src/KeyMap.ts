import {isChordSig, expandMod} from './util';
import type {Key} from './Key';
import type {KeySet} from './KeySet';
import type {
  ChordAction,
  ChordBinding,
  ChordBindingOptions,
  ChordBindingShorthand,
  ChordSignature,
  KeyAction,
  KeyBinding,
  KeyBindingOptions,
  KeyBindingShorthand,
  Signature,
} from './types';

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
    const index = list.findIndex((b) => b.action === action);
    if (index !== -1) {
      list.splice(index, 1);
      if (list.length === 0) map.delete(sig);
    }
  }

  public bind(definitions: (KeyBinding | KeyBindingShorthand | ChordBinding | ChordBindingShorthand)[]): () => void {
    const pressDefs: KeyBinding[] = [];
    const releaseDefs: KeyBinding[] = [];
    const chordDefs: ChordBinding[] = [];
    for (const def of definitions) {
      if (Array.isArray(def)) {
        const [rawSig, action, options] = def as [string, Function, (KeyBindingOptions | ChordBindingOptions)?];
        const sig = expandMod(rawSig);
        if (isChordSig(sig)) chordDefs.push({...options, sig, action: action as ChordAction});
        else {
          const b = {...options, sig: sig as Signature, action: action as KeyAction};
          if ((b as KeyBinding).release) releaseDefs.push(b as KeyBinding);
          else pressDefs.push(b as KeyBinding);
        }
      } else {
        const rawB = def as KeyBinding | ChordBinding;
        const b = {...rawB, sig: expandMod(rawB.sig)};
        if (isChordSig(b.sig)) chordDefs.push(b as ChordBinding);
        else if ((b as KeyBinding).release) releaseDefs.push(b as KeyBinding);
        else pressDefs.push(b as KeyBinding);
      }
    }
    for (const b of pressDefs) this._set(this.pressMap, b);
    for (const b of releaseDefs) this._set(this.releaseMap, b);
    for (const b of chordDefs) this.setChord(b.sig, b.action, b);
    return (): void => {
      for (const b of pressDefs) this._del(this.pressMap, b.sig, b.action);
      for (const b of releaseDefs) this._del(this.releaseMap, b.sig, b.action);
      for (const b of chordDefs) this.delChord(b.sig, b.action);
    };
  }

  public setPress(sig: Signature, action: (key: Key) => void): void {
    this._set(this.pressMap, {sig: expandMod(sig) as Signature, action});
  }

  public delPress(sig: Signature, action: (key: Key) => void): void {
    this._del(this.pressMap, expandMod(sig) as Signature, action);
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
    this._set(this.releaseMap, {sig: expandMod(sig) as Signature, action});
  }

  public delRelease(sig: Signature, action: (key: Key) => void): void {
    this._del(this.releaseMap, expandMod(sig) as Signature, action);
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
    const expanded = expandMod(sig);
    const list = this.chordMap.get(expanded) ?? [];
    list.push({...options, sig: expanded, action});
    this.chordMap.set(expanded, list);
  }

  public delChord(sig: ChordSignature, action: ChordBinding['action']): void {
    const expanded = expandMod(sig);
    const list = this.chordMap.get(expanded);
    if (!list) return;
    const index = list.findIndex((b) => b.action === action);
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
