import * as str from "./str";

export const toStr = (buf: Uint8Array): string => {
  let hex = '';
  const length = buf.length;
  for (let i = 0; i < length; i++) hex += String.fromCharCode(buf[i]);
  return hex;
};

export const toBin = (hex: string): Uint8Array => {
  const length = hex.length;
  const buf = new Uint8Array(length);
  for (let i = 0; i < length; i ++) buf[i] = hex.charCodeAt(i);
  return buf;
};

export const diff = (src: Uint8Array, dst: Uint8Array): str.Patch => {
  const txtSrc = toStr(src);
  const txtDst = toStr(dst);
  return str.diff(txtSrc, txtDst);
};

export const apply = (patch: str.Patch, onInsert: (pos: number, str: Uint8Array) => void, onDelete: (pos: number, len: number) => void, delayedMaterialization?: boolean) =>
  str.apply(patch, (pos, str) => onInsert(pos, toBin(str)), onDelete, delayedMaterialization);

export const src = (patch: str.Patch): Uint8Array => toBin(str.src(patch));
export const dst = (patch: str.Patch): Uint8Array => toBin(str.dst(patch));
