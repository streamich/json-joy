import {clone} from '@jsonjoy.com/util/lib/json-clone';
import {structHash} from '../structHash';
import {RandomJson} from '@jsonjoy.com/util/lib/json-random';

test('returns the same hash for empty objects', () => {
  const res1 = structHash({});
  const res2 = structHash({});
  expect(res1).toBe(res2);
});

test('returns the same hash for empty arrays', () => {
  const res1 = structHash([]);
  const res2 = structHash([]);
  const res3 = structHash({});
  expect(res1).toBe(res2);
  expect(res1).not.toBe(res3);
});

test('returns the same hash for empty strings', () => {
  const res1 = structHash('');
  const res2 = structHash('');
  const res3 = structHash({});
  const res4 = structHash([]);
  expect(res1).toBe(res2);
  expect(res1).not.toBe(res3);
  expect(res1).not.toBe(res4);
});

test('returns the same hash for object with keys', () => {
  const res1 = structHash({foo: 123, bar: 'asdf'});
  const res2 = structHash({foo: 123, bar: 'asdf'});
  expect(res1).toBe(res2);
});

test('different key order returns the same hash', () => {
  const res1 = structHash({bar: 'asdf', foo: 123});
  const res2 = structHash({foo: 123, bar: 'asdf'});
  expect(res1).toBe(res2);
});

test('returns the same hash regardless of key order', () => {
  const res1 = structHash({bar: 'asdf', foo: 123});
  const res2 = structHash({foo: 123, bar: 'asdf'});
  expect(res1).toBe(res2);
});

test('returns the same hash for array with values', () => {
  const res1 = structHash([true, 'asdf', false]);
  const res2 = structHash([true, 'asdf', false]);
  expect(res1).toBe(res2);
});

test('same hash for binary data', () => {
  const res1 = structHash({data: new Uint8Array([1, 2, 3])});
  const res2 = structHash({data: new Uint8Array([1, 2, 3])});
  expect(res1).toBe(res2);
});

test('different hash for binary data', () => {
  const res1 = structHash({data: new Uint8Array([1, 2, 3])});
  const res2 = structHash({data: new Uint8Array([1, 2, 4])});
  expect(res1).not.toBe(res2);
});

test('returns different hash for random JSON values', () => {
  for (let i = 0; i < 100; i++) {
    const json1 = RandomJson.generate() as any;
    const res1 = structHash(json1);
    const res2 = structHash(RandomJson.generate() as any);
    const res3 = structHash(clone(json1));
    expect(res1).not.toBe(res2);
    expect(res1).toBe(res3);
  }
});
