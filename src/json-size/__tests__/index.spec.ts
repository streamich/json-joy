import {jsonSize} from '..';

test('calculates null size', () => {
  expect(jsonSize(null)).toBe(4);
});

test('calculates boolean sizes', () => {
  expect(jsonSize(true)).toBe(4);
  expect(jsonSize(false)).toBe(5);
});

test('calculates number sizes', () => {
  expect(jsonSize(1)).toBe(1);
  expect(jsonSize(1.1)).toBe(3);
  expect(jsonSize(0)).toBe(1);
  expect(jsonSize(1.123)).toBe(5);
  expect(jsonSize(-1.123)).toBe(6);
});

test('calculates string sizes', () => {
  expect(jsonSize('')).toBe(2);
  expect(jsonSize('a')).toBe(3);
  expect(jsonSize('abc')).toBe(5);
  expect(jsonSize('👨‍👩‍👦‍👦')).toBe(27);
  expect(jsonSize('büro')).toBe(7);
  expect(jsonSize('office')).toBe(8);
});

test('calculates array sizes', () => {
  expect(jsonSize([])).toBe(2);
  expect(jsonSize([1])).toBe(3);
  expect(jsonSize([1, 2, 3])).toBe(7);
  expect(jsonSize([1, 'büro', 3])).toBe(13);
});

test('calculates object sizes', () => {
  expect(jsonSize({})).toBe(2);
  expect(jsonSize({a: 1})).toBe(2 + 3 + 1 + 1);
  expect(jsonSize({1: 2, foo: 'bar'})).toBe(2 + 3 + 1 + 1 + 1 + 5 + 1 + 5);
});
