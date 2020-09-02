import {formatJsonPointer} from '../util';

test('returns path without escaped characters parsed into array', () => {
  const res = formatJsonPointer(['foo', 'bar']);
  expect(res).toBe('/foo/bar');
});

test('empty string elements add trailing slashes', () => {
  const res = formatJsonPointer(['foo', '', '', '']);
  expect(res).toBe('/foo///');
});

test('array with single empty string results into root element', () => {
  const res = formatJsonPointer([]);
  expect(res).toBe('');
});

test('two empty strings result in a single slash "/"', () => {
  const res = formatJsonPointer(['']);
  expect(res).toBe('/');
});

test('escapes special characters', () => {
  const res = formatJsonPointer(['a~b', 'c/d', '1']);
  expect(res).toBe('/a~0b/c~1d/1');
});
