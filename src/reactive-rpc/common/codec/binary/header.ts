export const getHeaderSize = (length: number): number => {
  if (length <= 0b1111) return 1;
  if (length <= 0b1111111_1111) return 2;
  if (length <= 0b1111111_1111111_1111) return 3;
  return 4;
};

export const writeHeader = (arr: Uint8Array, offset: number, type: number, length: number): number => {
  if (length <= 0b1111) {
    arr[offset++] = (type << 5) | length;
    return offset;
  }
  if (length <= 0b1111111_1111) {
    arr[offset++] = (type << 5) | 0b10000 | (0b1111 & length);
    arr[offset++] = length >>> 4;
    return offset;
  }
  if (length <= 0b1111111_1111111_1111) {
    arr[offset++] = (type << 5) | 0b10000 | (0b1111 & length);
    arr[offset++] = 0b10000000 | ((length >>> 4) & 0xff);
    arr[offset++] = length >>> 11;
    return offset;
  }
  if (length <= 0b1111111_1111111_1111111_1111) {
    arr[offset++] = (type << 5) | 0b10000 | (0b1111 & length);
    arr[offset++] = 0b10000000 | ((length >>> 4) & 0xff);
    arr[offset++] = 0b10000000 | ((length >>> 11) & 0xff);
    arr[offset++] = length >>> 18;
    return offset;
  }
  throw new Error('LENGTH_TOO_BIG');
};

export const readHeader = (byte1: number, arr: Uint8Array, offset: number): [length: number, offset: number] => {
  let more = byte1 & 0b10000;
  let value = byte1 & 0b1111;
  if (!more) return [value, offset];

  let octet = arr[offset++];
  more = octet & 0b10000000;
  value = (octet << 4) | value;
  if (!more) return [value, offset];

  octet = arr[offset++];
  more = octet & 0b10000000;
  value = (octet << 11) | value;
  if (!more) return [value, offset];

  octet = arr[offset++];
  value = (octet << 18) | value;
  return [value, offset];
};
