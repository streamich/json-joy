export const cmpUint8Array = (a: Uint8Array, b: Uint8Array): boolean => {
  const length = a.length;
  if (length !== b.length) return false;
  for (let i = 0; i < length; i++) if (a[i] !== b[i]) return false;
  return true;
};
