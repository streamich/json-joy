import type {TestCase} from './types';

const testCases: TestCase[] = [
  {
    comment: 'At root, succeeds when value is higher than requested',
    doc: 123,
    patch: [
      {
        op: 'more',
        path: '',
        value: 99,
      },
    ],
    expected: 123,
  },
  {
    comment: 'At root, fails when value is not higher than requested',
    doc: 123,
    patch: [
      {
        op: 'more',
        path: '',
        value: 123,
      },
    ],
    error: 'TEST',
  },
  {
    comment: 'At root, fails when value is not higher than requested - 2',
    doc: 123,
    patch: [
      {
        op: 'more',
        path: '',
        value: 124,
      },
    ],
    error: 'TEST',
  },
];

export default testCases;
