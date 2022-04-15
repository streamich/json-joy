import {fromBase64, toBase64} from "../util/base64";
import {isUint8Array} from "../util/isUint8Array";
import {binUriStart} from "./constants";

const binUriStartLength = binUriStart.length;

/**
 * Replaces strings with Uint8Arrays in-place.
 */
const unwrapBinary = (value: unknown): unknown => {
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
          if (item.length < binUriStartLength) continue;
          if (item.substring(0, binUriStartLength) !== binUriStart) continue;
          value[i] = fromBase64(item.substring(binUriStartLength));
        }
      }
    }
    return value;
  }
  if (typeof value === 'object') {
    for (let key in value) {
      const item = (value as any)[key];
      switch (typeof item) {
        case 'object': {
          unwrapBinary(item);
          continue;
        }
        case 'string': {
          if (item.length < binUriStartLength) continue;
          if (item.substring(0, binUriStartLength) !== binUriStart) continue;
          const buf = fromBase64(item.substring(binUriStartLength));
          (value as any)[key] = buf;
        }
      }
    }
    return value;
  }
  if (typeof value === 'string') {
    if (value.length < binUriStartLength) return value;
    if (value.substring(0, binUriStartLength) !== binUriStart) return value;
    return fromBase64(value.substring(binUriStartLength));
  }
  return value;
};

export const parse = (json: string): unknown => {
  const parsed = JSON.parse(json);
  return unwrapBinary(parsed);
}

/**
 * Replaces Uint8Arrays with strings, returns a new structure,
 * without mutating the original.
 */
const wrapBinary = (value: unknown): unknown => {
  if (!value) return value;
  if (isUint8Array(value)) return binUriStart + toBase64(value);
  if (value instanceof Array) {
    const out: unknown[] = [];
    const len = value.length;
    for (let i = 0; i < len; i++) {
      const item = value[i];
      out.push(!item || (typeof item !== 'object') ? item : wrapBinary(item));
    }
    return out;
  }
  if (typeof value === 'object') {
    const out: {[key: string]: unknown} = {};
    for (let key in value) {
      const item = (value as any)[key];
      out[key] = !item || (typeof item !== 'object') ? item : wrapBinary(item);
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
