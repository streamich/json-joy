/**
 * Reads an unsigned variable length integer in MSB Multicodec format up to
 * 3 bytes.
 *
 * @see https://github.com/multiformats/unsigned-varint
 *
 * @param buf Blob from where to read the unsigned variable integer.
 * @param offset Offset from where to start reading.
 * @returns
 */
export const read = (buf: Uint8Array, offset: number): [value: number, offset: number] => {
  const octet1 = buf[offset++];
  if (!(octet1 & 0b10000000)) return [octet1, offset];
  const octet2 = buf[offset++];
  if (!(octet2 & 0b10000000)) return [(octet2 << 7) | (octet1 & 0b01111111), offset];
  const octet3 = buf[offset++];
  if (!(octet3 & 0b10000000)) return [(octet3 << 14) | ((octet2 & 0b01111111) << 7) | (octet1 & 0b01111111), offset];
  throw new Error('UNSUPPORTED_UVINT');
};

/**
 * Write up to 3 bytes of an unsigned variable length integer in MSB Multicodec
 * format.
 *
 * @param buf Blob where to write the unsigned variable integer.
 * @param offset Position where to start writing.
 * @param value Value to write.
 */
export const write = (buf: Uint8Array, offset: number, value: number): number => {
  if (value < 0b10000000) {
    buf[offset] = value;
    return offset + 1;
  }
  if (value < 0b10000000_00000000) {
    buf[offset] = (value & 0b01111111) | 0b10000000;
    buf[offset + 1] = value >> 7;
    return offset + 2;
  }
  if (value < 0b10000000_00000000_00000000) {
    buf[offset] = (value & 0b01111111) | 0b10000000;
    buf[offset + 1] = ((value >> 7) & 0b01111111) | 0b10000000;
    buf[offset + 2] = value >> 14;
    return offset + 3;
  }
  throw new Error('UNSUPPORTED_UVINT');
};
