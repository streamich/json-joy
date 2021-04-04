export const isUint8Array = (x: unknown): x is Uint8Array =>
  x instanceof Uint8Array || Buffer.isBuffer(x);
