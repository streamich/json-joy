import * as str from "./str";

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

export const toStr = (buf: Uint8Array): string => {
  let hex = '';
  const length = buf.length;
  for (let i = 0; i < length; i++) hex += BIN_TO_HEX[buf[i]];
  return hex;
};

const START_CODE1 = 97; // 'a'.charCodeAt(0)
const START_CODE2 = 65; // 'A'.charCodeAt(0);

export const toBin = (hex: string): Uint8Array => {
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

export const diff = (src: Uint8Array, dst: Uint8Array): str.Patch => {
  const txtSrc = toStr(src);
  const txtDst = toStr(dst);
  return str.diff(txtSrc, txtDst);
};

export const apply = (patch: str.Patch, onInsert: (pos: number, str: Uint8Array) => void, onDelete: (pos: number, len: number) => void) =>
  str.apply(patch, (pos, str) => onInsert(pos, toBin(str)), onDelete);

export const src = (patch: str.Patch): Uint8Array => toBin(str.src(patch));
export const dst = (patch: str.Patch): Uint8Array => toBin(str.dst(patch));
