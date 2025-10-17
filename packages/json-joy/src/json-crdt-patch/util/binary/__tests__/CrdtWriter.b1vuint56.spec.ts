import {CrdtWriter} from '../CrdtWriter';

const encoder = new CrdtWriter(1);
const encode = (flag: boolean, num: number): Uint8Array => {
  encoder.reset();
  encoder.b1vu56(flag ? 1 : 0, num);
  return encoder.flush();
};

test('encodes one byte integers', () => {
  expect(encode(false, 0)).toEqual(new Uint8Array([0b0_0_000000]));
  expect(encode(true, 0)).toEqual(new Uint8Array([0b1_0_000000]));
  expect(encode(false, 1)).toEqual(new Uint8Array([0b0_0_000001]));
  expect(encode(true, 1)).toEqual(new Uint8Array([0b1_0_000001]));
  expect(encode(false, 2)).toEqual(new Uint8Array([0b0_0_000010]));
  expect(encode(true, 2)).toEqual(new Uint8Array([0b1_0_000010]));
  expect(encode(false, 0b00111111)).toEqual(new Uint8Array([0b0_0_111111]));
  expect(encode(true, 0b00111111)).toEqual(new Uint8Array([0b1_0_111111]));
  expect(encode(false, 0b00100000)).toEqual(new Uint8Array([0b0_0_100000]));
  expect(encode(true, 0b00100000)).toEqual(new Uint8Array([0b1_0_100000]));
});

test('encodes two byte integers', () => {
  expect(encode(false, 0b1_011111)).toEqual(new Uint8Array([0b0_1_011111, 0b0_0000001]));
  expect(encode(true, 0b1_011111)).toEqual(new Uint8Array([0b1_1_011111, 0b0_0000001]));
  expect(encode(false, 0b10000_011111)).toEqual(new Uint8Array([0b0_1_011111, 0b0_0010000]));
  expect(encode(true, 0b10000_011111)).toEqual(new Uint8Array([0b1_1_011111, 0b0_0010000]));
  expect(encode(false, 0b1000000_111111)).toEqual(new Uint8Array([0b0_1_111111, 0b0_1000000]));
  expect(encode(true, 0b1000000_111111)).toEqual(new Uint8Array([0b1_1_111111, 0b0_1000000]));
  expect(encode(false, 0b1111111_111111)).toEqual(new Uint8Array([0b0_1_111111, 0b0_1111111]));
  expect(encode(true, 0b1111111_111111)).toEqual(new Uint8Array([0b1_1_111111, 0b0_1111111]));
});

test('encodes three byte integers', () => {
  expect(encode(false, 0b1_1111111_111111)).toEqual(new Uint8Array([0b0_1_111111, 0b1_1111111, 0b1]));
  expect(encode(true, 0b1_1111111_111111)).toEqual(new Uint8Array([0b1_1_111111, 0b1_1111111, 0b1]));
  expect(encode(false, 0b1111111_1111111_111111)).toEqual(new Uint8Array([0b0_1_111111, 0b1_1111111, 0b0_1111111]));
  expect(encode(true, 0b1111111_1111111_111111)).toEqual(new Uint8Array([0b1_1_111111, 0b1_1111111, 0b0_1111111]));
});

test('encodes four byte integers', () => {
  expect(encode(false, 0b1_1111111_1111111_111111)).toEqual(
    new Uint8Array([0b0_1_111111, 0b1_1111111, 0b1_1111111, 0b1]),
  );
  expect(encode(true, 0b1_1111111_1111111_111111)).toEqual(
    new Uint8Array([0b1_1_111111, 0b1_1111111, 0b1_1111111, 0b1]),
  );
  expect(encode(false, 0b1111111_1111111_1111111_111111)).toEqual(
    new Uint8Array([0b0_1_111111, 0b1_1111111, 0b1_1111111, 0b0_1111111]),
  );
  expect(encode(true, 0b1111111_1111111_1111111_111111)).toEqual(
    new Uint8Array([0b1_1_111111, 0b1_1111111, 0b1_1111111, 0b0_1111111]),
  );
});

test('encodes five byte integers', () => {
  expect(encode(false, 0b1_1111111_1111111_1111111_111111)).toEqual(
    new Uint8Array([0b0_1_111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1]),
  );
  expect(encode(true, 0b1_1111111_1111111_1111111_111111)).toEqual(
    new Uint8Array([0b1_1_111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1]),
  );
  expect(encode(false, 0b1111111_1111111_1111111_1111111_111111)).toEqual(
    new Uint8Array([0b0_1_111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b0_1111111]),
  );
  expect(encode(true, 0b1111111_1111111_1111111_1111111_111111)).toEqual(
    new Uint8Array([0b1_1_111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b0_1111111]),
  );
});

test('encodes size byte integers', () => {
  expect(encode(false, 0b1_1111111_1111111_1111111_1111111_111111)).toEqual(
    new Uint8Array([0b0_1_111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1]),
  );
  expect(encode(true, 0b1_1111111_1111111_1111111_1111111_111111)).toEqual(
    new Uint8Array([0b1_1_111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1]),
  );
  expect(encode(false, 0b1111111_1111111_1111111_1111111_1111111_111111)).toEqual(
    new Uint8Array([0b0_1_111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b0_1111111]),
  );
  expect(encode(true, 0b1111111_1111111_1111111_1111111_1111111_111111)).toEqual(
    new Uint8Array([0b1_1_111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b0_1111111]),
  );
});

test('encodes seven byte integers', () => {
  expect(encode(false, 0b1_1111111_1111111_1111111_1111111_1111111_111111)).toEqual(
    new Uint8Array([0b0_1_111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1]),
  );
  expect(encode(true, 0b1_1111111_1111111_1111111_1111111_1111111_111111)).toEqual(
    new Uint8Array([0b1_1_111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1]),
  );
  expect(encode(false, 0b1111111_1111111_1111111_1111111_1111111_1111111_111111)).toEqual(
    new Uint8Array([0b0_1_111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b0_1111111]),
  );
  expect(encode(true, 0b1111111_1111111_1111111_1111111_1111111_1111111_111111)).toEqual(
    new Uint8Array([0b1_1_111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b0_1111111]),
  );
});

test('encodes eight byte integers', () => {
  expect(encode(false, 0b10_1111111_1111111_1111111_1111111_1111111_1111111_111111)).toEqual(
    new Uint8Array([0b0_1_111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b10]),
  );
  expect(encode(true, 0b10_1111111_1111111_1111111_1111111_1111111_1111111_111111)).toEqual(
    new Uint8Array([0b1_1_111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b1_1111111, 0b10]),
  );
});
