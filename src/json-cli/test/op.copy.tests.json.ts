import type {TestCase} from './types';

const testCases: TestCase[] = [
  {
    comment: 'Can move values between keys of the same object',
    doc: {foo: 'bar'},
    patch: [{op: 'move', path: '/fooo', from: '/foo'}],
    expected: {fooo: 'bar'},
  },

  {
    comment: 'Can overwrite object key of the same object',
    doc: {foo: 'bar', a: 123},
    patch: [{op: 'move', path: '/foo', from: '/a'}],
    expected: {foo: 123},
  },
  {
    comment: 'Can move value from parent object to child array',
    doc: {foo: 'bar', arr: [1]},
    patch: [{op: 'move', path: '/arr/1', from: '/foo'}],
    expected: {arr: [1, 'bar']},
  },
  {
    comment: 'Can move value from child object to adjacent child array',
    doc: {foo: {a: null}, arr: [1]},
    patch: [{op: 'move', path: '/arr/-', from: '/foo/a'}],
    expected: {foo: {}, arr: [1, null]},
  },
  {
    comment: 'Can move value from deep object to adjacent child array',
    doc: {foo: {a: {b: {c: {d: 123.4}}}}, arr: [1]},
    patch: [{op: 'move', path: '/arr/0', from: '/foo/a/b/c/d'}],
    expected: {foo: {a: {b: {c: {}}}}, arr: [123.4, 1]},
  },
  {
    comment: 'Can move value from array into object',
    doc: {
      arr: [3, 2, 1],
      obj: {},
    },
    patch: [
      {op: 'move', path: '/obj/1', from: '/arr/2'},
      {op: 'move', path: '/test', from: '/arr/0'},
    ],
    expected: {
      arr: [2],
      obj: {
        '1': 1,
      },
      test: 3,
    },
  },
  {
    comment: 'Can move values between two arrays',
    doc: {
      a: [3, 2, 1],
      b: ['c', 'a', 'b'],
    },
    patch: [
      {op: 'move', path: '/a/2', from: '/a/0'},
      {op: 'move', path: '/a/1', from: '/a/0'},
      {op: 'move', path: '/a/-', from: '/b/1'},
      {op: 'move', path: '/a/-', from: '/b/0'},
      {op: 'move', path: '/a/4', from: '/b/0'},
    ],
    expected: {
      a: [1, 2, 3, 'a', 'b', 'c'],
      b: [],
    },
    skipInJsonOt: true,
  },
  {
    comment: 'Can move value and return it back',
    doc: {
      a: 'a',
    },
    patch: [
      {op: 'move', path: '/b', from: '/a'},
      {op: 'move', path: '/a', from: '/b'},
    ],
    expected: {
      a: 'a',
    },
    skipInJsonOt: true,
  },
];

export default testCases;
