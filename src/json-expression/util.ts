import {toPath, get as get_} from '../json-pointer';

export const get = (path: string, data: unknown) => get_(data, toPath(path));

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
