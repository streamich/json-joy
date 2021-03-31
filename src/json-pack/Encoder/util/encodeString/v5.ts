export const encodeString = (view: DataView, offset: number, str: string): number => {
  const length = str.length;
  const maxSize = length * 4;
  let lengthOffset: number = offset;
  if (maxSize <= 0b11111) offset++;
  else if (maxSize <= 0xFF) {
    view.setUint8(offset++, 0xd9);
    lengthOffset = offset;
    offset += 1;
  } else {
    view.setUint8(offset++, 0xdb);
    lengthOffset = offset;
    offset += 4;
  }
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
      view.setUint8(offset++, 0x80 | ((chr >>> 6) & 0x3F));
      view.setUint8(offset++, 0x80 | (chr & 0x3F));
    }
  }
  if (maxSize <= 0b11111) view.setUint8(lengthOffset, 0b10100000 | (offset - lengthOffset - 1));
  else if (maxSize <= 0xFF) view.setUint8(lengthOffset, offset - lengthOffset - 1);
  else view.setUint32(lengthOffset, offset - lengthOffset - 4);
  return offset;
};
