import {LogicalEncoder} from '../LogicalEncoder';

const encoder = new LogicalEncoder();
const encode = (x: number, y: number): Uint8Array => {
  encoder.reset();
  encoder.id(x, y);
  return encoder.flush();
};

test('encodes one byte ID', () => {
  expect(encode(0b000, 0b0000)).toEqual(new Uint8Array([0b0_000_0000]));
  expect(encode(0b001, 0b1000)).toEqual(new Uint8Array([0b0_001_1000]));
  expect(encode(0b101, 0b1010)).toEqual(new Uint8Array([0b0_101_1010]));
  expect(encode(0b111, 0b1111)).toEqual(new Uint8Array([0b0_111_1111]));
});

test('encodes 28 bit session index and 4 bit time difference', () => {
  expect(encode(0b11111111_0000000_1111000_000000, 0b1011)).toEqual(
    new Uint8Array([0b1_1_000000, 0b11111000, 0b10000000, 0b11111111, 0b00001011]),
  );
});

test('encodes 3 bit session index and 39 bit time difference', () => {
  expect(encode(0b111, 0b1000_1010101_1110000_0001111_0000000_1111111)).toEqual(
    new Uint8Array([0b1_0_000111, 0b11111111, 0b10000000, 0b10001111, 0b11110000, 0b11010101, 0b00001000]),
  );
});

test('encodes 28 bit session index and 39 bit time difference', () => {
  expect(encode(0b11111111_0000000_1111000_000000, 0b1000_1010101_1110000_0001111_0000000_1111111)).toEqual(
    new Uint8Array([
      0b1_1_000000,
      0b11111000,
      0b10000000,
      0b11111111,
      0b11111111,
      0b10000000,
      0b10001111,
      0b11110000,
      0b11010101,
      0b00001000,
    ]),
  );
});
