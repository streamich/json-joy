import {rsync} from '@jsonjoy.com/ui';
import {CompiledScheme} from './Matcher';
import {defaultSchemes, schemeMap} from './schemes';
import type {TranslitScheme} from './types';

/**
 * Headless translit service. Owns:
 *
 * - the registry of available schemes
 * - the active scheme id (`null` = mode off)
 * - a cache of compiled schemes
 */
export class TranslitService {
  /** Active scheme id, or null when mode is off. */
  public readonly active = rsync.val<string | null>(null);

  /** Last-used scheme id (so a no-arg toggle can restore the last selection). */
  public readonly lastUsed = rsync.val<string | null>(null);

  /** Registry of all schemes available to this service. */
  public readonly schemes: Map<string, TranslitScheme>;

  private readonly _compiled = new Map<string, CompiledScheme>();

  constructor(schemes: Iterable<TranslitScheme> = defaultSchemes) {
    this.schemes = schemeMap(schemes);
  }

  /** Lazy-compile and cache. */
  public compile(scheme: TranslitScheme): CompiledScheme {
    const cached = this._compiled.get(scheme.id);
    if (cached) return cached;
    const c = new CompiledScheme(scheme);
    this._compiled.set(scheme.id, c);
    return c;
  }

  /** The currently active compiled scheme, or null. */
  public activeScheme(): CompiledScheme | null {
    const id = this.active.value;
    if (!id) return null;
    const scheme = this.schemes.get(id);
    if (!scheme) return null;
    return this.compile(scheme);
  }

  public list(): TranslitScheme[] {
    return Array.from(this.schemes.values());
  }

  /** Switch on with a specific scheme. */
  public on(id: string): boolean {
    if (!this.schemes.has(id)) return false;
    this.lastUsed.set(id);
    this.active.set(id);
    return true;
  }

  /** Switch off. */
  public off(): void {
    this.active.set(null);
  }

  /** Toggle the mode. With no arg: flip current state, restoring `lastUsed`
   * if turning on. With an id: switch to that scheme. */
  public toggle(id?: string): void {
    if (id) {
      if (this.active.value === id) {
        this.off();
        return;
      }
      this.on(id);
      return;
    }
    if (this.active.value) {
      this.off();
      return;
    }
    const restore = this.lastUsed.value ?? this.list()[0]?.id;
    if (restore) this.on(restore);
  }

  /** Add a custom scheme to the registry. */
  public register(scheme: TranslitScheme): void {
    this.schemes.set(scheme.id, scheme);
    this._compiled.delete(scheme.id);
  }
}
