import {readUvint} from '../readUvint';

test('can read single byte uvint', () => {
  expect(readUvint(new Uint8Array([0]), 0)).toEqual([0, 1])
  expect(readUvint(new Uint8Array([1]), 0)).toEqual([1, 1])
  expect(readUvint(new Uint8Array([65]), 0)).toEqual([65, 1])
  expect(readUvint(new Uint8Array([0b1111111]), 0)).toEqual([0b1111111, 1])
});

test('can read two byte uvint', () => {
  expect(readUvint(new Uint8Array([0b10000000, 0b00000001]), 0)).toEqual([0x80, 2])
  expect(readUvint(new Uint8Array([0b11111111, 0b00000001]), 0)).toEqual([0xff, 2])
  expect(readUvint(new Uint8Array([0b10101100, 0b00000010]), 0)).toEqual([0x012c, 2])
});

test('can read three byte uvint', () => {
  expect(readUvint(new Uint8Array([0b10000000, 0b10000000, 0b00000001]), 0)).toEqual([0x4000, 3])
});
