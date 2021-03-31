import {decodeString} from "../util/decodeString";

export const decode = (buf: ArrayBuffer, offset: number): unknown => {
  const view = new DataView(buf);
  const byte = view.getUint8(offset++);
  switch (byte) {
    case 0xc0: return null;
    case 0xc2: return false;
    case 0xc3: return true;
    case 0xcb: return view.getFloat64(offset);
    case 0xd9: return decodeString(buf, offset + 1, view.getUint8(offset));
    case 0xda: return decodeString(buf, offset + 2, view.getUint16(offset));
    case 0xdb: return decodeString(buf, offset + 4, view.getUint32(offset));
  }
  if (byte <= 0b1111111) return byte;
  const top4 = byte >>> 4;
  const top3 = byte >>> 5;
  switch (top3) {
    case 0b111: return -(byte & 0b11111) - 1;
    case 0b101: return decodeString(buf, offset, byte & 0b11111);
  }
  return undefined;
};
