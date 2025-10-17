import type {TestCase} from './types';

const testCases: TestCase[] = [
  {
    comment: 'Can add text to empty string at root',
    doc: '',
    patch: [
      {
        op: 'str_ins',
        path: '',
        pos: 0,
        str: 'bar',
      },
    ],
    expected: 'bar',
  },
  {
    comment: 'Can add text to empty string in object on first level',
    doc: {foo: ''},
    patch: [
      {
        op: 'str_ins',
        path: '/foo',
        pos: 0,
        str: 'bar',
      },
    ],
    expected: {foo: 'bar'},
  },
  {
    comment: 'Returns error if target is not a string - 1',
    doc: {foo: 123},
    patch: [
      {
        op: 'str_ins',
        path: '/foo',
        pos: 0,
        str: 'bar',
      },
    ],
    error: 'NOT_A_STRING',
  },
  {
    comment: 'Returns error if target is not a string - 2',
    doc: {foo: true},
    patch: [
      {
        op: 'str_ins',
        path: '/foo',
        pos: 0,
        str: 'bar',
      },
    ],
    error: 'NOT_A_STRING',
  },
  {
    comment: 'Returns error if target is not a string - 3',
    doc: {foo: {}},
    patch: [
      {
        op: 'str_ins',
        path: '/foo',
        pos: 0,
        str: 'bar',
      },
    ],
    error: 'NOT_A_STRING',
  },
  {
    comment: 'Returns error if target is not a string - 4',
    doc: {foo: []},
    patch: [
      {
        op: 'str_ins',
        path: '/foo',
        pos: 0,
        str: 'bar',
      },
    ],
    error: 'NOT_A_STRING',
  },
  {
    comment: 'Returns error if target is not a string - 5',
    doc: {foo: null},
    patch: [
      {
        op: 'str_ins',
        path: '/foo',
        pos: 0,
        str: 'bar',
      },
    ],
    error: 'NOT_A_STRING',
  },
  {
    comment: 'Can add text to empty string at position greater than host string length',
    doc: {foo: ''},
    patch: [
      {
        op: 'str_ins',
        path: '/foo',
        pos: 25,
        str: 'bar',
      },
    ],
    expected: {foo: 'bar'},
  },
  {
    comment: 'Can insert text into a string',
    doc: {foo: {bar: 'ac'}},
    patch: [
      {
        op: 'str_ins',
        path: '/foo/bar',
        pos: 1,
        str: 'b',
      },
    ],
    expected: {foo: {bar: 'abc'}},
  },
  {
    comment: 'Can insert text at the end of the string',
    doc: {foo: {bar: 'ac'}},
    patch: [
      {
        op: 'str_ins',
        path: '/foo/bar',
        pos: 2,
        str: 'haha',
      },
    ],
    expected: {foo: {bar: 'achaha'}},
  },
  {
    comment: 'Can insert text into a string at position greater than host string length',
    doc: {foo: {bar: 'ac'}},
    patch: [
      {
        op: 'str_ins',
        path: '/foo/bar',
        pos: 123,
        str: 'b',
      },
    ],
    expected: {foo: {bar: 'acb'}},
  },
  {
    comment: 'Can add text to empty string in array',
    doc: [''],
    patch: [
      {
        op: 'str_ins',
        path: '/0',
        pos: 0,
        str: 'bar',
      },
    ],
    expected: ['bar'],
  },
  {
    comment: 'Can add text to empty string at position greater than host string length in array',
    doc: [''],
    patch: [
      {
        op: 'str_ins',
        path: '/0',
        pos: 25,
        str: 'bar',
      },
    ],
    expected: ['bar'],
  },
  {
    comment: 'Can insert text into a string in array',
    doc: {foo: [0, 'ac']},
    patch: [
      {
        op: 'str_ins',
        path: '/foo/1',
        pos: 1,
        str: 'b',
      },
    ],
    expected: {foo: [0, 'abc']},
  },
  {
    comment: 'Can insert text at the end of the string in array',
    doc: {foo: [1, 2, 'ac']},
    patch: [
      {
        op: 'str_ins',
        path: '/foo/2',
        pos: 2,
        str: 'haha',
      },
    ],
    expected: {foo: [1, 2, 'achaha']},
  },
  {
    comment: 'Can insert text into a string at position greater than host string length in array',
    doc: [true, 'ac'],
    patch: [
      {
        op: 'str_ins',
        path: '/1',
        pos: 123,
        str: 'b',
      },
    ],
    expected: [true, 'acb'],
  },
  {
    comment: 'Can create new string key and add content to it (if pos = 0 and there was nothing before)',
    doc: {foo: '123'},
    patch: [
      {
        op: 'str_ins',
        path: '/baz',
        pos: 0,
        str: 'H',
      },
      {
        op: 'str_ins',
        path: '/baz',
        pos: 1,
        str: 'ello',
      },
    ],
    expected: {foo: '123', baz: 'Hello'},
  },
  {
    comment: 'Throws if new string is create at position other than 0 (pos != 0)',
    doc: {foo: '123'},
    patch: [
      {
        op: 'str_ins',
        path: '/baz',
        pos: 1,
        str: 'H',
      },
      {
        op: 'str_ins',
        path: '/baz',
        pos: 2,
        str: 'ello',
      },
    ],
    error: 'POS',
  },
];

export default testCases;
