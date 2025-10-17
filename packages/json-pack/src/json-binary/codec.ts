import {JsonPackExtension} from '../JsonPackExtension';
import {JsonPackValue} from '../JsonPackValue';
import {fromBase64} from '@jsonjoy.com/base64/lib/fromBase64';
import {toBase64} from '@jsonjoy.com/base64/lib/toBase64';
import {isUint8Array} from '@jsonjoy.com/buffers/lib/isUint8Array';
import {binUriStart, msgPackExtStart, msgPackUriStart} from './constants';
import type {binary_string} from './types';

const binUriStartLength = binUriStart.length;
const msgPackUriStartLength = msgPackUriStart.length;
const msgPackExtStartLength = msgPackExtStart.length;
const minDataUri = Math.min(binUriStartLength, msgPackUriStartLength);

const parseExtDataUri = (uri: string): JsonPackExtension => {
  uri = uri.substring(msgPackExtStartLength);
  const commaIndex = uri.indexOf(',');
  if (commaIndex === -1) throw new Error('INVALID_EXT_DATA_URI');
  const typeString = uri.substring(0, commaIndex);
  const buf = fromBase64(uri.substring(commaIndex + 1));
  return new JsonPackExtension(Number(typeString), buf);
};

/**
 * Replaces strings with Uint8Arrays in-place.
 */
export const unwrapBinary = (value: unknown): unknown => {
  if (!value) return value;
  if (value instanceof Array) {
    const len = value.length;
    for (let i = 0; i < len; i++) {
      const item = value[i];
      switch (typeof item) {
        case 'object': {
          unwrapBinary(item);
          continue;
        }
        case 'string': {
          if (item.length < minDataUri) continue;
          if (item.substring(0, binUriStartLength) === binUriStart)
            value[i] = fromBase64(item.substring(binUriStartLength));
          else if (item.substring(0, msgPackUriStartLength) === msgPackUriStart)
            value[i] = new JsonPackValue(fromBase64(item.substring(msgPackUriStartLength)));
          else if (item.substring(0, msgPackExtStartLength) === msgPackExtStart) value[i] = parseExtDataUri(item);
        }
      }
    }
    return value;
  }
  if (typeof value === 'object') {
    for (const key in value) {
      const item = (value as any)[key];
      switch (typeof item) {
        case 'object': {
          unwrapBinary(item);
          continue;
        }
        case 'string': {
          if (item.length < minDataUri) continue;
          if (item.substring(0, binUriStartLength) === binUriStart) {
            const buf = fromBase64(item.substring(binUriStartLength));
            (value as any)[key] = buf;
          } else if (item.substring(0, msgPackUriStartLength) === msgPackUriStart) {
            (value as any)[key] = new JsonPackValue(fromBase64(item.substring(msgPackUriStartLength)));
          } else if (item.substring(0, msgPackExtStartLength) === msgPackExtStart)
            (value as any)[key] = parseExtDataUri(item);
        }
      }
    }
    return value;
  }
  if (typeof value === 'string') {
    if (value.length < minDataUri) return value;
    if (value.substring(0, binUriStartLength) === binUriStart) return fromBase64(value.substring(binUriStartLength));
    if (value.substring(0, msgPackUriStartLength) === msgPackUriStart)
      return new JsonPackValue(fromBase64(value.substring(msgPackUriStartLength)));
    if (value.substring(0, msgPackExtStartLength) === msgPackExtStart) return parseExtDataUri(value);
    else return value;
  }
  return value;
};

export const parse = (json: string): unknown => {
  const parsed = JSON.parse(json);
  return unwrapBinary(parsed);
};

export const stringifyBinary = <T extends Uint8Array>(value: T): binary_string<T> =>
  <binary_string<T>>(binUriStart + toBase64(value));

/**
 * Replaces Uint8Arrays with strings, returns a new structure,
 * without mutating the original.
 */
export const wrapBinary = (value: unknown): unknown => {
  if (!value) return value;
  if (isUint8Array(value)) return stringifyBinary(value);
  if (value instanceof Array) {
    const out: unknown[] = [];
    const len = value.length;
    for (let i = 0; i < len; i++) {
      const item = value[i];
      out.push(!item || typeof item !== 'object' ? item : wrapBinary(item));
    }
    return out;
  }
  if (value instanceof JsonPackValue) return msgPackUriStart + toBase64(value.val);
  if (value instanceof JsonPackExtension) return msgPackExtStart + value.tag + ',' + toBase64(value.val);
  if (typeof value === 'object') {
    const out: {[key: string]: unknown} = {};
    for (const key in value) {
      const item = (value as any)[key];
      out[key] = !item || typeof item !== 'object' ? item : wrapBinary(item);
    }
    return out;
  }
  return value;
};

type Stringify =
  | ((value: any, replacer?: (this: any, key: string, value: any) => any, space?: string | number) => string)
  | ((value: any, replacer?: (number | string)[] | null, space?: string | number) => string);

export const stringify: Stringify = (value: unknown, replacer: any, space: any) => {
  const wrapped = wrapBinary(value);
  return JSON.stringify(wrapped, replacer, space);
};
