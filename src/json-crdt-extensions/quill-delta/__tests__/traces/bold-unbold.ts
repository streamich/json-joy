import type {QuillTrace} from '../../types';

/**
 * This stack bolds a word, then unbolds it.
 */
export const boldUnBoldQuillTrace: QuillTrace = {
  contents: {
    ops: [
      {
        insert: 'bold!\n',
      },
    ],
  },
  transactions: [
    [
      {
        insert: '\n',
      },
    ],
    [
      {
        insert: 'b',
      },
    ],
    [
      {
        retain: 1,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 2,
      },
      {
        insert: 'l',
      },
    ],
    [
      {
        retain: 3,
      },
      {
        insert: 'd',
      },
    ],
    [
      {
        retain: 4,
        attributes: {
          bold: true,
        },
      },
    ],
    [
      {
        retain: 4,
        attributes: {
          bold: null,
        },
      },
    ],
    [
      {
        retain: 4,
      },
      {
        insert: '!',
      },
    ],
  ],
};
