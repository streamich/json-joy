import {CrdtWriter} from '../CrdtWriter';

const encoder = new CrdtWriter(1);
const encode = (num: number): Uint8Array => {
  encoder.reset();
  encoder.vu57(num);
  return encoder.flush();
};

test('encodes one byte integers', () => {
  expect(encode(0)).toEqual(new Uint8Array([0]));
  expect(encode(1)).toEqual(new Uint8Array([1]));
  expect(encode(2)).toEqual(new Uint8Array([2]));
  expect(encode(0b00111111)).toEqual(new Uint8Array([0b00111111]));
  expect(encode(0b01111111)).toEqual(new Uint8Array([0b01111111]));
  expect(encode(0b01000000)).toEqual(new Uint8Array([0b01000000]));
});

test('encodes two byte integers', () => {
  expect(encode(0b1_0111111)).toEqual(new Uint8Array([0b1_0111111, 0b0_0000001]));
  expect(encode(0b1000_1111111)).toEqual(new Uint8Array([0b1_1111111, 0b0_0001000]));
  expect(encode(0b1000000_1111111)).toEqual(new Uint8Array([0b1_1111111, 0b0_1000000]));
  expect(encode(0b1111111_1111111)).toEqual(new Uint8Array([0b1_1111111, 0b0_1111111]));
});

test('encodes three byte integers', () => {
  expect(encode(0b1_1111111_1111111)).toEqual(new Uint8Array([0b1_1111111, 0b1_1111111, 0b0_0000001]));
  expect(encode(0b1111_1111111_1111111)).toEqual(new Uint8Array([0b1_1111111, 0b1_1111111, 0b0_0001111]));
  expect(encode(0b1111_1111111_1111111)).toEqual(new Uint8Array([0b1_1111111, 0b1_1111111, 0b0_0001111]));
  expect(encode(0b1111000_1111111_1111111)).toEqual(new Uint8Array([0b1_1111111, 0b1_1111111, 0b0_1111000]));
  expect(encode(0b1111111_1111101_1111011)).toEqual(new Uint8Array([0b1_1111011, 0b1_1111101, 0b0_1111111]));
  expect(encode(0b1111111_1111111_1111111)).toEqual(new Uint8Array([0b1_1111111, 0b1_1111111, 0b0_1111111]));
});

test('encodes four byte integers', () => {
  expect(encode(0b1_1111111_1111111_1111111)).toEqual(
    new Uint8Array([0b1_1111111, 0b1_1111111, 0b1_1111111, 0b0_0000001]),
  );
  expect(encode(0b1010101_1111111_1111111_1111111)).toEqual(
    new Uint8Array([0b1_1111111, 0b1_1111111, 0b1_1111111, 0b0_1010101]),
  );
  expect(encode(0b1111111_1111111_1111111_1111111)).toEqual(
    new Uint8Array([0b1_1111111, 0b1_1111111, 0b1_1111111, 0b0_1111111]),
  );
});

test('encodes five byte integers', () => {
  expect(encode(0b1_1111111_1111111_1111111_1111111)).toEqual(
    new Uint8Array([0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b0_0000001]),
  );
  expect(encode(0b1111110_1111110_1111110_1111110_1111110)).toEqual(
    new Uint8Array([0b1_1111110, 0b1_1111110, 0b1_1111110, 0b1_1111110, 0b0_1111110]),
  );
  expect(encode(0b1111111_1111111_1111111_1111111_1111111)).toEqual(
    new Uint8Array([0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b0_1111111]),
  );
});

test('encodes six byte integers', () => {
  expect(encode(0b1_1111111_1111111_1111111_1111111_1111111)).toEqual(
    new Uint8Array([0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b0_0000001]),
  );
  expect(encode(0b1111101_1111111_0000000_1111111_1111111_1111111)).toEqual(
    new Uint8Array([0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_0000000, 0b1_1111111, 0b0_1111101]),
  );
  expect(encode(0b1111111_1111111_1111111_1111111_1111111_1111111)).toEqual(
    new Uint8Array([0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b0_1111111]),
  );
});

test('encodes seven byte integers', () => {
  expect(encode(0b1_1111111_1111111_1111111_1111111_1111111_1111111)).toEqual(
    new Uint8Array([0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b0_0000001]),
  );
  expect(encode(0b1111111_1111111_1111111_1111111_1111111_1111111_1111111)).toEqual(
    new Uint8Array([0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b0_1111111]),
  );
});

test('encodes eight byte integers', () => {
  expect(encode(0b1_1111111_1111111_1111111_1111111_1111111_1111111_1111111)).toEqual(
    new Uint8Array([
      0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b0_0000001,
    ]),
  );
});
