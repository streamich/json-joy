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
  const withoutMod = sig.replace(/^[ACMS]+\+/, '');
  return withoutMod.includes('+');
}
