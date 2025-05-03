// Encoding of the lower 4 bits.
const QUADS1 = 'abcdefghijklmnop';

// Encoding of the upper 4 bits.
const QUADS2 = 'ABCDEFGHIJKLMNOP';

// Binary octet to hex string conversion, where lower and upper 4 bits are
// encoded using different alphabets.
const BIN_TO_HEX: string[] = [];

for (let i = 0; i < 16; i++) {
  for (let j = 0; j < 16; j++) {
    BIN_TO_HEX.push(QUADS2[i] + QUADS1[j]);
  }
}

export const toHex = (buf: Uint8Array): string => {
  let hex = '';
  const length = buf.length;
  for (let i = 0; i < length; i++) hex += BIN_TO_HEX[buf[i]];
  return hex;
};

const START_CODE1 = 97; // 'a'.charCodeAt(0)
const START_CODE2 = 65; // 'A'.charCodeAt(0);

export const fromHex = (hex: string): Uint8Array => {
  const length = hex.length;
  const buf = new Uint8Array(length >> 1);
  let j = 0;
  for (let i = 0; i < length; i += 2) {
    const quad2 = hex.charCodeAt(i) - START_CODE2;
    const quad1 = hex.charCodeAt(i + 1) - START_CODE1;
    buf[j] = (quad2 << 4) | quad1;
    j++;
  }
  return buf;
};
