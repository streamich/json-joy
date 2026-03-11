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
