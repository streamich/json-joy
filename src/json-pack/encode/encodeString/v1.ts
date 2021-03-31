import {encodeString as encodeStringRaw} from "../../../util/encodeString";
import {writeBuffer} from "../writeBuffer";

export const encodeString = (view: DataView, offset: number, str: string): number => {
  const buf = encodeStringRaw(str);
  const size = buf.byteLength;
  if (size <= 0b11111) {
    view.setUint8(offset++, 0b10100000 | size);
    writeBuffer(view, buf, offset);
    return offset + size;
  }
  if (size <= 0xFF) {
    view.setUint8(offset++, 0xd9);
    view.setUint8(offset++, size);
    writeBuffer(view, buf, offset);
    return offset + size;
  }
  if (size <= 0xFFFF) {
    view.setUint8(offset++, 0xda);
    view.setUint16(offset, size);
    offset += 2;
    writeBuffer(view, buf, offset);
    return offset + size;
  }
  if (size <= 0xFFFFFFFF) {
    view.setUint8(offset++, 0xdb);
    view.setUint32(offset, size);
    offset += 4;
    writeBuffer(view, buf, offset);
    return offset + size;
  }
  return offset;
};
