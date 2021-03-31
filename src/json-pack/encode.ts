import {computeMaxSize} from "./util/computeMaxSize";
import {encodeString as encodeStringRaw} from "../util/binary";

const encodeNull = (view: DataView, offset: number): number => {
  view.setUint8(offset++, 0xc0);
  return offset;
};

const encodeFalse = (view: DataView, offset: number): number => {
  view.setUint8(offset++, 0xc2);
  return offset;
};

const encodeTrue = (view: DataView, offset: number): number => {
  view.setUint8(offset++, 0xc3);
  return offset;
};

const encodeNumber = (view: DataView, offset: number, num: number): number => {
  const isInteger = num === Math.round(num);
  if (isInteger) {
    if ((num >= 0) && (num <= 0b1111111)) {
      view.setUint8(offset++, num);
      return offset;
    }
    if ((num < 0) && (num >= -0b100000)) {
      view.setUint8(offset++, 0b11100000 | (-num - 1));
      return offset;
    }
  }
  view.setUint8(offset++, 0xcb);
  view.setFloat64(offset, num);
  offset += 8;
  return offset;
};

const encodeString = (view: DataView, offset: number, str: string): number => {
  const buf = encodeStringRaw(str);
  const size = buf.byteLength;
  if (size < 0b11111) {
    view.setUint8(offset++, 0b10100000 | size);
    const dest = new Uint8Array(view.buffer);
    const src = new Uint8Array(buf);
    dest.set(src, offset);
    offset += size;
    return offset;
  }

  return offset;
};

const encodeAny = (view: DataView, offset: number, json: unknown): number => {
  switch (json) {
    case null: return encodeNull(view, offset);
    case false: return encodeFalse(view, offset);
    case true: return encodeTrue(view, offset);
  }
  switch (typeof json) {
    case 'number': return encodeNumber(view, offset, json);
  }
  return offset;
};

export const encode = (json: unknown): ArrayBuffer => {
  const maxSize = computeMaxSize(json);
  const buffer = new ArrayBuffer(maxSize);
  const view = new DataView(buffer);
  // const uint8 = new Uint8Array(buffer);
  const offset = encodeAny(view, 0, json);
  return view.buffer.slice(0, offset);
};
