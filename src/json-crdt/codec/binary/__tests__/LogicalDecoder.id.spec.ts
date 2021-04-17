import {LogicalEncoder} from '../LogicalEncoder';
import {LogicalDecoder} from '../LogicalDecoder';

const encoder = new LogicalEncoder();
const decoder = new LogicalDecoder();
const encode = (x: number, y: number): Uint8Array => {
  encoder.reset();
  encoder.id(x, y);
  return encoder.flush();
};
const decode = (uint8: Uint8Array): [number, number] => {
  decoder.reset(uint8);
  return decoder.id();
};

const ids: [number, number][] = [
  [0b000, 0b0000],
  [0b001, 0b1000],
  [0b101, 0b1010],
  [0b111, 0b1111],
  [0b11111111_0000000_1111000_000000, 0b1011],
  [0b111, 0b1000_1010101_1110000_0001111_0000000_1111111],
  [0b11111111_0000000_1111000_000000, 0b1000_1010101_1110000_0001111_0000000_1111111],
];

test('decodes integers correctly', () => {
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    expect(decode(encode(id[0], id[1]))).toEqual(id);
  }
});
