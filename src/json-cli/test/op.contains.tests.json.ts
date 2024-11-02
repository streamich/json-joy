import type {TestCase} from './types';

const testCases: TestCase[] = [
  {
    comment: 'At root, succeeds when matches correctly a substring',
    doc: 'foo bar',
    patch: [
      {
        op: 'contains',
        path: '',
        value: 'oo b',
      },
    ],
    expected: 'foo bar',
  },
  {
    comment: 'At root, succeeds when matches start of the string',
    doc: 'foo bar',
    patch: [
      {
        op: 'contains',
        path: '',
        value: 'foo',
      },
    ],
    expected: 'foo bar',
  },
  {
    comment: 'At root, throws when matches substring incorrectly',
    doc: 'foo bar',
    patch: [
      {
        op: 'contains',
        path: '',
        value: 'oo 0',
      },
    ],
    error: 'TEST',
  },

  {
    comment: 'In object, succeeds when matches correctly a substring',
    doc: {foo: 'foo bar'},
    patch: [
      {
        op: 'contains',
        path: '/foo',
        value: 'oo b',
      },
    ],
    expected: {foo: 'foo bar'},
  },
  {
    comment: 'In object, throws when matches substring incorrectly',
    doc: {foo: 'foo bar'},
    patch: [
      {
        op: 'contains',
        path: '/foo',
        value: 'oo 0',
      },
    ],
    error: 'TEST',
  },

  {
    comment: 'In array, succeeds when matches correctly a substring',
    doc: ['foo bar'],
    patch: [
      {
        op: 'contains',
        path: '/0',
        value: 'oo b',
      },
    ],
    expected: ['foo bar'],
  },
  {
    comment: 'In array, throws when matches substring incorrectly',
    doc: ['foo bar'],
    patch: [
      {
        op: 'contains',
        path: '/0',
        value: 'oo 0',
      },
    ],
    error: 'TEST',
  },
];

export default testCases;
