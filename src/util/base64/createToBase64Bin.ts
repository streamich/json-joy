import {alphabet} from './constants';

export const createToBase64Bin = (chars: string = alphabet, pad: string = '=') => {
  if (chars.length !== 64) throw new Error('chars must be 64 characters long');

  const table = chars.split('').map((c) => c.charCodeAt(0));
  const table2: number[] = [];

  for (const c1 of table) {
    for (const c2 of table) {
      const two = (c1 << 8) + c2;
      table2.push(two);
    }
  }

  const doAddPadding = pad.length === 1;
  const E: number = doAddPadding ? pad.charCodeAt(0) : 0;
  const EE: number = doAddPadding ? (E << 8) | E : 0;

  return (uint8: Uint8Array, start: number, length: number, dest: DataView, offset: number): number => {
    const extraLength = length % 3;
    const baseLength = length - extraLength;
    for (; start < baseLength; start += 3) {
      const o1 = uint8[start];
      const o2 = uint8[start + 1];
      const o3 = uint8[start + 2];
      const v1 = (o1 << 4) | (o2 >> 4);
      const v2 = ((o2 & 0b1111) << 8) | o3;
      dest.setInt32(offset, (table2[v1] << 16) + table2[v2]);
      offset += 4;
    }
    if (extraLength === 1) {
      const o1 = uint8[baseLength];
      if (doAddPadding) {
        dest.setInt32(offset, (table2[o1 << 4] << 16) + EE);
        offset += 4;
      } else {
        dest.setInt16(offset, table2[o1 << 4]);
        offset += 2;
      }
    } else if (extraLength) {
      const o1 = uint8[baseLength];
      const o2 = uint8[baseLength + 1];
      const v1 = (o1 << 4) | (o2 >> 4);
      const v2 = (o2 & 0b1111) << 2;
      if (doAddPadding) {
        dest.setInt32(offset, (table2[v1] << 16) + (table[v2] << 8) + E);
        offset += 4;
      } else {
        dest.setInt16(offset, table2[v1]);
        offset += 2;
        dest.setInt8(offset, table[v2]);
        offset += 1;
      }
    }
    return offset;
  };
};
