import {find} from '@jsonjoy.com/json-pointer/lib/find';
import {toPath} from '@jsonjoy.com/json-pointer/lib/util';

export const select = (value: unknown, path?: string) => {
  if (!path) return value;
  try {
    return find(value, toPath(path)).val ?? null;
  } catch {
    return null;
  }
};
