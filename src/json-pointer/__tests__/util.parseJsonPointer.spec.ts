import {parseJsonPointer} from '../util';

test('returns path without escaped characters parsed into array', () => {
  const res = parseJsonPointer('/foo/bar');
  expect(res).toEqual(['foo', 'bar']);
});

test('trailing slashes result into empty string elements', () => {
  const res = parseJsonPointer('/foo///');
  expect(res).toEqual(['foo', '', '', '']);
});

test('for root path returns array with single empty string', () => {
  const res = parseJsonPointer('');
  expect(res).toEqual([]);
});

test('slash path "/" return two empty strings', () => {
  const res = parseJsonPointer('/');
  expect(res).toEqual(['']);
});

test('un-escapes special characters', () => {
  const res = parseJsonPointer('/a~0b/c~1d/1');
  expect(res).toEqual(['a~b', 'c/d', '1']);
});
