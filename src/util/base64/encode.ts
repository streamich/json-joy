export const createEncode = (chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/') => {
  if (chars.length !== 64)
    throw new Error('chars must be 64 characters long');

  const table = chars.split('');

  return (source: Uint8Array): string => {
    let out = ''
    let tmp;

    const length = source.byteLength;
    const extraLength = length % 3;
    const baseLength = length - extraLength;

    for (let i = 0; i < baseLength; i += 3) {
      tmp = (source[i] & 0xFF) << 16 | (source[i + 1] & 0xFF) << 8 | (source[i + 2] & 0xFF);
      out += (table[tmp >> 18 & 0x3F] + table[tmp >> 12 & 0x3F] + table[tmp >> 6 & 0x3F] + table[tmp & 0x3F]);
    }

    if (extraLength) {
      if (extraLength === 1) {
        tmp = (source[baseLength] & 0xFF);
        out += table[tmp >> 2] + table[tmp << 4 & 0x3F] + '==';
      } else {
        tmp = (source[baseLength] & 0xFF) << 8 | (source[baseLength + 1] & 0xFF);
        out += table[tmp >> 10] + table[tmp >> 4 & 0x3F] + table[tmp << 2 & 0x3F] + '=';
      }
    }

    return out;
  };
};

export const encode = createEncode();
