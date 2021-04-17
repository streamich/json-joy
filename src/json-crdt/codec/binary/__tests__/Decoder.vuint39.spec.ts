import {LogicalEncoder} from '../LogicalEncoder';
import {LogicalDecoder} from '../LogicalDecoder';

const encoder = new LogicalEncoder();
const decoder = new LogicalDecoder();
const encode = (num: number): Uint8Array => {
  encoder.reset();
  encoder.vuint39(num);
  return encoder.flush();
};
const decode = (uint8: Uint8Array): number => {
  decoder.reset(uint8);
  return decoder.vuint39();
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
];

test('decodes integers correctly', () => {
  for (let i = 0; i < ints.length; i++) {
    const int = ints[i];
    expect(decode(encode(int))).toBe(int);
  }
});
