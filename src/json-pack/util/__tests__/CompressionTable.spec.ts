import {CompressionTable} from '../CompressionTable';

test('create a compression table from a primitive value', () => {
  const table = CompressionTable.create(42).getTable();
  expect(table).toEqual([42]);
});

test('collects literals from object', () => {
  const json = {
    foo: 'bar',
    baz: 42,
    gg: 'foo',
    true: false,
  };
  const table = CompressionTable.create(json).getTable();
  expect(table).toEqual([42, 'bar', 'baz', false, 'foo', 'gg', 'true']);
});

test('run-length encodes integers', () => {
  const json = {
    foo: [-3, 12, 42, 12345],
    baz: 42,
  };
  const table = CompressionTable.create(json).getTable();
  expect(table).toEqual([-3, 15, 30, 12303, 'baz', 'foo']);
});

test('run-length encodes integers - 2', () => {
  const json = {
    foo: [5, 1, 2, 4, 8, 16, 17, 22],
    baz: -1.5,
  };
  const table = CompressionTable.create(json).getTable();
  expect(table).toEqual([1, 1, 2, 1, 3, 8, 1, 5, -1.5, 'baz', 'foo']);
});
