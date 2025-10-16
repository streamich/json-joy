import type {TestCase} from './types';

const testCases: TestCase[] = [
  {
    comment: 'Succeeds when target has correct type',
    doc: {},
    patch: [
      {
        op: 'type',
        path: '',
        value: 'object',
      },
    ],
    expected: {},
  },
  {
    comment: 'Fails when type does not match',
    doc: {},
    patch: [
      {
        op: 'type',
        path: '',
        value: 'number',
      },
    ],
    error: 'TEST',
  },
];

export default testCases;
