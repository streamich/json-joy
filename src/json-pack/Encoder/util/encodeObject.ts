import {encodeAny} from "./encodeAny";
import {encodeString} from "./encodeString";

export const encodeObject = (view: DataView, offset: number, obj: Record<string, unknown>): number => {
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
