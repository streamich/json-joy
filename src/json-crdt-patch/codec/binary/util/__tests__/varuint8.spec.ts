import {encodeVarUint8, decodeVarUint8, encodeVarUint8Buf, varUint8Size} from '../varuint8';

describe('encodeVarUint8', () => {
  test('encodes 1 byte numbers', () => {
    expect(encodeVarUint8(0)).toEqual([0]);
    expect(encodeVarUint8(1)).toEqual([1]);
    expect(encodeVarUint8(2)).toEqual([2]);
    expect(encodeVarUint8(126)).toEqual([126]);
    expect(encodeVarUint8(127)).toEqual([127]);
  });

  test('encodes 2 byte numbers', () => {
    expect(encodeVarUint8(128)).toEqual([128, 1]);
    expect(encodeVarUint8(0b01_1111111)).toEqual([0b1111_1111, 1]);
    expect(encodeVarUint8(0b11_1111111)).toEqual([0b1111_1111, 0b11]);
    expect(encodeVarUint8(0b10_1111111)).toEqual([0b1111_1111, 0b10]);
    expect(encodeVarUint8(0b111_0111100)).toEqual([0b1011_1100, 0b111]);
    expect(encodeVarUint8(0b1000_0000000)).toEqual([0b10000000, 0b1000]);
    expect(encodeVarUint8(0b1001000_0000000)).toEqual([0b10000000, 0b1001000]);
  });

  test('encodes 3 byte numbers', () => {
    expect(encodeVarUint8(0b1000000_0000000_0000000)).toEqual([0b1000_0000, 0b1000_0000, 0b1000000]);
    expect(encodeVarUint8(0b101_0010010_1001001)).toEqual([0b11001001, 0b10010010, 0b101]);
    expect(encodeVarUint8(0b1000001_0010010_1001001)).toEqual([0b11001001, 0b10010010, 0b1000001]);
  });

  test('encodes 4 byte numbers', () => {
    expect(encodeVarUint8(0b1_0001011_0010010_1100001)).toEqual([0b1110_0001, 0b1001_0010, 0b1000_1011, 1]);
    expect(encodeVarUint8(0b10110_0001011_0010010_1100001)).toEqual([0b1110_0001, 0b1001_0010, 0b1000_1011, 0b10110]);
    expect(encodeVarUint8(0b1111111_0001011_0010010_1100001)).toEqual([
      0b1110_0001, 0b1001_0010, 0b1000_1011, 0b1111111,
    ]);
  });

  test('encodes 5 byte numbers', () => {
    expect(encodeVarUint8(0b1_1000000_0001011_0010010_1100001)).toEqual([
      0b11100001, 0b10010010, 0b10001011, 0b11000000, 1,
    ]);
    expect(encodeVarUint8(0b10_1111111_0000000_0000111_1111000)).toEqual([
      0b11111000, 0b10000111, 0b10000000, 0b11111111, 0b10,
    ]);
    expect(encodeVarUint8(0b1011_1111111_0000000_0000111_1111000)).toEqual([
      0b11111000, 0b10000111, 0b10000000, 0b11111111, 0b1011,
    ]);
    expect(encodeVarUint8(0b1011101_1111111_0000000_0000111_1111000)).toEqual([
      0b11111000, 0b10000111, 0b10000000, 0b11111111, 0b1011101,
    ]);
  });

  test('encodes 6 byte numbers', () => {
    expect(encodeVarUint8(0b1_1111111_1111111_0000000_0000111_1111000)).toEqual([
      0b11111000, 0b10000111, 0b10000000, 0b11111111, 0b11111111, 1,
    ]);
    expect(encodeVarUint8(0b11_1111111_1111111_0000000_0000111_1111000)).toEqual([
      0b11111000, 0b10000111, 0b10000000, 0b11111111, 0b11111111, 0b11,
    ]);
    expect(encodeVarUint8(0b10_1111111_1111111_0000000_0000111_1111000)).toEqual([
      0b11111000, 0b10000111, 0b10000000, 0b11111111, 0b11111111, 0b10,
    ]);
    expect(encodeVarUint8(0b1010101_1111111_1111111_0000000_0000111_1111000)).toEqual([
      0b11111000, 0b10000111, 0b10000000, 0b11111111, 0b11111111, 0b1010101,
    ]);
  });

  test('encodes 7 byte numbers', () => {
    expect(encodeVarUint8(0b1_1010101_1111111_1111111_0000000_0000111_1111000)).toEqual([
      0b11111000, 0b10000111, 0b10000000, 0b11111111, 0b11111111, 0b11010101, 0b1,
    ]);
    expect(encodeVarUint8(0b1111000_1010101_1111111_1111111_0000000_0000111_1111000)).toEqual([
      0b11111000, 0b10000111, 0b10000000, 0b11111111, 0b11111111, 0b11010101, 0b1111000,
    ]);
  });

  test('encodes 8 byte numbers', () => {
    expect(encodeVarUint8(0b1_1111000_1010101_1111111_1111111_0000000_0000111_1111000)).toEqual([
      0b11111000, 0b10000111, 0b10000000, 0b11111111, 0b11111111, 0b11010101, 0b11111000, 0b1,
    ]);
    expect(encodeVarUint8(0b1111111_1111000_1010101_1111111_1111111_0000000_0000111_1111000)).toEqual([
      0b11111000, 0b10000111, 0b10000000, 0b11111111, 0b11111111, 0b11010101, 0b11111000, 0b1111111,
    ]);
  });
});

