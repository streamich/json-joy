import type {QuillTrace} from '../../types';

export const fuzz1QuillTrace: QuillTrace = {
  contents: {
    ops: [
      {
        insert: {
          link: 'x$1||',
        },
      },
    ],
  },
  transactions: [
    [
      {
        insert: 'Y.?',
      },
    ],
    [
      {
        retain: 2,
      },
      {
        insert: 'Km',
      },
    ],
    [
      {
        insert: 'S',
      },
      {
        delete: 2,
      },
      {
        retain: 3,
      },
      {
        insert: {
          link: 'x$1||',
        },
      },
    ],
    [
      {
        retain: 2,
      },
      {
        insert: {
          link: '5/6a',
        },
      },
      {
        delete: 2,
      },
    ],
    [
      {
        insert: {
          link: 'г西',
        },
      },
    ],
    [
      {
        delete: 3,
      },
      {
        delete: 1,
      },
    ],
  ],
};
