import {CrdtWriter} from '../CrdtWriter';
import {CrdtReader} from '../CrdtReader';

const encoder = new CrdtWriter();
const decoder = new CrdtReader();
const encode = (a: number, b: number): Uint8Array => {
  encoder.reset();
  encoder.id(a, b);
  return encoder.flush();
};
const decode = (uint8: Uint8Array): [number, number] => {
  decoder.reset(uint8);
  return decoder.id();
};

const ints: [number, number][] = [
  [0, 0],
  [1, 1],
  [1, 2 ** 2 + 1],
  [1, 2 ** 4 + 1],
  [1, 2 ** 5 + 1],
  [1, 2 ** 8 + 1],
  [1, 2 ** 11 + 1],
  [1, 2 ** 13 + 1],
  [2, 2 ** 13 + 1],
  [3, 2 ** 13 + 1],
  [2 ** 3 + 1, 2 ** 13 + 1],
  [2 ** 4 + 1, 2 ** 13 + 1],
  [2 ** 5 + 1, 2 ** 13 + 1],
  [2 ** 8 + 1, 2 ** 13 + 1],
  [2 ** 9 + 1, 2 ** 13 + 1],
  [2 ** 10 + 1, 2 ** 13 + 1],
  [2 ** 10 + 1, 0],
  [2 ** 10 + 1, 1],
];

test('decodes integers correctly', () => {
  for (let i = 0; i < ints.length; i++) {
    const [a, b] = ints[i];
    const [c, d] = decode(encode(a, b));
    expect(a).toBe(c);
    expect(b).toBe(d);
  }
});

test('ladder', () => {
  for (let i = 0; i < 28; i++) {
    for (let j = 0; j < 39; j++) {
      const num1 = 2 ** i - 1;
      const num2 = 2 ** j - 1;
      const [res1, res2] = decode(encode(num1, num2));
      expect(res1).toBe(num1);
      expect(res2).toBe(num2);
    }
  }
});
