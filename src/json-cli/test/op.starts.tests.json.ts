import type {TestCase} from './types';

const testCases: TestCase[] = [
  {
    comment: 'At root, succeeds when matches correctly a substring',
    doc: 'foo bar',
    patch: [
      {
        op: 'starts',
        path: '',
        value: 'foo',
      },
    ],
    expected: 'foo bar',
  },
  {
    comment: 'At root, can ignore case',
    doc: 'foo bar',
    patch: [
      {
        op: 'starts',
        path: '',
        value: 'fOO',
        ignore_case: true,
      },
    ],
    expected: 'foo bar',
  },
  {
    comment: 'At root, can ignore case - 2',
    doc: 'Foo bar',
    patch: [
      {
        op: 'starts',
        path: '',
        value: 'fOo',
        ignore_case: true,
      },
    ],
    expected: 'Foo bar',
  },
  {
    comment: 'At root, throws when case does not match',
    doc: 'foo bar',
    patch: [
      {
        op: 'starts',
        path: '',
        value: 'fOo',
      },
    ],
    error: 'TEST',
  },
  {
    comment: 'At root, throws when matches substring incorrectly',
    doc: 'foo bar',
    patch: [
      {
        op: 'starts',
        path: '',
        value: '!foo',
      },
    ],
    error: 'TEST',
  },

  {
    comment: 'In object, succeeds when matches correctly a substring',
    doc: {foo: 'foo bar'},
    patch: [
      {
        op: 'starts',
        path: '/foo',
        value: 'foo',
      },
    ],
    expected: {foo: 'foo bar'},
  },
  {
    comment: 'In object, throws when matches substring incorrectly',
    doc: {foo: 'foo bar'},
    patch: [
      {
        op: 'starts',
        path: '/foo',
        value: 'bar',
      },
    ],
    error: 'TEST',
  },

  {
    comment: 'In array, succeeds when matches correctly a substring',
    doc: ['foo bar'],
    patch: [
      {
        op: 'starts',
        path: '/0',
        value: 'foo',
      },
    ],
    expected: ['foo bar'],
  },
  {
    comment: 'In array, throws when matches substring incorrectly',
    doc: ['foo bar'],
    patch: [
      {
        op: 'starts',
        path: '/0',
        value: 'bar',
      },
    ],
    error: 'TEST',
  },
];

export default testCases;
