import type {TestCase} from './types';

const testCases: TestCase[] = [
  {
    comment: 'Can remove object at root',
    doc: {foo: 'bar'},
    patch: [{op: 'remove', path: ''}],
    expected: null,
  },
  {
    comment: 'Can remove array at root',
    doc: [1, true, false],
    patch: [{op: 'remove', path: ''}],
    expected: null,
  },
  {
    comment: 'Can remove string at root',
    doc: 'Hello world!',
    patch: [{op: 'remove', path: ''}],
    expected: null,
  },
  {
    comment: 'Can remove first level object key',
    doc: {good: 'bad', up: 'down'},
    patch: [{op: 'remove', path: '/up'}],
    expected: {good: 'bad'},
  },
  {
    comment: 'Can remove second level object key',
    doc: {good: 'bad', up: {here: 'there', hmm: [1, 2, 3]}},
    patch: [{op: 'remove', path: '/up/here'}],
    expected: {good: 'bad', up: {hmm: [1, 2, 3]}},
  },
  {
    comment: 'Can remove array element at third level',
    doc: {good: 'bad', up: {here: 'there', hmm: [1, 2, 3]}},
    patch: [{op: 'remove', path: '/up/hmm/1'}],
    expected: {good: 'bad', up: {here: 'there', hmm: [1, 3]}},
  },
  {
    comment: 'Can remove array element in first position',
    doc: {cola: 'coca', arr: [1, '2', true, null, {}]},
    patch: [{op: 'remove', path: '/arr/0'}],
    expected: {cola: 'coca', arr: ['2', true, null, {}]},
  },
  {
    comment: 'Can remove array element in second position',
    doc: {cola: 'coca', arr: [1, '2', true, null, {}]},
    patch: [{op: 'remove', path: '/arr/1'}],
    expected: {cola: 'coca', arr: [1, true, null, {}]},
  },
  {
    comment: 'Can remove array element in third position',
    doc: {cola: 'coca', arr: [1, '2', true, null, {}]},
    patch: [{op: 'remove', path: '/arr/2'}],
    expected: {cola: 'coca', arr: [1, '2', null, {}]},
  },
  {
    comment: 'Can remove array element in fourth position',
    doc: {cola: 'coca', arr: [1, '2', true, null, {}]},
    patch: [{op: 'remove', path: '/arr/3'}],
    expected: {cola: 'coca', arr: [1, '2', true, {}]},
  },
  {
    comment: 'Can remove array element in fifth position',
    doc: {cola: 'coca', arr: [1, '2', true, null, {}]},
    patch: [{op: 'remove', path: '/arr/4'}],
    expected: {cola: 'coca', arr: [1, '2', true, null]},
  },
  {
    comment: 'Throws error when removing array element out of bounds',
    doc: {cola: 'coca', arr: [1, '2', true, null, {}]},
    patch: [{op: 'remove', path: '/arr/5'}],
    error: 'NOT_FOUND',
  },
  {
    comment: 'Throws error when removing array element at negative index "-2"',
    doc: {cola: 'coca', arr: [1, '2', true, null, {}]},
    patch: [{op: 'remove', path: '/arr/-2'}],
    error: 'INVALID_INDEX',
  },
  {
    comment: 'Throws error when removing array element at string index "str"',
    doc: {cola: 'coca', arr: [1, '2', true, null, {}]},
    patch: [{op: 'remove', path: '/arr/str'}],
    error: 'INVALID_INDEX',
  },
];

export default testCases;
