import type {TestCase} from './types';

const testCases: TestCase[] = [
  {
    comment: 'At root, should find object',
    doc: {
      hello: 'world',
    },
    patch: [
      {
        op: 'in',
        path: '',
        value: [
          1,
          {
            hello: 'world',
          },
        ],
      },
    ],
    expected: {
      hello: 'world',
    },
  },
  {
    comment: 'At root, returns error when object list not match',
    doc: {
      hello: 'world',
    },
    patch: [
      {
        op: 'in',
        path: '',
        value: [1],
      },
    ],
    error: 'TEST',
  },
  {
    comment: 'At root, returns error when object list not match - 2',
    doc: [
      {
        hello: 'world',
      },
    ],
    patch: [
      {
        op: 'in',
        path: '',
        value: [1],
      },
    ],
    error: 'TEST',
  },
];

export default testCases;
