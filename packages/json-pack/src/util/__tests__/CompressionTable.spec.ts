import {CompressionTable} from '../CompressionTable';

describe('.walk()', () => {
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
});

describe('.compress()', () => {
  test('replaces literals with indices', () => {
    const json = {
      foo: 'bar',
      baz: 42,
      gg: 'foo',
      true: false,
    };
    const table = CompressionTable.create(json);
    const compressed = table.compress(json);
    expect(compressed).toEqual({'2': 0, '4': 1, '5': 4, '6': 3});
  });

  test('can share compression table across two documents', () => {
    const json1 = {
      foo: 'bar',
    };
    const json2 = {
      foo: [0, 0, 5, 5],
    };
    const table = new CompressionTable();
    table.walk(json1);
    table.walk(json2);
    table.finalize();
    const compressed1 = table.compress(json1);
    const compressed2 = table.compress(json2);
    expect(table.getTable()).toEqual([0, 5, 'bar', 'foo']);
    expect(compressed1).toEqual({'3': 2});
    expect(compressed2).toEqual({'3': [0, 0, 1, 1]});
  });
});
