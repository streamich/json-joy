import {CrdtWriter} from '../CrdtEncoder';
import {CrdtReader} from '../CrdtDecoder';

const encoder = new CrdtWriter();
const decoder = new CrdtReader();
const encode = (x: number, z: number): Uint8Array => {
  encoder.reset();
  encoder.u53vu39(x, z);
  return encoder.flush();
};
const decode = (uint8: Uint8Array): [number, number] => {
  decoder.reset(uint8);
  return decoder.u53vu39();
};

const ids: [number, number][] = [
  [0, 0],
  [1, 1],
  [0b11111_11111111_00000000_10101010_01010101_11110000_00001111, 0b10_11110000],
  [0b11111_11111111_00000000_10101010_01010101_11110000_00001111, 0b1_10_11110000],
  [0b11111_11111111_00000000_10101010_01010101_11110000_00001111, 0b1_1111000_10_11110000],
  [0b11111_11111111_00000000_10101010_01010101_11110000_00001111, 0b1_0101011_1111000_10_11110000],
  [0b11111_11111111_00000000_10101010_01010101_11110000_00001111, 0b1_0000001_0101011_1111000_10_11110000],
];

test('decodes integers correctly', () => {
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    expect(decode(encode(id[0], id[1]))).toEqual(id);
  }
});

test('ladder', () => {
  for (let i = 0; i < 54; i++) {
    for (let j = 0; j < 39; j++) {
      const num1 = 2 ** i - 1;
      const num2 = 2 ** j - 1;
      const [res1, res2] = decode(encode(num1, num2));
      expect(res1).toBe(num1);
      expect(res2).toBe(num2);
    }
  }
});
