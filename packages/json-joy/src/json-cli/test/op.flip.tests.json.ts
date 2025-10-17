import type {TestCase} from './types';

const testCases: TestCase[] = [
  {
    comment: 'Casts values and them flips them',
    doc: {
      val1: true,
      val2: false,
      val3: 1,
      val4: 0,
    },
    patch: [
      {op: 'flip', path: '/val1'},
      {op: 'flip', path: '/val2'},
      {op: 'flip', path: '/val3'},
      {op: 'flip', path: '/val4'},
    ],
    expected: {
      val1: false,
      val2: true,
      val3: false,
      val4: true,
    },
  },

  {
    comment: 'At root, flips true to false',
    doc: true,
    patch: [
      {
        op: 'flip',
        path: '',
      },
    ],
    expected: false,
  },
  {
    comment: 'At root, flips false to true',
    doc: false,
    patch: [
      {
        op: 'flip',
        path: '',
      },
    ],
    expected: true,
  },
  {
    comment: 'At root, flips truthy number to false',
    doc: 123,
    patch: [
      {
        op: 'flip',
        path: '',
      },
    ],
    expected: false,
  },
  {
    comment: 'At root, flips zero to true',
    doc: 0,
    patch: [
      {
        op: 'flip',
        path: '',
      },
    ],
    expected: true,
  },

  {
    comment: 'In object, flips true to false',
    doc: {foo: true},
    patch: [
      {
        op: 'flip',
        path: '/foo',
      },
    ],
    expected: {foo: false},
  },
  {
    comment: 'In object, flips false to true',
    doc: {foo: false},
    patch: [
      {
        op: 'flip',
        path: '/foo',
      },
    ],
    expected: {foo: true},
  },

  {
    comment: 'In array, flips true to false and back',
    doc: [true, false],
    patch: [
      {
        op: 'flip',
        path: '/0',
      },
      {
        op: 'flip',
        path: '/1',
      },
    ],
    expected: [false, true],
  },
];

export default testCases;
