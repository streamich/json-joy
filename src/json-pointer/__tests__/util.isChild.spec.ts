import {isChild} from '../util';

test('returns false if parent path is longer than child path', () => {
  const res = isChild(['', 'foo', 'bar', 'baz'], ['', 'foo']);
  expect(res).toBe(false);
});

test('returns true for real child', () => {
  const res = isChild(['', 'foo'], ['', 'foo', 'bar', 'baz']);
  expect(res).toBe(true);
});

test('returns false for different root steps', () => {
  const res = isChild(['', 'foo'], ['', 'foo2', 'bar', 'baz']);
  expect(res).toBe(false);
});

test('returns false for adjacent paths', () => {
  const res = isChild(['', 'foo', 'baz'], ['', 'foo', 'bar']);
  expect(res).toBe(false);
});

test('returns false for two roots', () => {
  const res = isChild([''], ['']);
  expect(res).toBe(false);
});

test('always returns true when parent is root and child is not', () => {
  const res = isChild([''], ['', 'a', 'b', 'c', '1', '2', '3']);
  expect(res).toBe(true);
});
