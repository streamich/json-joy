import {clone} from '@jsonjoy.com/util/lib/json-clone';
import {RandomJson} from '@jsonjoy.com/util/lib/json-random';
import {assertStructHash} from './assertStructHash';

test('returns the same hash for empty objects', () => {
  const res1 = assertStructHash({});
  const res2 = assertStructHash({});
  expect(res1).toBe(res2);
});

test('returns the same hash for empty arrays', () => {
  const res1 = assertStructHash([]);
  const res2 = assertStructHash([]);
  const res3 = assertStructHash({});
  expect(res1).toBe(res2);
  expect(res1).not.toBe(res3);
});

test('returns the same hash for empty strings', () => {
  const res1 = assertStructHash('');
  const res2 = assertStructHash('');
  const res3 = assertStructHash({});
  const res4 = assertStructHash([]);
  expect(res1).toBe(res2);
  expect(res1).not.toBe(res3);
  expect(res1).not.toBe(res4);
});

test('returns the same hash for object with keys', () => {
  const res1 = assertStructHash({foo: 123, bar: 'asdf'});
  const res2 = assertStructHash({foo: 123, bar: 'asdf'});
  expect(res1).toBe(res2);
});

test('different key order returns the same hash', () => {
  const res1 = assertStructHash({bar: 'asdf', foo: 123});
  const res2 = assertStructHash({foo: 123, bar: 'asdf'});
  expect(res1).toBe(res2);
});

test('returns the same hash regardless of key order', () => {
  const res1 = assertStructHash({bar: 'asdf', foo: 123});
  const res2 = assertStructHash({foo: 123, bar: 'asdf'});
  expect(res1).toBe(res2);
});

test('returns the same hash for array with values', () => {
  const res1 = assertStructHash([true, 'asdf', false]);
  const res2 = assertStructHash([true, 'asdf', false]);
  expect(res1).toBe(res2);
});

test('same hash for binary data', () => {
  const res1 = assertStructHash({data: new Uint8Array([1, 2, 3])});
  const res2 = assertStructHash({data: new Uint8Array([1, 2, 3])});
  expect(res1).toBe(res2);
});

test('different hash for binary data', () => {
  const res1 = assertStructHash({data: new Uint8Array([1, 2, 3])});
  const res2 = assertStructHash({data: new Uint8Array([1, 2, 4])});
  expect(res1).not.toBe(res2);
});

test('returns different hash for random JSON values', () => {
  for (let i = 0; i < 100; i++) {
    const json1 = RandomJson.generate() as any;
    const res1 = assertStructHash(json1);
    const res2 = assertStructHash(RandomJson.generate() as any);
    const res3 = assertStructHash(clone(json1));
    expect(res1).not.toBe(res2);
    expect(res1).toBe(res3);
    expect(res1.includes('\n')).toBe(false);
    expect(res2.includes('\n')).toBe(false);
  }
});
