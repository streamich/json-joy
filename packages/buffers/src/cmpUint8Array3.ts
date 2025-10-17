/**
 * Compares two `Uint8Arrays`, first by length, then by each byte. Returns a
 * negative number if `a` is less than `b`, a positive number if `a` is greater
 * than `b`, or 0 if `a` is equal to `b`.
 *
 * @returns A negative number if a is less than b, a positive number if a is
 *          greater than b, or 0 if a is equal to b.
 */
export const cmpUint8Array3 = (a: Uint8Array, b: Uint8Array): number => {
  const len1 = a.length;
  const len2 = b.length;
  const diff = len1 - len2;
  if (diff !== 0) return diff;
  for (let i = 0; i < len1; i++) {
    const diff = a[i] - b[i];
    if (diff !== 0) return diff;
  }
  return 0;
};
