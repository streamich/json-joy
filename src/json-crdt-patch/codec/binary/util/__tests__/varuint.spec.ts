import {encodeVarUInt, decodeVarUint} from '../varuint';

describe('encode', () => {
  test('encodes 1 byte numbers', () => {
    expect(encodeVarUInt(0)).toEqual([0]);
    expect(encodeVarUInt(1)).toEqual([1]);
    expect(encodeVarUInt(2)).toEqual([2]);
    expect(encodeVarUInt(126)).toEqual([126]);
    expect(encodeVarUInt(127)).toEqual([127]);
  });

  test('encodes 2 byte numbers', () => {
    expect(encodeVarUInt(128)).toEqual([128, 1]);
    expect(encodeVarUInt(0b1111_1111)).toEqual([0b1111_1111, 1]);
    expect(encodeVarUInt(0b1_1111_1111)).toEqual([0b1111_1111, 0b11]);
    expect(encodeVarUInt(0b11_1011_1100)).toEqual([0b1011_1100, 0b111]);
    expect(encodeVarUInt(0b1000_0000000)).toEqual([0b1000_0000, 0b1000]);
  });

  test('encodes 3 byte numbers', () => {
    expect(encodeVarUInt(0b1000000_0000000_0000000)).toEqual([0b1000_0000, 0b1000_0000, 0b1000000]);
    expect(encodeVarUInt(0b101_0010010_1001001)).toEqual([0b1100_1001, 0b1001_0010, 0b101]);
  });

  test('encodes 4 byte numbers', () => {
    expect(encodeVarUInt(0b10110_0001011_0010010_1100001)).toEqual([0b1110_0001, 0b1001_0010, 0b1000_1011, 0b10110]);
    expect(encodeVarUInt(0b11111111_0001011_0010010_1100001)).toEqual([
      0b1110_0001,
      0b1001_0010,
      0b1000_1011,
      0b11111111,
    ]);
  });
});

describe('decode', () => {
  test('decodes 1 byte numbers', () => {
    const nums = [0, 1, 126, 127];
    for (const num of nums) expect(decodeVarUint(new Uint8Array(encodeVarUInt(num)), 0)).toBe(num);
  });

  test('decodes 2 byte numbers', () => {
    const nums = [128, 0b1111_1111, 0b1_1111_1111, 0b11_1011_1100, 0b1000_0000000];
    for (const num of nums) expect(decodeVarUint(new Uint8Array(encodeVarUInt(num)), 0)).toBe(num);
  });

  test('decodes 3 byte numbers', () => {
    const nums = [0b1000000_0000000_0000000, 0b101_0010010_1001001];
    for (const num of nums) expect(decodeVarUint(new Uint8Array(encodeVarUInt(num)), 0)).toBe(num);
  });

  test('decodes 4 byte numbers', () => {
    const nums: number[] = [0b10110_0001011_0010010_1100001, 0b11111111_0001011_0010010_1100001];
    for (const num of nums) expect(decodeVarUint(new Uint8Array(encodeVarUInt(num)), 0)).toBe(num);
  });
});
