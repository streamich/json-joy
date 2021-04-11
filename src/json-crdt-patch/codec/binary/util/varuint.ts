/**
 * Encodes up to 29-bits unsigned integer. In the first three bytes 7 bits are
 * encoded, the fourth byte contains 8 bits of data.
 *
 * Encoding follows the following pattern,
 *
 *     |      29-bit unsigned integer      |    |         Network encoding          |
 *     |-----------------------------------|    |-----------------------------------|
 *     | byte 4 | byte 3 | byte 2 | byte 1 |    | byte 1 | byte 3 | byte 2 | byte 1 |
 *     |--------|--------|--------|--------|    |--------|--------|--------|--------|
 *     |00000000|00000000|00000000|0xxxxxxx| -> |0xxxxxxx|
 *     |00000000|00000000|00yyyyyy|yxxxxxxx| -> |1xxxxxxx|0yyyyyyy|
 *     |00000000|000zzzzz|zzyyyyyy|yxxxxxxx| -> |1xxxxxxx|1yyyyyyy|0zzzzzzz|
 *     |000wwwww|wwwzzzzz|zzyyyyyy|yxxxxxxx| -> |1xxxxxxx|1yyyyyyy|1zzzzzzz|wwwwwwww|
 */
export const encodeVarUInt = (uint: number) => {
  if (uint <= 0b01111111) return [uint];
  if (uint <= 0b01111111_11111111) return [0b10000000 | (uint & 0b1111111), (uint & 0b1111111_0000000) >> 7];
  if (uint <= 0b01111111_11111111_11111111)
    return [
      0b10000000 | (uint & 0b1111111),
      0b10000000 | ((uint & 0b1111111_0000000) >> 7),
      (uint & 0b1111111_0000000_0000000) >> 14,
    ];
  return [
    0b10000000 | (uint & 0b1111111),
    0b10000000 | ((uint & 0b1111111_0000000) >> 7),
    0b10000000 | ((uint & 0b1111111_0000000_0000000) >> 14),
    (uint & 0b11111111_0000000_0000000_0000000) >> 21,
  ];
};

/**
 * Decodes variable length integer into a JavaScript number as a 29-bit value.
 */
export const decodeVarUint = (buf: Uint8Array, offset: number): number => {
  const o1 = buf[offset];
  if (o1 <= 0b0111_1111) return o1;
  const o2 = buf[offset + 1];
  if (o2 <= 0b0111_1111) return (o2 << 7) + (o1 & 0b0111_1111);
  const o3 = buf[offset + 2];
  if (o3 <= 0b0111_1111) return (o3 << 14) + ((o2 & 0b0111_1111) << 7) + (o1 & 0b0111_1111);
  const o4 = buf[offset + 3];
  return (o4 << 21) + ((o3 & 0b0111_1111) << 14) + ((o2 & 0b0111_1111) << 7) + (o1 & 0b0111_1111);
};
