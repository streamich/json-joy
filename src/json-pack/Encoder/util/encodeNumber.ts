import {isFloat32} from "../../../util/isFloat32";

export const encodeNumber = (view: DataView, offset: number, num: number): number => {
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
    if (num > 0) {
      if (num <= 0xFF) {
        view.setUint16(offset, (0xcc << 8) | num);
        return offset + 2;
      } else if (num <= 0xFFFF) {
        view.setUint8(offset++, 0xcd);
        view.setUint16(offset, num);
        return offset + 2;
      } else if (num <= 0xFFFFFFFF) {
        view.setUint8(offset++, 0xce);
        view.setUint32(offset, num);
        return offset + 4;
      } else if (num <= 9007199254740991) {
        let lo32 = num | 0;
        if (lo32 < 0) lo32 += 4294967296;
        const hi32 = (num - lo32) / 4294967296;
        view.setUint8(offset++, 0xcf);
        view.setUint32(offset, hi32);
        offset += 4;
        view.setUint32(offset, lo32);
        return offset + 4;
      }
    } else {
      if (num > -0x7F) {
        view.setUint16(offset, (0xd0 << 8) | (num & 0xFF));
        return offset + 2;
      } else if (num > -0x7FFF) {
        view.setUint8(offset++, 0xd1);
        view.setInt16(offset, num);
        return offset + 2;
      } else if (num > -0x7FFFFFFF) {
        view.setUint8(offset++, 0xd2);
        view.setInt32(offset, num);
        return offset + 4;
      } else if (num >= -9007199254740991) {
        view.setUint8(offset++, 0xd3);
        let lo32 = num | 0;
        if (lo32 < 0) lo32 += 4294967296;
        const hi32 = (num - lo32) / 4294967296;
        view.setUint32(offset, hi32);
        offset += 4;
        view.setInt32(offset, lo32);
        return offset + 4;
      }
    }
  }
  if (isFloat32(num)) {
    view.setUint8(offset++, 0xca);
    view.setFloat32(offset, num);
    return offset + 4;  
  }
  view.setUint8(offset++, 0xcb);
  view.setFloat64(offset, num);
  return offset + 8;
};
