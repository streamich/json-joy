import type {TestCase} from './types';

const testCases: TestCase[] = [
  {
    comment: 'Correctly tests root primitive',
    doc: 123,
    patch: [{op: 'test', path: '', value: 123}],
    expected: 123,
  },
  {
    comment: 'Correctly tests root complex object',
    doc: {foo: 1, bar: [2]},
    patch: [{op: 'test', path: '', value: {foo: 1, bar: [2]}}],
    expected: {foo: 1, bar: [2]},
  },
  {
    comment: 'Correctly tests first level array',
    doc: {foo: 1, bar: [2]},
    patch: [{op: 'test', path: '/bar', value: [2]}],
    expected: {foo: 1, bar: [2]},
  },
  {
    comment: 'Throws error on invalid deep comparison',
    doc: {foo: 1, bar: [2]},
    patch: [{op: 'test', path: '/bar', value: [2, 2]}],
    error: 'TEST',
  },
  {
    comment: 'Throws error on invalid primitive comparison',
    doc: {foo: 1, bar: [2]},
    patch: [{op: 'test', path: '/foo', value: '1'}],
    error: 'TEST',
  },
];

export default testCases;
