import type {TestCase} from './types';

const testCases: TestCase[] = [
  {
    comment: 'At root, can remove characters',
    doc: 'hello world!',
    patch: [
      {
        op: 'str_del',
        path: '',
        pos: 5,
        len: 6,
      },
    ],
    expected: 'hello!',
  },
  {
    comment: 'At root, can remove characters by value',
    doc: 'hello world!',
    patch: [
      {
        op: 'str_del',
        path: '',
        pos: 0,
        str: 'hello ',
      },
    ],
    expected: 'world!',
  },
  {
    comment: 'At root, length can be arbitrary long',
    doc: '1234567890',
    patch: [
      {
        op: 'str_del',
        path: '',
        pos: 3,
        len: 999999,
      },
    ],
    expected: '123',
  },
  {
    comment: 'At root, pos=1 leaves only first character',
    doc: '1',
    patch: [
      {
        op: 'str_del',
        path: '',
        pos: 1,
        len: 999999,
      },
    ],
    expected: '1',
  },

  {
    comment: 'In object, can remove last character',
    doc: {foo: 'abc'},
    patch: [
      {
        op: 'str_del',
        path: '/foo',
        pos: 2,
        len: 1,
      },
    ],
    expected: {foo: 'ab'},
  },
  {
    comment: 'In object, can remove middle character',
    doc: {foo: 'abc'},
    patch: [
      {
        op: 'str_del',
        path: '/foo',
        pos: 1,
        len: 1,
      },
    ],
    expected: {foo: 'ac'},
  },
  {
    comment: 'In object, can remove middle character by value',
    doc: {foo: 'abc'},
    patch: [
      {
        op: 'str_del',
        path: '/foo',
        pos: 1,
        str: 'b',
      },
    ],
    expected: {foo: 'ac'},
  },
  {
    comment: 'In object, can remove first character',
    doc: {foo: 'abc'},
    patch: [
      {
        op: 'str_del',
        path: '/foo',
        pos: 0,
        len: 1,
      },
    ],
    expected: {foo: 'bc'},
  },

  {
    comment: 'In array, can remove last character',
    doc: ['abc'],
    patch: [
      {
        op: 'str_del',
        path: '/0',
        pos: 2,
        len: 1,
      },
    ],
    expected: ['ab'],
  },
  {
    comment: 'In array, can remove middle character',
    doc: [1, 'abc'],
    patch: [
      {
        op: 'str_del',
        path: '/1',
        pos: 1,
        len: 1,
      },
    ],
    expected: [1, 'ac'],
  },
  {
    comment: 'In array, can remove first character',
    doc: ['abc', true],
    patch: [
      {
        op: 'str_del',
        path: '/0',
        pos: 0,
        len: 1,
      },
    ],
    expected: ['bc', true],
  },
];

export default testCases;
