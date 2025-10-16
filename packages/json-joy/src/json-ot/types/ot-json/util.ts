import type {Path} from '@jsonjoy.com/json-pointer';

const comparePathComponent = (a: string | number, b: string | number): number => {
  if (a === b) return 0;
  return a > b ? -1 : 1;
};

export const comparePath = (a: Path, b: Path): number => {
  const aLen = a.length;
  const bLen = b.length;
  if (aLen !== bLen) return bLen - aLen;
  for (let i = 0; i < aLen; i++) {
    const c = comparePathComponent(a[i], b[i]);
    if (c !== 0) return c;
  }
  return 0;
};
