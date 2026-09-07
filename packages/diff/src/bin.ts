import * as str from './str';

export const toStr = (buf: Uint8Array): string => {
  let hex = '';
  const length = buf.length;
  for (let i = 0; i < length; i++) hex += String.fromCharCode(buf[i]);
  return hex;
};

export const toBin = (str: string): Uint8Array => {
  const length = str.length;
  const buf = new Uint8Array(length);
  for (let i = 0; i < length; i++) buf[i] = str.charCodeAt(i);
  return buf;
};

export const diff = (src: Uint8Array, dst: Uint8Array): str.Patch => {
  const txtSrc = toStr(src);
  const txtDst = toStr(dst);
  return str.diff(txtSrc, txtDst);
};

export const apply = (
  patch: str.Patch,
  srcLen: number,
  onInsert: (pos: number, bytes: Uint8Array) => void,
  onDelete: (pos: number, len: number, bytes: Uint8Array) => void,
) =>
  str.apply(
    patch,
    srcLen,
    (pos, str) => onInsert(pos, toBin(str)),
    (pos, len, str) => onDelete(pos, len, toBin(str)),
  );

export const src = (patch: str.Patch): Uint8Array => toBin(str.src(patch));
export const dst = (patch: str.Patch): Uint8Array => toBin(str.dst(patch));
