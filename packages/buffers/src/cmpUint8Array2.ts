/**
 * Compares two `Uint8Arrays` byte-by-byte. Returns a negative number if `a` is
 * less than `b`, a positive number if `a` is greater than `b`, or 0 if `a` is
 * equal to `b`.
 *
 * @returns A negative number if a is less than b, a positive number if a is
 *         greater than b, or 0 if a is equal to b.
 */
export const cmpUint8Array2 = (a: Uint8Array, b: Uint8Array): number => {
  const len1 = a.length;
  const len2 = b.length;
  const len = Math.min(len1, len2);
  for (let i = 0; i < len; i++) {
    const diffChar = a[i] - b[i];
    if (diffChar !== 0) return diffChar;
  }
  return len1 - len2;
};
