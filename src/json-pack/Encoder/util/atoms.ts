export const encodeNull = (view: DataView, offset: number): number => {
  view.setUint8(offset++, 0xc0);
  return offset;
};

export const encodeFalse = (view: DataView, offset: number): number => {
  view.setUint8(offset++, 0xc2);
  return offset;
};

export const encodeTrue = (view: DataView, offset: number): number => {
  view.setUint8(offset++, 0xc3);
  return offset;
};
