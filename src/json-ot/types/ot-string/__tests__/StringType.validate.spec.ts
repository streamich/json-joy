import {StringType} from '../StringType';

test('returns 0 on valid op', () => {
  expect(StringType.validate(['a'])).toBe(0);
  expect(StringType.validate([1, 'a'])).toBe(0);
  expect(StringType.validate([1, -1, 'a'])).toBe(0);
  expect(StringType.validate([1, -1, ['b'], 'a'])).toBe(0);
});

test('returns non-zero integer on invalid operation', () => {
  expect(StringType.validate([1])).not.toBe(0);
  expect(StringType.validate([0])).not.toBe(0);
  expect(StringType.validate([5])).not.toBe(0);
  expect(StringType.validate([1, 'a', 11])).not.toBe(0);
  expect(StringType.validate([1, -1, 'a', 'b'])).not.toBe(0);
  expect(StringType.validate([1, -1, 'a', ''])).not.toBe(0);
  expect(StringType.validate([''])).not.toBe(0);
  expect(StringType.validate([1, 2, -1, ['b'], 'a'])).not.toBe(0);
  expect(StringType.validate([1, -1, -3, ['b'], 'a'])).not.toBe(0);
  expect(StringType.validate([1, .3, ['b'], 'a'])).not.toBe(0);
  expect(StringType.validate([1, 0.3])).not.toBe(0);
  expect(StringType.validate([1, ''])).not.toBe(0);
  expect(StringType.validate([''])).not.toBe(0);
});
