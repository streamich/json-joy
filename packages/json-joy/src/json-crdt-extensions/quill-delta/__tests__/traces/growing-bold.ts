import type {QuillTrace} from '../../types';

/**
 * This stack trace prepends "a" to bold "b", hence "ba" is bold.
 */
export const boldGrowingQuillTrace: QuillTrace = {
  contents: {
    ops: [
      {
        attributes: {
          bold: true,
        },
        insert: 'bax',
      },
      {
        insert: '\n',
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
        attributes: {
          bold: true,
        },
      },
    ],
    [
      {
        retain: 1,
      },
      {
        attributes: {
          bold: true,
        },
        insert: 'a',
      },
    ],
    [
      {
        retain: 2,
      },
      {
        attributes: {
          bold: true,
        },
        insert: 'x',
      },
    ],
  ],
};
