import {parent} from '../util';

test('returns parent path', () => {
  expect(parent(['foo', 'bar', 'baz'])).toEqual(['foo', 'bar']);
  expect(parent(['foo', 'bar'])).toEqual(['foo']);
  expect(parent(['foo'])).toEqual([]);
});

test('throws when path has no parent', () => {
  expect(() => parent([])).toThrow(new Error('NO_PARENT'));
});
