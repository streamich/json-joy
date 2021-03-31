export const writeBuffer = (view: DataView, buf: ArrayBuffer, offset: number): number => {
  const dest = new Uint8Array(view.buffer);
  const src = new Uint8Array(buf);
  dest.set(src, offset);
  return offset + buf.byteLength;
};
