import {encodeAny} from "./encodeAny";

export const encodeArray = (view: DataView, offset: number, arr: unknown[]): number => {
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
