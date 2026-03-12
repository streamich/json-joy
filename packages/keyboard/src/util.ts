import type {KeySourceFilter} from './types';

/**
 * The platform-specific primary modifier key: `'Meta'` (⌘) on macOS,
 * `'Control'` (Ctrl) on Windows / Linux / etc.
 */
export const mod: 'Control' | 'Meta' = ((): 'Control' | 'Meta' => {
  if (typeof navigator !== 'undefined') {
    if (/mac/i.test(navigator.platform) || /macintosh/i.test(navigator.userAgent)) return 'Meta';
  }
  if (typeof process !== 'undefined' && process.platform) {
    if (process.platform === 'darwin') return 'Meta';
  }
  return 'Control';
})();

/**
 * Regex that matches a canonical modifier prefix: one or more modifier names
 * (`Alt`, `Control`, `Meta`, `Shift`, `Primary`) joined by `+`, followed by a
 * trailing `+` that separates the prefix from the key portion.
 */
const MODS_RE = /^((?:Alt|Control|Meta|Shift|Primary)(?:\+(?:Alt|Control|Meta|Shift|Primary))*)\+/;

/**
 * Expands the `Primary` modifier alias in `sig` to the platform-specific
 * concrete modifier: `Meta` (⌘) on macOS, `Control` elsewhere.
 * The expanded modifiers are always emitted in canonical order (Alt < Control < Meta < Shift).
 * Signatures that contain no `Primary` are returned unchanged.
 *
 * @example
 * // macOS
 * expandMod('Primary+s')       // 'Meta+s'
 * expandMod('Alt+Primary+s')   // 'Alt+Meta+s'
 * // Windows / Linux
 * expandMod('Primary+s')       // 'Control+s'
 * expandMod('Alt+Primary+s')   // 'Alt+Control+s'
 */
export const expandMod = (sig: string): string => {
  if (!sig.includes('Primary')) return sig;
  return sig.replace(MODS_RE, (_, mods: string) => {
    const parts = mods.split('+').map((m: string) => (m === 'Primary' ? mod : m));
    const deduped = [...new Set(parts)].sort();
    return deduped.join('+') + '+';
  });
};

/**
 * Returns `true` when `sig` encodes a chord — i.e. it contains two or more
 * plain-key segments after stripping the optional modifier prefix.
 *
 * Examples:
 * - `isChordSig('a+b')`          : `true`
 * - `isChordSig('Control+a+b')`  : `true`
 * - `isChordSig('Control+s')`    : `false`
 * - `isChordSig('Escape')`       : `false`
 * - `isChordSig('')`             : `false`
 * - `isChordSig('?')`            : `false`
 */
export function isChordSig(sig: string): boolean {
  if (!sig || sig === '?') return false;
  const withoutMod = sig.replace(MODS_RE, '');
  return withoutMod.includes('+');
}

const MOD_ALIASES: Record<string, string> = {
  ctrl: 'Control',
  control: 'Control',
  alt: 'Alt',
  option: 'Alt',
  meta: 'Meta',
  command: 'Meta',
  cmd: 'Meta',
  shift: 'Shift',
  $mod: 'Primary',
  p: 'Primary',
  primary: 'Primary',
};

export const isMod = (key: string): boolean =>
  key === 'Alt' || key === 'Control' || key === 'Meta' || key === 'Shift';

/**
 * Returns `true` when `sig` is a multi-step sequence signature — i.e. it
 * contains a space character. Spaces never appear inside a single `Signature`
 * (key names are tokens like `Space`, `ArrowUp`, etc.).
 *
 * @example
 * isSequenceSig('g g')             // true
 * isSequenceSig('Control+k Control+d') // true
 * isSequenceSig('Control+s')       // false
 */
export const isSequenceSig = (sig: string): boolean => sig.includes(' ');

const isInputTarget = (event: KeyboardEvent): boolean => {
  const el = event.target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return !!el.isContentEditable;
};

export const resolveFilter = (filter: KeySourceFilter | undefined): ((event: KeyboardEvent) => boolean) | undefined => {
  if (!filter) return;
  if (filter === 'no-inputs') return (e) => !isInputTarget(e);
  if (filter === 'inputs') return (e) => isInputTarget(e);
  return filter;
};

export const normalize = (input: string): string => {
  if (!input || input === '?') return input;
  if (input[0] === '@') return input;
  const mods: string[] = [];
  const keyParts: string[] = [];
  for (const part of input.split('+')) {
    const alias = MOD_ALIASES[part.toLowerCase()];
    if (alias) mods.push(alias);
    else keyParts.push(part);
  }
  const normalizedKeys = keyParts.map((p) => (p.length === 1 ? p.toLowerCase() : p));
  const keyStr = normalizedKeys.join('+');
  if (!mods.length) return keyStr;
  const expanded = [...new Set(mods.map((m) => (m === 'Primary' ? mod : m)))].sort();
  return keyStr ? `${expanded.join('+')}+${keyStr}` : expanded.join('+');
};
