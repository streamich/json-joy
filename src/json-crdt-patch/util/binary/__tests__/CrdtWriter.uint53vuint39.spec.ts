import {CrdtWriter} from '../CrdtWriter';

const encoder = new CrdtWriter(1);
const encode = (x: number, z: number): Uint8Array => {
  encoder.reset();
  encoder.u53vu39(x, z);
  return encoder.flush();
};

test('encodes the origin clock to all zeroes', () => {
  expect(encode(0, 0)).toEqual(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]));
});

test('encodes simple clock and simple time (1, 1)', () => {
  expect(encode(1, 1)).toEqual(
    new Uint8Array([0b00000000, 0b00000000, 0b00000000, 0b00000001, 0b00000000, 0b00000000, 0b00000000, 0b00000001]),
  );
});

test('encodes a 53 bit session ID and 10 bit time', () => {
  const x = 0b11111_11111111_00000000_10101010_01010101_11110000_00001111;
  const z = 0b10_11110000;
  expect(encode(x, z)).toEqual(
    new Uint8Array([0b10101010, 0b01010101, 0b11110000, 0b00001111, 0b11111111, 0b00000000, 0b11111010, 0b11110000]),
  );
});

test('encodes a 53 bit session ID and 11 bit time', () => {
  const x = 0b11111_11111111_00000000_10101010_01010101_11110000_00001111;
  const z = 0b1_10_11110000;
  expect(encode(x, z)).toEqual(
    new Uint8Array([
      0b10101010, 0b01010101, 0b11110000, 0b00001111, 0b11111111, 0b00000000, 0b11111110, 0b11110000, 0b0_0000001,
    ]),
  );
});

test('encodes a 53 bit session ID and 18 bit time', () => {
  const x = 0b11111_11111111_00000000_10101010_01010101_11110000_00001111;
  const z = 0b1_1111000_10_11110000;
  expect(encode(x, z)).toEqual(
    new Uint8Array([
      0b10101010, 0b01010101, 0b11110000, 0b00001111, 0b11111111, 0b00000000, 0b11111110, 0b11110000, 0b1_1111000,
      0b0_0000001,
    ]),
  );
});

test('encodes a 53 bit session ID and 25 bit time', () => {
  const x = 0b11111_11111111_00000000_10101010_01010101_11110000_00001111;
  const z = 0b1_0101011_1111000_10_11110000;
  expect(encode(x, z)).toEqual(
    new Uint8Array([
      0b10101010, 0b01010101, 0b11110000, 0b00001111, 0b11111111, 0b00000000, 0b11111110, 0b11110000, 0b1_1111000,
      0b1_0101011, 0b0_0000001,
    ]),
  );
});

test('encodes a 53 bit session ID and 32 bit time', () => {
  const x = 0b11111_11111111_00000000_10101010_01010101_11110000_00001111;
  const z = 0b1_0000001_0101011_1111000_10_11110000;
  expect(encode(x, z)).toEqual(
    new Uint8Array([
      0b10101010, 0b01010101, 0b11110000, 0b00001111, 0b11111111, 0b00000000, 0b11111110, 0b11110000, 0b1_1111000,
      0b1_0101011, 0b1_0000001, 0b0_0000001,
    ]),
  );
});
