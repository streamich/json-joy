import type {QuillTrace} from '../../types';

/**
 * Block split and un-split.
 */
export const splitUnSplitQuillTrace: QuillTrace = {
  contents: {
    ops: [
      {
        insert: 'ab\n',
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
        insert: 'a',
      },
    ],
    [
      {
        retain: 1,
      },
      {
        insert: 'b',
      },
    ],
    [
      {
        retain: 1,
      },
      {
        insert: '\n',
      },
    ],
    [
      {
        retain: 1,
      },
      {
        delete: 1,
      },
    ],
  ],
};
