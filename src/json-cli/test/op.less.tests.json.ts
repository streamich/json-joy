import type {TestCase} from './types';

const testCases: TestCase[] = [
  {
    comment: 'At root, succeeds when value is lower than requested',
    doc: 123,
    patch: [
      {
        op: 'less',
        path: '',
        value: 124,
      },
    ],
    expected: 123,
  },
  {
    comment: 'At root, fails when value is not lower than requested',
    doc: 123,
    patch: [
      {
        op: 'less',
        path: '',
        value: 123,
      },
    ],
    error: 'TEST',
  },
  {
    comment: 'At root, fails when value is not lower than requested - 2',
    doc: 123,
    patch: [
      {
        op: 'less',
        path: '',
        value: 1,
      },
    ],
    error: 'TEST',
  },
];

export default testCases;
