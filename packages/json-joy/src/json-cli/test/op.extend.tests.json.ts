import type {TestCase} from './types';

const testCases: TestCase[] = [
  {
    comment: 'At root, can extend an object',
    doc: {foo: 'bar'},
    patch: [
      {
        op: 'extend',
        path: '',
        props: {
          a: 'b',
          c: 3,
        },
      },
    ],
    expected: {
      foo: 'bar',
      a: 'b',
      c: 3,
    },
  },

  {
    comment: 'In array, can extend an object',
    doc: {foo: [{lol: {a: 1}}]},
    patch: [
      {
        op: 'extend',
        path: '/foo/0/lol',
        props: {
          b: 123,
        },
      },
    ],
    expected: {foo: [{lol: {a: 1, b: 123}}]},
  },
  {
    comment: 'In array, can set null',
    doc: {foo: [{lol: {a: 1}}]},
    patch: [
      {
        op: 'extend',
        path: '/foo/0/lol',
        props: {
          b: 123,
          c: null,
          a: null,
        },
      },
    ],
    expected: {foo: [{lol: {a: null, b: 123, c: null}}]},
  },
  {
    comment: 'In array, can use null to delete a key',
    doc: {foo: [{lol: {a: 1}}]},
    patch: [
      {
        op: 'extend',
        path: '/foo/0/lol',
        props: {
          b: 123,
          c: null,
          a: null,
        },
        deleteNull: true,
      },
    ],
    expected: {foo: [{lol: {b: 123}}]},
  },

  {
    comment: 'In object, can extend an object',
    doc: {foo: {lol: {a: 1}}},
    patch: [
      {
        op: 'extend',
        path: '/foo/lol',
        props: {
          b: 123,
        },
      },
    ],
    expected: {foo: {lol: {a: 1, b: 123}}},
  },
  {
    comment: 'In object, can set null',
    doc: {foo: {lol: {a: 1}}},
    patch: [
      {
        op: 'extend',
        path: '/foo/lol',
        props: {
          b: 123,
          c: null,
          a: null,
        },
      },
    ],
    expected: {foo: {lol: {a: null, b: 123, c: null}}},
  },
  {
    comment: 'In object, can use null to delete a key',
    doc: {foo: {lol: {a: 1}}},
    patch: [
      {
        op: 'extend',
        path: '/foo/lol',
        props: {
          b: 123,
          c: null,
          a: null,
        },
        deleteNull: true,
      },
    ],
    expected: {foo: {lol: {b: 123}}},
  },
];

export default testCases;
