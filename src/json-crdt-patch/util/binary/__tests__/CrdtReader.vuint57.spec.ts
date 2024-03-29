import {CrdtWriter} from '../CrdtWriter';
import {CrdtReader} from '../CrdtReader';

const encoder = new CrdtWriter();
const decoder = new CrdtReader();
const encode = (num: number): Uint8Array => {
  encoder.reset();
  encoder.vu57(num);
  return encoder.flush();
};
const decode = (uint8: Uint8Array): number => {
  decoder.reset(uint8);
  return decoder.vu57();
};

const ints: number[] = [
  0,
  2 ** 0,
  2 ** 1,
  2 ** 2,
  2 ** 3,
  2 ** 4,
  2 ** 5,
  2 ** 6,
  2 ** 7,
  2 ** 8,
  2 ** 9,
  2 ** 10,
  2 ** 11,
  2 ** 12,
  2 ** 13,
  2 ** 14,
  2 ** 15,
  2 ** 16,
  2 ** 17,
  2 ** 18,
  2 ** 19,
  2 ** 20,
  2 ** 21,
  2 ** 22,
  2 ** 23,
  2 ** 24,
  2 ** 25,
  2 ** 26,
  2 ** 27,
  2 ** 28,
  2 ** 29,
  2 ** 30,
  2 ** 31,
  2 ** 32,
  2 ** 33,
  2 ** 34,
  2 ** 35,
  2 ** 36,
  2 ** 37,
  2 ** 38,
  2 ** 39,
  2 ** 40,
  2 ** 41,
  2 ** 42,
  2 ** 43,
  2 ** 44,
  2 ** 45,
  2 ** 46,
  2 ** 47,
  2 ** 48,
  2 ** 49,
  2 ** 50,
  2 ** 51,
  2 ** 52,
  2 ** 53,

  2 ** 0 - 1,
  2 ** 1 - 1,
  2 ** 2 - 1,
  2 ** 3 - 1,
  2 ** 4 - 1,
  2 ** 5 - 1,
  2 ** 6 - 1,
  2 ** 7 - 1,
  2 ** 8 - 1,
  2 ** 9 - 1,
  2 ** 10 - 1,
  2 ** 11 - 1,
  2 ** 12 - 1,
  2 ** 13 - 1,
  2 ** 14 - 1,
  2 ** 15 - 1,
  2 ** 16 - 1,
  2 ** 17 - 1,
  2 ** 18 - 1,
  2 ** 19 - 1,
  2 ** 20 - 1,
  2 ** 21 - 1,
  2 ** 22 - 1,
  2 ** 23 - 1,
  2 ** 24 - 1,
  2 ** 25 - 1,
  2 ** 26 - 1,
  2 ** 27 - 1,
  2 ** 28 - 1,
  2 ** 29 - 1,
  2 ** 30 - 1,
  2 ** 31 - 1,
  2 ** 32 - 1,
  2 ** 33 - 1,
  2 ** 34 - 1,
  2 ** 35 - 1,
  2 ** 36 - 1,
  2 ** 37 - 1,
  2 ** 38 - 1,
  2 ** 39 - 1,
  2 ** 40 - 1,
  2 ** 41 - 1,
  2 ** 42 - 1,
  2 ** 43 - 1,
  2 ** 44 - 1,
  2 ** 45 - 1,
  2 ** 46 - 1,
  2 ** 47 - 1,
  2 ** 48 - 1,
  2 ** 49 - 1,
  2 ** 50 - 1,
  2 ** 51 - 1,
  2 ** 52 - 1,
  2 ** 53 - 1,

  0b111_1111111_1111111_1111111_1111111_1111111_1111111_1111111,
  0b111_1111111_1111111_1111111_1111111_0000000_1111111,
  0b111_1111111_1111111_1010101_1111111_1111111,
  0b100_0000000_0000000_0000000_0000000_0000000_0000000_0000000,
  0b100_0000000_0000000_0101010_0000000_0000000_0000000,
  0b100_0000000_0000000_0000000_0000000_1110001,
];

test('decodes integers correctly', () => {
  for (let i = 0; i < ints.length; i++) {
    const int = ints[i];
    expect(decode(encode(int))).toBe(int);
  }
});
