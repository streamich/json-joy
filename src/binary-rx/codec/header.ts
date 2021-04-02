export const getHeaderSize = (length: number): number => {
  if (length <= 0b1111) return 1;
  if (length <= 0b1111111_1111) return 2;
  if (length <= 0b1111111_1111111_1111) return 3;
  if (length <= 0b1111111_1111111_1111111_1111) return 4;
  if (length <= 0b1111111_1111111_1111111_1111111_1111) return 5;
  if (length <= 0b1111111_1111111_1111111_1111111_1111111_1111) return 6;
  if (length <= 0b1111111_1111111_1111111_1111111_1111111_1111111_1111) return 7;
  return 8;
};

export const writeHeader = (uint8: Uint8Array, offset: number, type: number, length: number): number => {
  if (length <= 0b1111) {
    uint8[offset++] = (type << 5) | length;
    return offset;
  }
  if (length <= 0b1111111_1111) {
    uint8[offset++] = (type << 5) | 0b10000 | (0b1111 & length);
    uint8[offset++] = length >>> 4;
    return offset;
  }
  if (length <= 0b1111111_1111111_1111) {
    uint8[offset++] = (type << 5) | 0b10000 | (0b1111 & length);
    uint8[offset++] = 0b10000000 | ((length >>> 4) & 0xFF);
    uint8[offset++] = length >>> 11;
    return offset;
  }
  if (length <= 0b1111111_1111111_1111111_1111) {
    uint8[offset++] = (type << 5) | 0b10000 | (0b1111 & length);
    uint8[offset++] = 0b10000000 | ((length >>> 4) & 0xFF);
    uint8[offset++] = 0b10000000 | ((length >>> 11) & 0xFF);
    uint8[offset++] = length >>> 18;
    return offset;
  }
  if (length <= 0b1111111_1111111_1111111_1111111_1111) {
    uint8[offset++] = (type << 5) | 0b10000 | (0b1111 & length);
    uint8[offset++] = 0b10000000 | ((length >>> 4) & 0xFF);
    uint8[offset++] = 0b10000000 | ((length >>> 11) & 0xFF);
    uint8[offset++] = 0b10000000 | ((length >>> 18) & 0xFF);
    uint8[offset++] = length >>> 25;
    return offset;
  }
  throw new Error('LENGTH_TOO_BIG');
};
