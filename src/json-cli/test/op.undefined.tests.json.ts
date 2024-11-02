import type {TestCase} from './types';

const testCases: TestCase[] = [
  {
    comment: 'At root, fails when target exists',
    doc: null,
    patch: [
      {
        op: 'undefined',
        path: '',
      },
    ],
    error: 'TEST',
  },
  {
    comment: 'At root, fails when target exists',
    doc: null,
    patch: [
      {
        op: 'undefined',
        path: '',
      },
    ],
    error: 'TEST',
  },

  {
    comment: 'In object, fails when target exists',
    doc: {hello: 'mars'},
    patch: [
      {
        op: 'undefined',
        path: '/hello',
      },
    ],
    error: 'TEST',
  },
  {
    comment: 'In object, succeeds when target does not exist',
    doc: {hello: 'mars'},
    patch: [
      {
        op: 'undefined',
        path: '/hello2',
      },
    ],
    expected: {hello: 'mars'},
  },
  {
    comment: 'In object, succeeds when target does not exist on multiple levels',
    doc: {hello: 'mars'},
    patch: [
      {
        op: 'undefined',
        path: '/foo/bar/baz',
      },
    ],
    expected: {hello: 'mars'},
  },

  {
    comment: 'In array, fails when target exists',
    doc: {hello: [0, false, null]},
    patch: [
      {
        op: 'undefined',
        path: '/hello/1',
      },
    ],
    error: 'TEST',
  },
  {
    comment: 'In array, succeeds when target does not exist',
    doc: {hello: [1]},
    patch: [
      {
        op: 'undefined',
        path: '/hello/1',
      },
    ],
    expected: {hello: [1]},
  },
];

export default testCases;
