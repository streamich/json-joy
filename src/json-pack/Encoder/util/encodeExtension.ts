import {JsonPackExtension} from "../../JsonPackExtension";
import {writeBuffer} from "./writeBuffer";

const encodeFixedLenExtension = (view: DataView, offset: number, buf: ArrayBuffer, firstTwo: number): number => {
  view.setUint16(offset, firstTwo);
  return writeBuffer(view, buf, offset + 2);
};

export const encodeExtension = (view: DataView, offset: number, ext: JsonPackExtension): number => {
  const {type, buf} = ext;
  const length = buf.byteLength;
  switch(length) {
    case 1: return encodeFixedLenExtension(view, offset, buf, (0xd4 << 8) | type);
    case 2: return encodeFixedLenExtension(view, offset, buf, (0xd5 << 8) | type);
    case 4: return encodeFixedLenExtension(view, offset, buf, (0xd6 << 8) | type);
    case 8: return encodeFixedLenExtension(view, offset, buf, (0xd7 << 8) | type);
    case 16: return encodeFixedLenExtension(view, offset, buf, (0xd8 << 8) | type);
  }
  if (length <= 0xFF) {
    view.setUint16(offset, (0xc7 << 8) | length);
    offset += 2;
    view.setUint8(offset++, type);
    return writeBuffer(view, buf, offset);
  } else if (length <= 0xFFFF) {
    view.setUint8(offset++, 0xc8);
    view.setUint16(offset, length);
    offset += 2;
    view.setUint8(offset++, type);
    return writeBuffer(view, buf, offset);
  } else if (length <= 0xFFFFFFFF) {
    view.setUint8(offset++, 0xc9);
    view.setUint32(offset, length);
    offset += 4;
    view.setUint8(offset++, type);
    return writeBuffer(view, buf, offset);
  }
  return offset;
};
