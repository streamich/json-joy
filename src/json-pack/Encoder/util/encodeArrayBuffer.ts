import {writeBuffer} from "./writeBuffer";

export const encodeArrayBuffer = (view: DataView, offset: number, buf: ArrayBuffer): number => {
  const length = buf.byteLength
  if (length <= 0xFF) {
    view.setUint16(offset, (0xc4 << 8) | length);
    offset += 2;
    const dest = new Uint8Array(view.buffer);
    const src = new Uint8Array(buf);
    dest.set(src, offset);
    return offset + length;
  } else if (length <= 0xFFFF) {
    view.setUint8(offset++, 0xc5);
    view.setUint16(offset, length);
    offset += 2;
    writeBuffer(view, buf, offset);
    return offset + length;
  } else if (length <= 0xFFFFFFFF) {
    view.setUint8(offset++, 0xc6);
    view.setUint32(offset, length);
    offset += 4;
    writeBuffer(view, buf, offset);
    return offset + length;
  }
  return offset;
};
