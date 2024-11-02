import type {TestCase} from './types';

const testCases: TestCase[] = [
  {
    comment: 'At root, succeeds when matches correctly a substring',
    doc: 'foo bar',
    patch: [
      {
        op: 'ends',
        path: '',
        value: 'bar',
      },
    ],
    expected: 'foo bar',
  },
  {
    comment: 'At root, can ignore case',
    doc: 'foo bAr',
    patch: [
      {
        op: 'ends',
        path: '',
        value: 'BaR',
        ignore_case: true,
      },
    ],
    expected: 'foo bAr',
  },
  {
    comment: 'At root, can ignore case - 2',
    doc: 'foo bar',
    patch: [
      {
        op: 'ends',
        path: '',
        value: 'BaR',
        ignore_case: true,
      },
    ],
    expected: 'foo bar',
  },
  {
    comment: 'At root, throws when case does not match',
    doc: 'foo bar',
    patch: [
      {
        op: 'ends',
        path: '',
        value: 'bar!',
      },
    ],
    error: 'TEST',
  },

  {
    comment: 'In object, succeeds when matches correctly a substring',
    doc: {foo: 'foo bar'},
    patch: [
      {
        op: 'ends',
        path: '/foo',
        value: 'bar',
      },
    ],
    expected: {foo: 'foo bar'},
  },
  {
    comment: 'In object, throws when matches substring incorrectly',
    doc: {foo: 'foo bar'},
    patch: [
      {
        op: 'ends',
        path: '/foo',
        value: 'foo',
      },
    ],
    error: 'TEST',
  },

  {
    comment: 'In array, succeeds when matches correctly a substring',
    doc: ['foo bar'],
    patch: [
      {
        op: 'ends',
        path: '/0',
        value: 'bar',
      },
    ],
    expected: ['foo bar'],
  },
  {
    comment: 'In array, throws when matches substring incorrectly',
    doc: ['foo bar'],
    patch: [
      {
        op: 'ends',
        path: '/0',
        value: 'foo',
      },
    ],
    error: 'TEST',
  },
];

export default testCases;
