import {decodeString as decodeStringRaw} from "../util/decodeString";

const decodeString = (view: DataView, offset: number, size: number): [json: unknown, offset: number] => {
  return [decodeStringRaw(view.buffer, offset, size), offset + size];
};

const decodeObject = (view: DataView, offset: number, size: number): [json: unknown, offset: number] => {
  const obj: Record<string, unknown> = {};
  for (let i = 0; i < size; i++) {
    const [key, off1] = decodeView(view, offset);
    const [el, off2] = decodeView(view, off1);
    offset = off2;
    obj[key as any] = el;
  }
  return [obj, offset];
};

const decodeArray = (view: DataView, offset: number, size: number): [json: unknown, offset: number] => {
  const arr = [];
  for (let i = 0; i < size; i++) {
    const [el, newOffset] = decodeView(view, offset);
    arr.push(el);
    offset = newOffset;
  }
  return [arr, offset];
};

export const decodeView = (view: DataView, offset: number): [json: unknown, offset: number] => {
  const byte = view.getUint8(offset++);
  switch (byte) {
    case 0xc0: return [null, offset];
    case 0xc2: return [false, offset];
    case 0xc3: return [true, offset];
    case 0xcc: return [view.getUint8(offset), offset + 1];
    case 0xcd: return [view.getUint16(offset), offset + 2];
    case 0xce: return [view.getUint32(offset), offset + 4];
    case 0xcf: return [view.getUint32(offset) * 4294967296 + view.getUint32(offset + 4), offset + 8];
    case 0xcb: return [view.getFloat64(offset), offset + 8];
    case 0xd9: return decodeString(view, offset + 1, view.getUint8(offset));
    case 0xda: return decodeString(view, offset + 2, view.getUint16(offset));
    case 0xdb: return decodeString(view, offset + 4, view.getUint32(offset));
    case 0xde: return decodeObject(view, offset + 2, view.getUint16(offset));
    case 0xdf: return decodeObject(view, offset + 4, view.getUint32(offset));
    case 0xdc: return decodeArray(view, offset + 2, view.getUint16(offset));
    case 0xdd: return decodeArray(view, offset + 4, view.getUint32(offset));
  }
  if (byte <= 0b1111111) return [byte, offset];
  switch (byte >>> 5) {
    case 0b111: return [-(byte & 0b11111) - 1, offset];
    case 0b101: return decodeString(view, offset, byte & 0b11111);
  }
  switch(byte >>> 4) {
    case 0b1000: return decodeObject(view, offset, byte & 0b1111);
    case 0b1001: return decodeArray(view, offset, byte & 0b1111);
  }
  return [undefined, offset];
};

export const decode = (buf: ArrayBuffer, offset: number): [json: unknown, offset: number] => {
  return decodeView(new DataView(buf), offset);
};
