import { hasOwnProperty } from '../util/hasOwnProperty';
import type {Path} from './types';

export const get = (val: unknown, path: Path): unknown | undefined => {
  const pathLength = path.length;
  let key: string | number;
  if (!pathLength) return val;
  for (let i = 0; i < pathLength; i++) {
    key = path[i];
    if (val instanceof Array) {
      const length = val.length;
      if (key === '-') return undefined;
      const key2 = ~~key;
      if ('' + key2 !== key) return undefined;
      key = key2;
      if (key < 0) return undefined;
      val = val[key];
    } else if (typeof val === 'object') {
      if (!val || !hasOwnProperty(val as object, key as string)) return undefined;
      val = (val as any)[key];
    } else return undefined;
  }
  return val;
};
