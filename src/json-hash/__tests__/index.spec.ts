import {hash} from '..';
import {RandomJson} from '@jsonjoy.com/util/lib/json-random';

test('returns the same hash for empty objects', () => {
  const res1 = hash({});
  const res2 = hash({});
  expect(res1).toBe(res2);
});

test('returns the same hash for empty arrays', () => {
  const res1 = hash([]);
  const res2 = hash([]);
  const res3 = hash({});
  expect(res1).toBe(res2);
  expect(res1).not.toBe(res3);
});

test('returns the same hash for empty strings', () => {
  const res1 = hash('');
  const res2 = hash('');
  const res3 = hash({});
  const res4 = hash([]);
  expect(res1).toBe(res2);
  expect(res1).not.toBe(res3);
  expect(res1).not.toBe(res4);
});

test('returns the same hash for object with keys', () => {
  const res1 = hash({foo: 123, bar: 'asdf'});
  const res2 = hash({foo: 123, bar: 'asdf'});
  expect(res1).toBe(res2);
});

test('returns the same hash regardless of key order', () => {
  const res1 = hash({bar: 'asdf', foo: 123});
  const res2 = hash({foo: 123, bar: 'asdf'});
  expect(res1).toBe(res2);
});

test('returns the same hash for array with values', () => {
  const res1 = hash([true, 'asdf', false]);
  const res2 = hash([true, 'asdf', false]);
  expect(res1).toBe(res2);
});

test('same hash for binary data', () => {
  const res1 = hash({data: new Uint8Array([1, 2, 3])});
  const res2 = hash({data: new Uint8Array([1, 2, 3])});
  expect(res1).toBe(res2);
});

test('different hash for binary data', () => {
  const res1 = hash({data: new Uint8Array([1, 2, 3])});
  const res2 = hash({data: new Uint8Array([1, 2, 4])});
  expect(res1).not.toBe(res2);
});

test('returns different hash for random JSON values', () => {
  for (let i = 0; i < 100; i++) {
    const res1 = hash(RandomJson.generate() as any);
    const res2 = hash(RandomJson.generate() as any);
    expect(res1).not.toBe(res2);
  }
});

test('returns different hash for first 100K numbers', () => {
  const set = new Set<number>();
  for (let i = 0; i < 100000; i++) set.add(hash(i));
  expect(set.size).toBe(100000);
});
