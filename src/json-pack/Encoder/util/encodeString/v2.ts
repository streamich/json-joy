import {byteLength} from "../../../../util/byteLength";

export const encodeString = (view: DataView, offset: number, str: string): number => {
  const size = byteLength(str);
  if (size <= 0b11111) view.setUint8(offset++, 0b10100000 | size);
  else if (size <= 0xFF) {
    view.setUint16(offset, (0xd9 << 8) | size);
    offset += 2;
  } else if (size <= 0xFFFF) {
    view.setUint8(offset++, 0xda);
    view.setUint16(offset, size);
    offset += 2;
  } else {
    view.setUint8(offset++, 0xdb);
    view.setUint32(offset, size);
    offset += 4;
  }
  var length = str.length;
  var chr = 0;
  var i = 0;
  while (i < length) {
    chr = str.charCodeAt(i++);
    if (chr < 128) {
      view.setUint8(offset++, chr);
    } else if (chr < 0x800) {
      view.setUint8(offset++, 0xC0 | (chr >>> 6));
      view.setUint8(offset++, 0x80 | (chr & 0x3F));
    } else if (chr < 0xD800 || chr > 0xDFFF) {
      view.setUint8(offset++, 0xE0 | (chr >>> 12));
      view.setUint8(offset++, 0x80 | ((chr >>> 6) & 0x3F));
      view.setUint8(offset++, 0x80 | (chr & 0x3F));
    } else {
      chr = (((chr - 0xD800) << 10) | (str.charCodeAt(i++) - 0xDC00)) + 0x10000;
      view.setUint8(offset++, 0xF0 | (chr >>> 18));
      view.setUint8(offset++, 0x80 | ((chr >>> 12) & 0x3F));
      view.setUint8(offset++, 0x80 | ((chr >>> 6)  & 0x3F));
      view.setUint8(offset++, 0x80 | (chr          & 0x3F));
    }
  }
  return offset;
};
