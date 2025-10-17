import type {TestCase} from './types';

const testCases: TestCase[] = [
  {
    comment: 'Casts values and them increments them',
    doc: {
      val1: true,
      val2: false,
      val3: 1,
      val4: 0,
    },
    patch: [
      {op: 'inc', path: '/val1', inc: 1},
      {op: 'inc', path: '/val2', inc: 1},
      {op: 'inc', path: '/val3', inc: 1},
      {op: 'inc', path: '/val4', inc: 1},
    ],
    expected: {
      val1: 2,
      val2: 1,
      val3: 2,
      val4: 1,
    },
  },
  {
    comment: 'Can use arbitrary increment value, and can decrement',
    doc: {
      foo: 1,
    },
    patch: [
      {op: 'inc', path: '/foo', inc: 10},
      {op: 'inc', path: '/foo', inc: -3},
    ],
    expected: {
      foo: 8,
    },
  },
  {
    comment: 'Increment can be a floating point number',
    doc: {
      foo: 1,
    },
    patch: [{op: 'inc', path: '/foo', inc: 0.1}],
    expected: {
      foo: 1.1,
    },
  },

  {
    comment: 'At root, increments from 0 to 5',
    doc: 0,
    patch: [
      {
        op: 'inc',
        path: '',
        inc: 5,
      },
    ],
    expected: 5,
  },
  {
    comment: 'At root, increments from -0 to 5',
    doc: -0,
    patch: [
      {
        op: 'inc',
        path: '',
        inc: 5,
      },
    ],
    expected: 5,
  },

  {
    comment: 'In object, increments from 0 to 5',
    doc: {lala: 0},
    patch: [
      {
        op: 'inc',
        path: '/lala',
        inc: 5,
      },
    ],
    expected: {lala: 5},
  },
  {
    comment: 'In object, casts string to number',
    doc: {lala: '4'},
    patch: [
      {
        op: 'inc',
        path: '/lala',
        inc: 5,
      },
    ],
    expected: {lala: 9},
  },
  {
    comment: 'In object, can increment twice',
    doc: {lala: 0},
    patch: [
      {
        op: 'inc',
        path: '/lala',
        inc: 1,
      },
      {
        op: 'inc',
        path: '/lala',
        inc: 2,
      },
    ],
    expected: {lala: 3},
  },

  {
    comment: 'In array, increments from 0 to -3',
    doc: [0],
    patch: [
      {
        op: 'inc',
        path: '/0',
        inc: -3,
      },
    ],
    expected: [-3],
  },
];

export default testCases;
