// Variable length encoding for unsigned 57-bit integer (53-bit in JavaScript).

/**
 * @param uint Number to encode as varuint8
 * @returns Octets of the encoded varuint8 in network order
 */
export const encodeVarUint8 = (uint: number): number[] => {
  if (uint <= 0b1111111) return [uint];
  if (uint <= 0b1111111_1111111)
    return [
      0b10000000 | (uint & 0b1111111),
      (uint & 0b1111111_0000000) >> 7
    ];
  if (uint <= 0b1111111_1111111_1111111)
    return [
      0b10000000 | (uint & 0b1111111),
      0b10000000 | ((uint >> 7) & 0b1111111),
      (uint & 0b1111111_0000000_0000000) >> 14,
    ];
  if (uint <= 0b1111111_1111111_1111111_1111111) 
    return [
      0b10000000 | (uint & 0b1111111),
      0b10000000 | ((uint >> 7) & 0b1111111),
      0b10000000 | ((uint >> 14) & 0b1111111),
      (uint & 0b1111111_0000000_0000000_0000000) >> 21,
    ];
  if (uint <= 0b1111111_1111111_1111111_1111111_1111111) {
    let lo32 = uint | 0;
    if (lo32 < 0) lo32 += 4294967296;
    const hi32 = (uint - lo32) / 4294967296;
    return [
      0b10000000 | (uint & 0b1111111),
      0b10000000 | ((uint >> 7) & 0b1111111),
      0b10000000 | ((uint >> 14) & 0b1111111),
      0b10000000 | ((uint >> 21) & 0b1111111),
      (hi32 << 4) | (uint >>> 28),
    ];
  }
  let lo32 = uint | 0;
  if (lo32 < 0) lo32 += 4294967296;
  const hi32 = (uint - lo32) / 4294967296;
  if (uint <= 0b1111111_1111111_1111111_1111111_1111111_1111111)
    return [
      0b10000000 | (uint & 0b1111111),
      0b10000000 | ((uint >> 7) & 0b1111111),
      0b10000000 | ((uint >> 14) & 0b1111111),
      0b10000000 | ((uint >> 21) & 0b1111111),
      0b10000000 | ((hi32 & 0b111) << 4) | (uint >>> 28),
      hi32 >>> 3,
    ];
  if (uint <= 0b1111111_1111111_1111111_1111111_1111111_1111111_1111111)
    return [
      0b10000000 | (uint & 0b1111111),
      0b10000000 | ((uint >> 7) & 0b1111111),
      0b10000000 | ((uint >> 14) & 0b1111111),
      0b10000000 | ((uint >> 21) & 0b1111111),
      0b10000000 | ((hi32 & 0b111) << 4) | (uint >>> 28),
      0b10000000 | ((hi32 & 0b1111111_000) >>> 3),
      hi32 >>> 10,
    ];
  return [
    0b10000000 | (uint & 0b1111111),
    0b10000000 | ((uint >> 7) & 0b1111111),
    0b10000000 | ((uint >> 14) & 0b1111111),
    0b10000000 | ((uint >> 21) & 0b1111111),
    0b10000000 | ((hi32 & 0b111) << 4) | (uint >>> 28),
    0b10000000 | ((hi32 & 0b1111111_000) >>> 3),
    0b10000000 | ((hi32 & 0b1111111_0000000_000) >>> 10),
    hi32 >>> 17,
  ];
};

/**
 * @param uint Unsigned integer which to encode as varuint8
 * @returns Variable length buffer with encoded varuint8 value
 */
export const encodeVarUint8Buf = (uint: number): Uint8Array =>
  new Uint8Array(encodeVarUint8(uint));

/**
 * @param buf Buffer from which to decode varuint8
 * @param offset Byte offset from where to start decoding
 * @returns The decoded varuint8 value and the new offset
 */
export const decodeVarUint8 = (buf: Uint8Array, offset: number): [num: number, offset: number] => {
  const o1 = buf[offset++];
  if (o1 <= 0b01111111) return [o1, offset];
  const o2 = buf[offset++];
  if (o2 <= 0b01111111) return [(o2 << 7) | (o1 & 0b01111111), offset];
  const o3 = buf[offset++];
  if (o3 <= 0b01111111) return [(o3 << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b01111111), offset]
  const o4 = buf[offset++];
  if (o4 <= 0b01111111) return [(o4 << 21) | ((o3 & 0b01111111) << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b01111111), offset];
  const o5 = buf[offset++];
  if (o5 <= 0b01111111) return [(o5 * 0b10000000000000000000000000000) + ((((o4 & 0b01111111) << 21) | (o3 & 0b01111111) << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b0111_1111)), offset];
  const o6 = buf[offset++];
  if (o6 <= 0b01111111) return [(o6 * 0b100000000000000000000000000000000000) + (((o5 & 0b01111111) * 0b10000000000000000000000000000) + ((((o4 & 0b01111111) << 21) | (o3 & 0b01111111) << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b0111_1111))), offset];
  const o7 = buf[offset++];
  if (o7 <= 0b01111111) return [(o7 * 0b1000000000000000000000000000000000000000000) + (((o6 & 0b01111111) * 0b100000000000000000000000000000000000) + (((o5 & 0b01111111) * 0b10000000000000000000000000000) + ((((o4 & 0b01111111) << 21) | (o3 & 0b01111111) << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b0111_1111)))), offset];
  const o8 = buf[offset++];
  return [(o8 * 0b10000000000000000000000000000000000000000000000000) + (((o7 & 0b01111111) * 0b1000000000000000000000000000000000000000000) + (((o6 & 0b01111111) * 0b100000000000000000000000000000000000) + (((o5 & 0b01111111) * 0b10000000000000000000000000000) + ((((o4 & 0b01111111) << 21) | (o3 & 0b01111111) << 14) | ((o2 & 0b01111111) << 7) | (o1 & 0b0111_1111))))), offset];
};

/**
 * @param uint A number to encode as varuint8
 * @returns Size of bytes needed to encode this number
 */
export const varUint8Size = (uint: number): number => {
  if (uint <= 0b1111111) return 1;
  if (uint <= 0b1111111_1111111) return 2;
  if (uint <= 0b1111111_1111111_1111111) return 3;
  if (uint <= 0b1111111_1111111_1111111_1111111) return 4;
  if (uint <= 0b1111111_1111111_1111111_1111111_1111111) return 5;
  if (uint <= 0b1111111_1111111_1111111_1111111_1111111_1111111) return 6;
  if (uint <= 0b1111111_1111111_1111111_1111111_1111111_1111111_1111111) return 7;
  return 8;
};
