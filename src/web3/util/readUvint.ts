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
export const readUvint = (buf: Uint8Array, offset: number): [value: number, offset: number] => {
  const octet1 = buf[offset++];
  if (!(octet1 & 0b10000000)) return [octet1, offset];
  const octet2 = buf[offset++];
  if (!(octet2 & 0b10000000)) return [(octet2 << 7) | (octet1 & 0b01111111), offset];
  const octet3 = buf[offset++];
  if (!(octet3 & 0b10000000)) return [(octet3 << 14) | ((octet2 & 0b01111111) << 7) | (octet1 & 0b01111111), offset];
  throw new Error('UNSUPPORTED_UVINT');
};
