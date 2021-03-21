import {decodeVarUint} from '../decode';
import {encodeVarUInt} from '../encode';

test('decodes 1 byte numbers', () => {
  const nums = [0, 1, 126, 127];
  for (const num of nums)
    expect(decodeVarUint(new Uint8Array(encodeVarUInt(num)), 0)).toBe(num);
});

test('decodes 2 byte numbers', () => {
  const nums = [128, 0b1111_1111, 0b1_1111_1111, 0b11_1011_1100, 0b1000_0000000];
  for (const num of nums)
    expect(decodeVarUint(new Uint8Array(encodeVarUInt(num)), 0)).toBe(num);
});

test('decodes 3 byte numbers', () => {
  const nums = [0b1000000_0000000_0000000, 0b101_0010010_1001001];
  for (const num of nums)
    expect(decodeVarUint(new Uint8Array(encodeVarUInt(num)), 0)).toBe(num);
});

test('decodes 4 byte numbers', () => {
  const nums: number[] = [
    0b10110_0001011_0010010_1100001,
    0b11111111_0001011_0010010_1100001
  ];
  for (const num of nums)
    expect(decodeVarUint(new Uint8Array(encodeVarUInt(num)), 0)).toBe(num);
});
