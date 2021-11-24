const E = '=';
const EE = '==';

export const createEncode = (chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/') => {
  if (chars.length !== 64)
    throw new Error('chars must be 64 characters long');

  const table = chars.split('');

  return (source: Uint8Array): string => {
    let out = ''

    const length = source.byteLength;
    const extraLength = length % 3;
    const baseLength = length - extraLength;

    for (let i = 0; i < baseLength; i += 3) {
      const o1 = source[i];
      const o2 = source[i + 1];
      const o3 = source[i + 2];
      const v1 = o1 >> 2;
      const v2 = ((o1 & 0b11) << 4) | (o2 >> 4);
      const v3 = ((o2 & 0b1111) << 2) | (o3 >> 6);
      const v4 = o3 & 0b111111;
      out += table[v1] + table[v2] + table[v3] + table[v4];
    }

    if (extraLength) {
      if (extraLength === 1) {
        const o1 = source[baseLength] & 0xFF;
        out += table[o1 >> 2] + table[(o1 & 0b11) << 4] + EE;
      } else {
        const o1 = source[baseLength];
        const o2 = source[baseLength + 1];
        const v1 = o1 >> 2;
        const v2 = ((o1 & 0b11) << 4) | (o2 >> 4);
        const v3 = ((o2 & 0b1111) << 2);
        out += table[v1] + table[v2] + table[v3] + E;
      }
    }

    return out;
  };
};

export const encode = createEncode();
