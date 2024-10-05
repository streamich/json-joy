import type {Path} from '@jsonjoy.com/json-pointer';

export const commonLength = (a: Path, b: Path): number => {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
};
