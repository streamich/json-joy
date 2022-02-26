import {alphabet} from "./constants";

const E = '=';
const EE = '==';

export const createFromBase64 = (chars: string = alphabet) => {
  if (chars.length !== 64) throw new Error('chars must be 64 characters long');

  const list = chars.split('');
  const table: {[key: string]: number} = {};

  for (let i = 0; i < list.length; i++) table[list[i]] = i;

  return (encoded: string): Uint8Array => {
    if (encoded.length % 4 !== 0) throw new Error('Base64 string length must be a multiple of 4');
    const length = encoded.length;
    const mainLength = encoded[length - 1] !== E ? length : length - 4;
    for (let i = 0; i < mainLength; i += 4) {
      const c0 = encoded[i];
      const c1 = encoded[i + 1];
      const c2 = encoded[i + 2];
      const c3 = encoded[i + 3];
      const sextet0 = table[c0];
      const sextet1 = table[c1];
      const sextet2 = table[c2];
      const sextet3 = table[c3];
      const u24 = sextet0 << 18 | sextet1 << 12 | sextet2 << 6 | sextet3;

    }

  };
};

const fromBase64Small = createFromBase64();

export const fromBase64 = fromBase64Small;
