import type {TestCase} from './types';

const testCases: TestCase[] = [
  {
    comment: 'At root, succeeds when target exists',
    doc: null,
    patch: [
      {
        op: 'defined',
        path: '',
      },
    ],
    expected: null,
  },

  {
    comment: 'In object, succeeds when target exists',
    doc: {hello: 'mars'},
    patch: [
      {
        op: 'defined',
        path: '/hello',
      },
    ],
    expected: {hello: 'mars'},
  },
  {
    comment: 'In object, throws when target does not exist',
    doc: {hello: 'mars'},
    patch: [
      {
        op: 'defined',
        path: '/hello2',
      },
    ],
    error: 'TEST',
  },
  {
    comment: 'In object, throws when path to target does not exist',
    doc: {hello: 'mars'},
    patch: [
      {
        op: 'defined',
        path: '/foo/bar/baz',
      },
    ],
    error: 'NOT_FOUND',
  },

  {
    comment: 'In array, succeeds when target exists',
    doc: {hello: [0, false, null]},
    patch: [
      {
        op: 'defined',
        path: '/hello/1',
      },
    ],
    expected: {hello: [0, false, null]},
  },
  {
    comment: 'In array, throws when target does not exist',
    doc: {hello: [1]},
    patch: [
      {
        op: 'defined',
        path: '/hello/1',
      },
    ],
    error: 'TEST',
  },
];

export default testCases;
