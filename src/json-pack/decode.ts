export const decode = (view: DataView, offset: number): unknown => {
  const byte = view.getUint8(offset++);
  switch (byte) {
    case 0xc0: return null;
    case 0xc2: return false;
    case 0xc3: return true;
    case 0xcb: return view.getFloat64(offset);
  }
  if (byte <= 0b1111111) return byte;
  if ((byte >>> 5) === 0b111) return -(byte & 0b11111) - 1;
  return undefined;
};
