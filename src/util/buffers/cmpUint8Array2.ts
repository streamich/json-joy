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
