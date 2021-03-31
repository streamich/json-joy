import {computeMaxSize} from "./util/computeMaxSize";
import {encodeString as encodeStringRaw} from "../util/encodeString";

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
  if (size <= 0b11111) {
    view.setUint8(offset++, 0b10100000 | size);
    const dest = new Uint8Array(view.buffer);
    const src = new Uint8Array(buf);
    dest.set(src, offset);
    offset += size;
    return offset;
  }
  if (size <= 0xFF) {
    view.setUint8(offset++, 0xd9);
    view.setUint8(offset++, size);
    const dest = new Uint8Array(view.buffer);
    const src = new Uint8Array(buf);
    dest.set(src, offset);
    offset += size;
    return offset;
  }
  if (size <= 0xFFFF) {
    view.setUint8(offset++, 0xda);
    view.setUint16(offset, size);
    offset += 2;
    const dest = new Uint8Array(view.buffer);
    const src = new Uint8Array(buf);
    dest.set(src, offset);
    offset += size;
    return offset;
  }
  if (size <= 0xFFFFFFFF) {
    view.setUint8(offset++, 0xdb);
    view.setUint32(offset, size);
    offset += 4;
    const dest = new Uint8Array(view.buffer);
    const src = new Uint8Array(buf);
    dest.set(src, offset);
    offset += size;
    return offset;
  }
  return offset;
};

const encodeArray = (view: DataView, offset: number, arr: unknown[]): number => {
  const length = arr.length;
  if (length <= 0b1111) {
    view.setUint8(offset++, 0b10010000 | length);
  } else if (length <= 0xFFFF) {
    view.setUint8(offset++, 0xdc);
    view.setUint16(offset, length);
    offset += 2;
  } else if (length <= 0xFFFFFFFF) {
    view.setUint8(offset++, 0xdd);
    view.setUint32(offset, length);
    offset += 4;
  } else return offset;
  for (let i = 0; i < length; i++) offset = encodeAny(view, offset, arr[i]);
  return offset;
};

const encodeObject = (view: DataView, offset: number, obj: Record<string, unknown>): number => {
  const keys = Object.keys(obj);
  const length = keys.length;
  if (length <= 0b1111) {
    view.setUint8(offset++, 0b10000000 | length);
  } else if (length <= 0xFFFF) {
    view.setUint8(offset++, 0xde);
    view.setUint16(offset, length);
    offset += 2;
  } else if (length <= 0xFFFFFFFF) {
    view.setUint8(offset++, 0xdf);
    view.setUint32(offset, length);
    offset += 4;
  } else return offset;
  for (let i = 0; i < length; i++) {
    const key = keys[i];
    offset = encodeString(view, offset, key);
    offset = encodeAny(view, offset, obj[key]);
  }
  return offset;
};

const encodeAny = (view: DataView, offset: number, json: unknown): number => {
  switch (json) {
    case null: return encodeNull(view, offset);
    case false: return encodeFalse(view, offset);
    case true: return encodeTrue(view, offset);
  }
  if (json instanceof Array) return encodeArray(view, offset, json);
  switch (typeof json) {
    case 'number': return encodeNumber(view, offset, json);
    case 'string': return encodeString(view, offset, json);
    case 'object': return encodeObject(view, offset, json as Record<string, unknown>);
  }
  return offset;
};

export const encode = (json: unknown): ArrayBuffer => {
  const maxSize = computeMaxSize(json);
  const buffer = new ArrayBuffer(maxSize);
  const view = new DataView(buffer);
  const offset = encodeAny(view, 0, json);
  return view.buffer.slice(0, offset);
};
