import {decodeString} from "../util/decodeString";

export const decodeView = (view: DataView, offset: number): [json: unknown, offset: number] => {
  const byte = view.getUint8(offset++);
  switch (byte) {
    case 0xc0: return [null, offset];
    case 0xc2: return [false, offset];
    case 0xc3: return [true, offset];
    case 0xcb: return [view.getFloat64(offset), offset + 8];
    case 0xd9: {
      const size = view.getUint8(offset++);
      return [decodeString(view.buffer, offset, size), offset + size];
    }
    case 0xda: {
      const size = view.getUint16(offset);
      offset += 2;
      return [decodeString(view.buffer, offset, size), offset + size];
    }
    case 0xdb: {
      const size = view.getUint32(offset);
      offset += 4;
      return [decodeString(view.buffer, offset, size), offset + size];
    }
    case 0xde: {
      const size = view.getUint16(offset);
      offset += 2;
      const obj: Record<string, unknown> = {};
      for (let i = 0; i < size; i++) {
        const [key, off1] = decodeView(view, offset);
        const [el, off2] = decodeView(view, off1);
        offset = off2;
        obj[key as any] = el;
      }
      return [obj, offset];
    }
    case 0xdf: {
      const size = view.getUint32(offset);
      offset += 4;
      const obj: Record<string, unknown> = {};
      for (let i = 0; i < size; i++) {
        const [key, off1] = decodeView(view, offset);
        const [el, off2] = decodeView(view, off1);
        offset = off2;
        obj[key as any] = el;
      }
      return [obj, offset];
    }
    case 0xdc: {
      const size = view.getUint16(offset);
      offset += 2;
      const arr = [];
      for (let i = 0; i < size; i++) {
        const [el, newOffset] = decodeView(view, offset);
        arr.push(el);
        offset = newOffset;
      }
      return [arr, offset];
    }
    case 0xdd: {
      const size = view.getUint32(offset);
      offset += 4;
      const arr = [];
      for (let i = 0; i < size; i++) {
        const [el, newOffset] = decodeView(view, offset);
        arr.push(el);
        offset = newOffset;
      }
      return [arr, offset];
    }
  }
  if (byte <= 0b1111111) return [byte, offset];
  switch (byte >>> 5) {
    case 0b111: return [-(byte & 0b11111) - 1, offset];
    case 0b101: {
      const size = byte & 0b11111;
      return [decodeString(view.buffer, offset, size), offset + size];
    }
  }
  switch(byte >>> 4) {
    case 0b1000: {
      const size = byte & 0b1111;
      const obj: Record<string, unknown> = {};
      for (let i = 0; i < size; i++) {
        const [key, newOffset] = decodeView(view, offset);
        const [el, newOffset2] = decodeView(view, newOffset);
        offset = newOffset2;
        obj[key as any] = el;
      }
      return [obj, offset];
    }
    case 0b1001: {
      const size = byte & 0b1111;
      const arr = [];
      for (let i = 0; i < size; i++) {
        const [el, newOffset] = decodeView(view, offset);
        arr.push(el);
        offset = newOffset;
      }
      return [arr, offset];
    }
  }
  return [undefined, offset];
};

export const decode = (buf: ArrayBuffer, offset: number): [json: unknown, offset: number] => {
  return decodeView(new DataView(buf), offset);
};
