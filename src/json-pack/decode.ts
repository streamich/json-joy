import {decodeString} from "../util/decodeString";

export const decodeView = (view: DataView, offset: number): [json: unknown, offset: number] => {
  const byte = view.getUint8(offset++);
  switch (byte) {
    case 0xc0: return [null, offset];
    case 0xc2: return [false, offset];
    case 0xc3: return [true, offset];
    case 0xcb: return [view.getFloat64(offset), offset + 4];
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
  }
  if (byte <= 0b1111111) return [byte, offset];
  const top3 = byte >>> 5;
  switch (top3) {
    case 0b111: return [-(byte & 0b11111) - 1, offset];
    case 0b101: {
      const size = byte & 0b11111;
      return [decodeString(view.buffer, offset, size), offset + size];
    }
  }
  const top4 = byte >>> 4;
  switch(top4) {
    case 0b1001: {
      const size = byte & 0b1111;
      const arr = [];
      for (let i = 0; i < size; i++) arr.push(decodeView(view, offset))
    }
  }
  return [undefined, offset];
};

export const decode = (buf: ArrayBuffer, offset: number): [json: unknown, offset: number] => {
  return decodeView(new DataView(buf), offset);
};
