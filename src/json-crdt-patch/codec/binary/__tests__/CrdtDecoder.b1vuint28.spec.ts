import {CrdtEncoder} from '../CrdtEncoder';
import {CrdtDecoder} from '../CrdtDecoder';

const encoder = new CrdtEncoder();
const decoder = new CrdtDecoder();
const encode = (flag: boolean, num: number): Uint8Array => {
  encoder.reset();
  encoder.b1vuint28(flag, num);
  return encoder.flush();
};
const decode = (uint8: Uint8Array): [boolean, number] => {
  decoder.reset(uint8);
  return decoder.b1vuint28();
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
];

test('decodes integers correctly', () => {
  for (let i = 0; i < ints.length; i++) {
    const int = ints[i];
    expect(decode(encode(true, int))).toEqual([true, int]);
    expect(decode(encode(false, int))).toEqual([false, int]);
  }
});
