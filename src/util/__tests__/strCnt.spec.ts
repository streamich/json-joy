import {strCnt} from '../strCnt';

test('edge cases', () => {
  expect(strCnt('', 'xyz')).toBe(0);
  expect(strCnt('xyz', '')).toBe(0);
  expect(strCnt('', '')).toBe(0);
});

test('can find no occurrences', () => {
  expect(strCnt('abc', 'xyz')).toBe(0);
  expect(strCnt('a', 'xyz')).toBe(0);
  expect(strCnt('xyz', 'xy')).toBe(0);
});

test('one occurrence', () => {
  expect(strCnt('1', '123')).toBe(1);
  expect(strCnt('1', '0123')).toBe(1);
  expect(strCnt('1', '01')).toBe(1);
  expect(strCnt('aa', 'aa')).toBe(1);
  expect(strCnt('aa', 'aaa')).toBe(1);
  expect(strCnt('aa', 'aaab')).toBe(1);
  expect(strCnt('aa', 'xaaab')).toBe(1);
  expect(strCnt('aa', 'xaabc')).toBe(1);
});

test('two occurrence', () => {
  expect(strCnt('1', '1213')).toBe(2);
  expect(strCnt('1', '01123')).toBe(2);
  expect(strCnt('1', '101')).toBe(2);
  expect(strCnt('aa', 'aaaa')).toBe(2);
  expect(strCnt('aa', 'aaabaa')).toBe(2);
  expect(strCnt('aa', 'xaaabaaa')).toBe(2);
  expect(strCnt('aa', 'xaaaabc')).toBe(2);
});

test('can search at offset', () => {
  expect(strCnt('1', '1213', 1)).toBe(1);
  expect(strCnt('1', '01123', 1)).toBe(2);
  expect(strCnt('1', '101', 2)).toBe(1);
  expect(strCnt('1', '101', 3)).toBe(0);
});
