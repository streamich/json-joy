import {deepEqual} from '../json-equal/deepEqual';
import {toPath, get as get_} from '../json-pointer';

export const get = (path: string, data: unknown) => get_(data, toPath(path));

export const throwOnUndef = (value: unknown, def?: unknown) => {
  if (value !== undefined) return value;
  if (def === undefined) throw new Error('NOT_FOUND');
  return def;
};

export const type = (value: unknown): string => {
  if (value === null) return 'null';
  if (value instanceof Array) return 'array'
  return typeof value;
};

export const str = (value: unknown): string => {
  if (typeof value !== 'object') return '' + value;
  return JSON.stringify(value);
};

export const starts = (outer: unknown, inner: unknown): boolean => {
  return str(outer).indexOf(str(inner)) === 0;
};

export const contains = (outer: unknown, inner: unknown): boolean => {
  return str(outer).indexOf(str(inner)) > -1;
};

export const ends = (outer: unknown, inner: unknown): boolean => {
  const o = str(outer);
  const i = str(inner);
  return o.indexOf(i) === (o.length - i.length);
};

export const isInContainer = (what: unknown, container: unknown[]): boolean => {
  const length = container.length;
  for (let i = 0; i < length; i++) if (deepEqual(container[i], what)) return true;
  return false;
};

export const num = (value: unknown): number => +(value as number) || 0;
export const int = (value: unknown): number => ~~(value as number);

export const slash = (a: unknown, b: unknown) => {
  const res = num(a) / num(b);
  return Number.isFinite(res) ? res : 0;
};

export const substr = (probablyString: string | unknown, from: number | unknown, length?: number | unknown) =>
  str(probablyString).substr(int(from), int(length));

export const isLiteral = (value: unknown): boolean => {
  if (value instanceof Array) return value.length === 1 && value[0] instanceof Array;
  else return true;
};