describe('decodeVarUint8', () => {
  test('decodes 1 byte numbers', () => {
    const nums = [0, 1, 126, 127];
    for (const num of nums) expect(decodeVarUint8(encodeVarUint8Buf(num), 0)[0]).toBe(num);
  });

  test('decodes 2 byte numbers', () => {
    const nums = [128, 0b1111_1111, 0b1_1111_1111, 0b11_1011_1100, 0b1000_0000000];
    for (const num of nums) expect(decodeVarUint8(encodeVarUint8Buf(num), 0)[0]).toBe(num);
  });

  test('decodes 3 byte numbers', () => {
    const nums = [0b1000000_0000000_0000000, 0b101_0010010_1001001];
    for (const num of nums) expect(decodeVarUint8(encodeVarUint8Buf(num), 0)[0]).toBe(num);
  });

  test('decodes 4 byte numbers', () => {
    const nums: number[] = [0b10110_0001011_0010010_1100001, 0b1111111_0001011_0010010_1100001];
    for (const num of nums) expect(decodeVarUint8(encodeVarUint8Buf(num), 0)[0]).toBe(num);
  });

  test('decodes 5 byte numbers', () => {
    const nums: number[] = [0b1010001_1111111_0001011_0010010_1100001, 0b1111111_0000000_1111111_0000000_1111111];
    for (const num of nums) expect(decodeVarUint8(encodeVarUint8Buf(num), 0)[0]).toBe(num);
  });

  test('decodes 6 byte numbers', () => {
    const nums: number[] = [
      0b1_1010001_1111111_0001011_0010010_1100001, 0b1111111_1010001_1111111_0001011_0010010_1100001,
      0b1011011_1010001_1111111_0001011_0010010_1100001,
    ];
    for (const num of nums) expect(decodeVarUint8(encodeVarUint8Buf(num), 0)[0]).toBe(num);
  });

  test('decodes 7 byte numbers', () => {
    const nums: number[] = [
      0b1_1011011_1010001_1111111_0001011_0010010_1100001, 0b1000111_1011011_1010001_1111111_0001011_0010010_1100001,
      0b1111111_1011011_1010001_1111111_0001011_0010010_1100001,
    ];
    for (const num of nums) expect(decodeVarUint8(encodeVarUint8Buf(num), 0)[0]).toBe(num);
  });

  test('decodes 8 byte numbers', () => {
    const nums: number[] = [
      0b1_1111111_1011011_1010001_1111111_0001011_0010010_1100001,
      0b11_1111111_1011011_1010001_1111111_0001011_0010010_1100001,
      0b111_1111111_1011011_1010001_1111111_0001011_0010010_1100001,
      0b1111_1111111_1011011_1010001_1111111_0001011_0010010_1100001,
      0b11111_1111111_1011011_1010001_1111111_0001011_0010010_1100001,
      0b111111_1111111_1011011_1010001_1111111_0001011_0010010_1100001,
      0b11111111_1111111_1011011_1010001_1111111_0001011_0010010_1100001,
    ];
    for (const num of nums) expect(decodeVarUint8(encodeVarUint8Buf(num), 0)[0]).toBe(num);
  });
});

describe('varUint8Size', () => {
  test('returns 1 for one byte numbers', () => {
    expect(varUint8Size(1)).toBe(1);
    expect(varUint8Size(0)).toBe(1);
    expect(varUint8Size(0b10)).toBe(1);
    expect(varUint8Size(0b100)).toBe(1);
    expect(varUint8Size(0b1000)).toBe(1);
    expect(varUint8Size(0b10000)).toBe(1);
    expect(varUint8Size(0b100000)).toBe(1);
    expect(varUint8Size(0b1000000)).toBe(1);
    expect(varUint8Size(0b1111111)).toBe(1);
  });

  test('returns 2 for two byte numbers', () => {
    expect(varUint8Size(0b1_1111111)).toBe(2);
    expect(varUint8Size(0b1111111_1111111)).toBe(2);
  });

  test('returns 3 for three byte numbers', () => {
    expect(varUint8Size(0b1_1111111_1111111)).toBe(3);
    expect(varUint8Size(0b1111111_1111111_1111111)).toBe(3);
  });

  test('returns 4 for four byte numbers', () => {
    expect(varUint8Size(0b1_1111111_1111111_1111111)).toBe(4);
    expect(varUint8Size(0b1111111_1111111_1111111_1111111)).toBe(4);
  });

  test('returns 5 for five byte numbers', () => {
    expect(varUint8Size(0b1_1111111_1111111_1111111_1111111)).toBe(5);
    expect(varUint8Size(0b1111111_1111111_1111111_1111111_1111111)).toBe(5);
  });

  test('returns 6 for six byte numbers', () => {
    expect(varUint8Size(0b1_1111111_1111111_1111111_1111111_1111111)).toBe(6);
    expect(varUint8Size(0b1111111_1111111_1111111_1111111_1111111_1111111)).toBe(6);
  });

  test('returns 7 for seven byte numbers', () => {
    expect(varUint8Size(0b1_1111111_1111111_1111111_1111111_1111111_1111111)).toBe(7);
    expect(varUint8Size(0b1111111_1111111_1111111_1111111_1111111_1111111_1111111)).toBe(7);
  });

  test('returns 8 for eight byte numbers', () => {
    expect(varUint8Size(0b1_1111111_1111111_1111111_1111111_1111111_1111111_1111111)).toBe(8);
    expect(varUint8Size(0b1111111_1111111_1111111_1111111_1111111_1111111_1111111_1111111)).toBe(8);
  });
});
