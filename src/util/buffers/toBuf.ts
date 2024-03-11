import {encode} from './utf8/encode';

export const toBuf = (str: string): Uint8Array => {
  const maxLength = str.length * 4;
  const arr = new Uint8Array(maxLength);
  const strBufferLength = encode(arr, str, 0, maxLength);
  return arr.slice(0, strBufferLength);
};
