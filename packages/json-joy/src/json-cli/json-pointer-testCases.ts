export interface TestCase {
  name: string;
  doc: unknown;
  pointer: string;
  result?: unknown;
  error?: string;
}

const docRfc6901Section5 = {
  foo: ['bar', 'baz'],
  '': 0,
  'a/b': 1,
  'c%d': 2,
  'e^f': 3,
  'g|h': 4,
  'i\\j': 5,
  'k"l': 6,
  ' ': 7,
  'm~n': 8,
};

const pointersRfc6901Section5: [string, unknown][] = [
  ['', docRfc6901Section5],
  ['/foo', ['bar', 'baz']],
  ['/foo/0', 'bar'],
  ['/', 0],
  ['/a~1b', 1],
  ['/c%d', 2],
  ['/e^f', 3],
  ['/g|h', 4],
  ['/i\\j', 5],
  ['/k"l', 6],
  ['/ ', 7],
  ['/m~0n', 8],
];

export const testCases: TestCase[] = [
  {
    name: 'Retrieves first level key from object',
    doc: {foo: 'bar'},
    pointer: '/foo',
    result: 'bar',
  },
  {
    name: 'Can find number root',
    doc: 123,
    pointer: '',
    result: 123,
  },
  {
    name: 'Can find string root',
    doc: 'foo',
    pointer: '',
    result: 'foo',
  },
  {
    name: 'Returns container object and key',
    doc: {foo: {bar: {baz: 'qux', a: 1}}},
    pointer: '/foo/bar/baz',
    result: 'qux',
  },
  {
    name: 'Can reference array element',
    doc: {a: {b: [1, 2, 3]}},
    pointer: '/a/b/1',
    result: 2,
  },
  {
    name: 'Throws "NOT_FOUND" on missing keys two levels deep',
    doc: {a: 123},
    pointer: '/b/c',
    error: 'NOT_FOUND',
  },
  {
    name: 'Throws "INVALID_INDEX" when pointing past array boundary',
    doc: {a: {b: [1, 2, 3]}},
    pointer: '/a/b/5',
    error: 'INVALID_INDEX',
  },
  {
    name: 'Throws "INVALID_INDEX" when pointing to negative element',
    doc: {a: {b: [1, 2, 3]}},
    pointer: '/a/b/-1',
    error: 'INVALID_INDEX',
  },
];

for (const [pointer, result] of pointersRfc6901Section5) {
  testCases.push({
    name: `RFC6901 Section 5. "${pointer}"`,
    doc: docRfc6901Section5,
    pointer,
    result,
  });
}
