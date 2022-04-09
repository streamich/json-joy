import {bufferToUint8Array} from '../bufferToUint8Array';
import {alphabet} from './constants';

const E = '=';

export const createFromBase64 = (chars: string = alphabet) => {
  if (chars.length !== 64) throw new Error('chars must be 64 characters long');
  const list = chars.split('');
  const table: {[key: string]: number} = {};
  for (let i = 0; i < list.length; i++) table[list[i]] = i;

  return (encoded: string): Uint8Array => {
    if (!encoded) return new Uint8Array(0);
    const length = encoded.length;
    if (length % 4 !== 0) throw new Error('Base64 string length must be a multiple of 4');
    const mainLength = encoded[length - 1] !== E ? length : length - 4;
    let bufferLength = (length / 4) * 3;
    let padding = 0;
    if (encoded[length - 2] === E) {
      padding = 2;
      bufferLength -= 2;
    } else if (encoded[length - 1] === E) {
      padding = 1;
      bufferLength -= 1;
    }
    const buf = new Uint8Array(bufferLength);
    let j = 0;
    let i = 0;
    for (; i < mainLength; i += 4) {
      const c0 = encoded[i];
      const c1 = encoded[i + 1];
      const c2 = encoded[i + 2];
      const c3 = encoded[i + 3];
      const sextet0 = table[c0];
      const sextet1 = table[c1];
      const sextet2 = table[c2];
      const sextet3 = table[c3];
      buf[j] = (sextet0 << 2) | (sextet1 >> 4);
      buf[j + 1] = (sextet1 << 4) | (sextet2 >> 2);
      buf[j + 2] = (sextet2 << 6) | sextet3;
      j += 3;
    }
    if (padding === 2) {
      const c0 = encoded[mainLength];
      const c1 = encoded[mainLength + 1];
      const sextet0 = table[c0];
      const sextet1 = table[c1];
      buf[j] = (sextet0 << 2) | (sextet1 >> 4);
    } else if (padding === 1) {
      const c0 = encoded[mainLength];
      const c1 = encoded[mainLength + 1];
      const c2 = encoded[mainLength + 2];
      const sextet0 = table[c0];
      const sextet1 = table[c1];
      const sextet2 = table[c2];
      buf[j] = (sextet0 << 2) | (sextet1 >> 4);
      buf[j + 1] = (sextet1 << 4) | (sextet2 >> 2);
    }
    return buf;
  };
};

const fromBase64Cpp =
  typeof Buffer === 'function' ? (encoded: string) => bufferToUint8Array(Buffer.from(encoded, 'base64')) : null;

export const fromBase64 = fromBase64Cpp || createFromBase64();
