import type {TestCase} from './types';

const testCases: TestCase[] = [
  {
    comment: 'Can copy value to key of the same object',
    doc: {foo: 'bar'},
    patch: [{op: 'copy', path: '/fooo', from: '/foo'}],
    expected: {foo: 'bar', fooo: 'bar'},
  },
  {
    comment: 'Can overwrite object key of the same object',
    doc: {foo: 'bar', a: 123},
    patch: [{op: 'copy', path: '/foo', from: '/a'}],
    expected: {foo: 123, a: 123},
  },
  {
    comment: 'Can copy value from parent object to child array',
    doc: {foo: 'bar', arr: [1]},
    patch: [{op: 'copy', path: '/arr/1', from: '/foo'}],
    expected: {foo: 'bar', arr: [1, 'bar']},
  },
  {
    comment: 'Can copy value from child object to adjacent child array',
    doc: {foo: {a: null}, arr: [1]},
    patch: [{op: 'copy', path: '/arr/-', from: '/foo/a'}],
    expected: {foo: {a: null}, arr: [1, null]},
  },
  {
    comment: 'Can copy value from deep object to adjacent child array',
    doc: {foo: {a: {b: {c: {d: 123.4}}}}, arr: [1]},
    patch: [{op: 'copy', path: '/arr/0', from: '/foo/a/b/c/d'}],
    expected: {foo: {a: {b: {c: {d: 123.4}}}}, arr: [123.4, 1]},
  },
  {
    comment: 'Can copy value from array into object',
    doc: {
      arr: [3, 2, 1],
      obj: {},
    },
    patch: [
      {op: 'copy', path: '/obj/1', from: '/arr/2'},
      {op: 'copy', path: '/test', from: '/arr/0'},
    ],
    expected: {
      arr: [3, 2, 1],
      obj: {
        '1': 1,
      },
      test: 3,
    },
  },
  {
    comment: 'Can copy values between two arrays',
    doc: {
      a: [3, 2, 1],
      b: ['c', 'a', 'b'],
    },
    patch: [
      {op: 'copy', path: '/a/-', from: '/b/1'},
      {op: 'copy', path: '/a/-', from: '/b/0'},
      {op: 'copy', path: '/a/4', from: '/b/2'},
    ],
    expected: {
      a: [3, 2, 1, 'a', 'b', 'c'],
      b: ['c', 'a', 'b'],
    },
    skipInJsonOt: true,
  },
  {
    comment: 'Can copy value and return it back',
    doc: {
      a: {foo: 'bar'},
    },
    patch: [
      {op: 'copy', path: '/b', from: '/a'},
      {op: 'copy', path: '/a', from: '/b'},
    ],
    expected: {
      a: {foo: 'bar'},
      b: {foo: 'bar'},
    },
  },
];

export default testCases;
