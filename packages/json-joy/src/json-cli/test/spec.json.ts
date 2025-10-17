import type {TestCase} from './types';

const testCases: TestCase[] = [
  {
    comment: '4.1. Add with missing object',
    doc: {q: {bar: 2}},
    patch: [{op: 'add', path: '/a/b', value: 1}],
    error: 'NOT_FOUND',
  },

  {
    comment: 'A.1. Adding an object member',
    doc: {
      foo: 'bar',
    },
    patch: [{op: 'add', path: '/baz', value: 'qux'}],
    expected: {
      baz: 'qux',
      foo: 'bar',
    },
  },

  {
    comment: 'A.2. Adding an array element',
    doc: {
      foo: ['bar', 'baz'],
    },
    patch: [{op: 'add', path: '/foo/1', value: 'qux'}],
    expected: {
      foo: ['bar', 'qux', 'baz'],
    },
  },

  {
    comment: 'A.3. Removing an object member',
    doc: {
      baz: 'qux',
      foo: 'bar',
    },
    patch: [{op: 'remove', path: '/baz'}],
    expected: {
      foo: 'bar',
    },
  },

  {
    comment: 'A.4. Removing an array element',
    doc: {
      foo: ['bar', 'qux', 'baz'],
    },
    patch: [{op: 'remove', path: '/foo/1'}],
    expected: {
      foo: ['bar', 'baz'],
    },
  },

  {
    comment: 'A.5. Replacing a value',
    doc: {
      baz: 'qux',
      foo: 'bar',
    },
    patch: [{op: 'replace', path: '/baz', value: 'boo'}],
    expected: {
      baz: 'boo',
      foo: 'bar',
    },
  },

  {
    comment: 'A.6. Moving a value',
    doc: {
      foo: {
        bar: 'baz',
        waldo: 'fred',
      },
      qux: {
        corge: 'grault',
      },
    },
    patch: [{op: 'move', from: '/foo/waldo', path: '/qux/thud'}],
    expected: {
      foo: {
        bar: 'baz',
      },
      qux: {
        corge: 'grault',
        thud: 'fred',
      },
    },
  },

  {
    comment: 'A.7. Moving an array element',
    doc: {
      foo: ['all', 'grass', 'cows', 'eat'],
    },
    patch: [{op: 'move', from: '/foo/1', path: '/foo/3'}],
    expected: {
      foo: ['all', 'cows', 'eat', 'grass'],
    },
  },

  {
    comment: 'A.8. Testing a value: success',
    doc: {
      baz: 'qux',
      foo: ['a', 2, 'c'],
    },
    patch: [
      {op: 'test', path: '/baz', value: 'qux'},
      {op: 'test', path: '/foo/1', value: 2},
    ],
    expected: {
      baz: 'qux',
      foo: ['a', 2, 'c'],
    },
  },

  {
    comment: 'A.9. Testing a value: error',
    doc: {
      baz: 'qux',
    },
    patch: [{op: 'test', path: '/baz', value: 'bar'}],
    error: 'TEST',
  },

  {
    comment: 'A.10. Adding a nested member object',
    doc: {
      foo: 'bar',
    },
    patch: [{op: 'add', path: '/child', value: {grandchild: {}}}],
    expected: {
      foo: 'bar',
      child: {
        grandchild: {},
      },
    },
  },

  {
    comment: 'A.11. Ignoring unrecognized elements',
    doc: {
      foo: 'bar',
    },
    patch: [{op: 'add', path: '/baz', value: 'qux', xyz: 123} as any],
    expected: {
      foo: 'bar',
      baz: 'qux',
    },
  },

  {
    comment: 'A.12. Adding to a non-existent target',
    doc: {
      foo: 'bar',
    },
    patch: [{op: 'add', path: '/baz/bat', value: 'qux'}],
    error: 'NOT_FOUND',
  },

  {
    comment: 'A.13 Invalid JSON Patch document',
    doc: {
      foo: 'bar',
    },
    patch: [
      // @ts-expect-error
      {path: '/baz', value: 'qux', op: 'remove'},
    ],
    error: "operation has two 'op' members",
    disabled: true,
  },

  {
    comment: 'A.14. Escape ordering',
    doc: {
      '/': 9,
      '~1': 10,
    },
    patch: [{op: 'test', path: '/~01', value: 10}],
    expected: {
      '/': 9,
      '~1': 10,
    },
  },

  {
    comment: 'A.15. Comparing strings and numbers',
    doc: {
      '/': 9,
      '~1': 10,
    },
    patch: [{op: 'test', path: '/~01', value: '10'}],
    error: 'TEST',
  },

  {
    comment: 'A.16. Adding an array value',
    doc: {
      foo: ['bar'],
    },
    patch: [{op: 'add', path: '/foo/-', value: ['abc', 'def']}],
    expected: {
      foo: ['bar', ['abc', 'def']],
    },
  },
];

export default testCases;
