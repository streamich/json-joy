import {get} from '../get';
import {parseJsonPointer} from '../util';

test('can find number root', () => {
  const res = get(123, []);
  expect(res).toBe(123);
});

test('can find string root', () => {
  const res = get('foo', []);
  expect(res).toBe('foo');
});

test('can find key in object', () => {
  const res = get({foo: 'bar'}, ['foo']);
  expect(res).toBe('bar');
});

test('can retrieve withing deep object', () => {
  const res = get({foo: {bar: {baz: 'qux', a: 1}}}, ['foo', 'bar', 'baz']);
  expect(res).toEqual('qux');
});

test('simple key in simple object', () => {
  const doc = {a: 123};
  const path = parseJsonPointer('/a');
  const res = get(doc, path);
  expect(res).toEqual(123);
});

test('returns "undefined" when referencing missing key with multiple steps', () => {
  const doc = {a: 123};
  const path = parseJsonPointer('/b/c');
  expect(get(doc, path)).toBe(undefined);
});

test('can reference array element', () => {
  const doc = {a: {b: [1, 2, 3]}};
  const path = parseJsonPointer('/a/b/1');
  const res = get(doc, path);
  expect(res).toEqual(2);
});

test('returns "undefined" when referencing end of array', () => {
  const doc = {a: {b: [1, 2, 3]}};
  const path = parseJsonPointer('/a/b/-');
  const res = get(doc, path);
  expect(res).toBe(undefined);
});

test('returns undefined when pointing past array boundary', () => {
  const doc = {a: {b: [1, 2, 3]}};
  const path = parseJsonPointer('/a/b/-1');
  expect(get(doc, path)).toBe(undefined);
});

test('missing object key returns undefined', () => {
  const doc = {foo: 123};
  const path = parseJsonPointer('/bar');
  const res = get(doc, path);
  expect(res).toBe(undefined);
});

test('can reference array element by number step', () => {
  const doc = [1, 2, 3];
  expect(get(doc, [0])).toBe(1);
  expect(get(doc, [1])).toBe(2);
  expect(get(doc, [2])).toBe(3);
  expect(get(doc, [3])).toBe(undefined);
});

test('can reference array element by number step', () => {
  const doc = {foo: {bar: [1, 2, 3]}};
  expect(get(doc, ['foo', 'bar', 0])).toBe(1);
  expect(get(doc, ['foo', 'bar', 1])).toBe(2);
  expect(get(doc, ['foo', 'bar', 2])).toBe(3);
  expect(get(doc, ['foo', 'bar', 3])).toBe(undefined);
});
