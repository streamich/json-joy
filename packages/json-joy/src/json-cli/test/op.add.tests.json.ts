import type {TestCase} from './types';

const testCases: TestCase[] = [
  {
    comment: 'Can set root document',
    doc: null,
    patch: [{op: 'add', path: '', value: {a: 'b'}}],
    expected: {a: 'b'},
  },
  {
    comment: 'Can set empty object key to string',
    doc: {},
    patch: [{op: 'add', path: '/a', value: 'b'}],
    expected: {a: 'b'},
  },
  {
    comment: 'Can set empty object key to object',
    doc: {},
    patch: [{op: 'add', path: '/aga', value: {foo: 'bar'}}],
    expected: {aga: {foo: 'bar'}},
  },
  {
    comment: 'Can update existing key',
    doc: {z: 1},
    patch: [{op: 'add', path: '/z', value: 2}],
    expected: {z: 2},
  },
  {
    comment: 'Can insert into first level empty array using index "0"',
    doc: [],
    patch: [{op: 'add', path: '/0', value: null}],
    expected: [null],
  },
  {
    comment: 'Can insert into first level empty array using index "-"',
    doc: [],
    patch: [{op: 'add', path: '/-', value: null}],
    expected: [null],
  },
  {
    comment: 'Throws error when inserting into empty first level array at index "1"',
    doc: [],
    patch: [{op: 'add', path: '/1', value: null}],
    error: 'INVALID_INDEX',
  },
  {
    comment: 'Can insert into second level empty array using index "0"',
    doc: {'1': []},
    patch: [{op: 'add', path: '/1/0', value: null}],
    expected: {'1': [null]},
  },
  {
    comment: 'Can insert into first level empty array using index "-"',
    doc: {'1': []},
    patch: [{op: 'add', path: '/1/-', value: null}],
    expected: {'1': [null]},
  },
  {
    comment: 'Throws error when inserting into empty first level array at index "1"',
    doc: {'1': []},
    patch: [{op: 'add', path: '/1/1', value: null}],
    error: 'INVALID_INDEX',
  },
  {
    comment: 'Can execute multiple updates in a row',
    doc: {
      id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      name: 'Henry Ho',
      tags: ['News', 'Sports'],
      address: {
        street: 'Google Way 15',
        zip: '101',
      },
    },
    patch: [
      {op: 'add', path: '/address/street', value: 'Facebook Boulevard 53'},
      {op: 'add', path: '/surname', value: 'Ho'},
      {op: 'add', path: '/name', value: 'Henry'},
      {op: 'add', path: '/tags/-', value: 'Tech'},
      {op: 'add', path: '/tags/3', value: 'Programming'},
      {op: 'add', path: '/tags/0', value: 'TDD'},
      {op: 'add', path: '/tags/1', value: 'Lady Gaga'},
      {op: 'add', path: '/address/name', value: 'H. Ho'},
    ],
    expected: {
      id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      name: 'Henry',
      surname: 'Ho',
      tags: ['TDD', 'Lady Gaga', 'News', 'Sports', 'Tech', 'Programming'],
      address: {
        name: 'H. Ho',
        street: 'Facebook Boulevard 53',
        zip: '101',
      },
    },
    skipInJsonOt: true,
  },
];

export default testCases;
