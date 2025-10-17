export const objKeyCmp = (a: string, b: string): number => {
  const len1 = a.length;
  const len2 = b.length;
  return len1 === len2 ? (a > b ? 1 : -1) : len1 - len2;
};
