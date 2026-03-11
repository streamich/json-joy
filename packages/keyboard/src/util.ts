/**
 * The platform-specific primary modifier key: `'M'` (Meta / ⌘) on macOS,
 * `'C'` (Control) on Windows / Linux / etc.
 */
export const mod: 'C' | 'M' = ((): 'C' | 'M' => {
  if (typeof navigator !== 'undefined') {
    if (/mac/i.test(navigator.platform) || /macintosh/i.test(navigator.userAgent)) return 'M';
  }
  if (typeof process !== 'undefined' && process.platform) {
    if (process.platform === 'darwin') return 'M';
  }
  return 'C';
})();

/**
 * Expands the `P` (Primary) modifier alias in `sig` to the platform-specific
 * concrete modifier: `M` (Meta / ⌘) on macOS, `C` (Control) elsewhere.
 * The expanded modifiers are always emitted in canonical order (A < C < M < S).
 * Signatures that contain no `P` are returned unchanged.
 *
 * @example
 * // macOS
 * expandPlatformMod('P+s')   // 'M+s'
 * expandPlatformMod('AP+s')  // 'AM+s'
 * // Windows / Linux
 * expandPlatformMod('P+s')   // 'C+s'
 * expandPlatformMod('AP+s')  // 'AC+s'
 */
export const expandMod = (sig: string): string => {
  if (!sig.includes('P')) return sig;
  return sig.replace(/^([ACMPS]+)\+/, (_, mods: string) => {
    const expanded = mods.replace('P', mod);
    return [...new Set(expanded.split(''))].sort().join('') + '+';
  });
};

/**
 * Returns `true` when `sig` encodes a chord — i.e. it contains two or more
 * plain-key segments after stripping the optional modifier prefix.
 *
 * Examples:
 * - `isChordSig('a+b')`    : `true`
 * - `isChordSig('C+a+b')`  : `true`
 * - `isChordSig('C+s')`    : `false`
 * - `isChordSig('Escape')` : `false`
 * - `isChordSig('')`       : `false`
 * - `isChordSig('?')`      : `false`
 */
export function isChordSig(sig: string): boolean {
  if (!sig || sig === '?') return false;
  const withoutMod = sig.replace(/^[ACMSP]+\+/, '');
  return withoutMod.includes('+');
}

const MOD_ALIASES: Record<string, string> = {
  ctrl: 'C', control: 'C',
  alt: 'A', option: 'A',
  meta: 'M', command: 'M', cmd: 'M',
  shift: 'S',
  $mod: 'P', p: 'P', primary: 'P',
};

/**
 * Returns `true` when `sig` is a multi-step sequence signature — i.e. it
 * contains a space character. Spaces never appear inside a single `Signature`
 * (key names are tokens like `Space`, `ArrowUp`, etc.).
 *
 * @example
 * isSequenceSig('g g')     // true
 * isSequenceSig('C+k C+d') // true
 * isSequenceSig('C+s')     // false
 */
export const isSequenceSig = (sig: string): boolean => sig.includes(' ');

import type {KeySourceFilter} from './types';

const isInputTarget = (event: KeyboardEvent): boolean => {
  const el = event.target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return !!el.isContentEditable;
};

export const resolveFilter = (
  filter: KeySourceFilter | undefined,
): ((event: KeyboardEvent) => boolean) | undefined => {
  if (!filter) return;
  if (filter === 'no-inputs') return (e) => !isInputTarget(e);
  if (filter === 'inputs') return (e) => isInputTarget(e);
  return filter;
};

export const normalize = (input: string): string => {
  // Already compact (e.g. 'C+s', 'CS+a', '@KeyW', 'Escape') — pass through.
  if (/^[ACMSP]*(\+|$)/.test(input)) return input;
  const mods: string[] = [];
  let key = '';
  for (const part of input.split('+')) {
    const alias = MOD_ALIASES[part.toLowerCase()];
    if (alias) mods.push(alias);
    else key = part;
  }
  const expanded = [...new Set(mods.map((m) => (m === 'P' ? mod : m)))].sort();
  const k = key.length === 1 ? key.toLowerCase() : key;
  return expanded.length ? `${expanded.join('')}+${k}` : k;
};
