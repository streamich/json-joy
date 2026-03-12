import {isMod} from './util';
import type {Key} from './Key';
import type {Printable} from 'tree-dump';

/** Tracks a set of actively pressed keys. */
export class KeySet implements Printable {
  constructor(public keys: Key[] = []) {}

  public add(key: Key): void {
    this.remove(key);
    this.keys.push(key);
  }

  public remove(key: Key): void {
    const keys = this.keys;
    const index = keys.findIndex((k) => k.key === key.key);
    if (index !== -1) keys.splice(index, 1);
  }

  public reset(): void {
    this.keys = [];
  }

  /** Removes all non-modifier keys, keeping Meta, Control, Alt, Shift. */
  public clearNonMods(): void {
    this.keys = this.keys.filter((k) => isMod(k.key));
  }

  public start(): number {
    const keys = this.keys;
    if (keys.length === 0) return 0;
    return Math.min(...keys.map((k) => k.ts));
  }

  public end(): number {
    const keys = this.keys;
    if (keys.length === 0) return 0;
    return Math.max(...keys.map((k) => k.ts));
  }

  /**
   * Builds the canonical chord signature for the current pressed set,
   * e.g. `'Control+a+b'` when Ctrl+A and Ctrl+B are both held.
   *
   * - Key names are normalized the same way `Key.sig()` does it and then
   *   sorted alphabetically.
   * - Modifier keys (Alt, Control, Meta, Shift) are excluded from the
   *   chord key list since they're already represented in the mod prefix.
   * - The shared modifier prefix is taken from the first key in insertion order.
   *   All chord keys are expected to share the same modifier state.
   */
  public sig(): string {
    const normalized = this.keys
      .filter((k) => !isMod(k.key))
      .map((k) => (k.key === ' ' ? 'Space' : k.key.length === 1 ? k.key.toLowerCase() : k.key))
      .sort();
    const mod = this.keys[0]?.mod ?? '';
    if (!normalized.length) return mod;
    return mod ? `${mod}+${normalized.join('+')}` : normalized.join('+');
  }

  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab?: string): string {
    return `pressed { ${this.keys.map((k) => k.sig()).join(', ')} }`;
  }
}
