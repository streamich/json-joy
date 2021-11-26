import {toPath, get as get_} from '../json-pointer';

export const str = (value: unknown): string => {
  if (typeof value !== 'object') return '' + value;
  return JSON.stringify(value);
};

export const get = (path: string, data: unknown) => get_(data, toPath(path));

export const type = (value: unknown): string => {
  if (value === null) return 'null';
  if (value instanceof Array) return 'array'
  return typeof value;
};
