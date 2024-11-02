import type {QuillTrace} from '../../types';

/**
 * Inserts and deletes image void.
 */
export const insertDeleteImageQuillTrace: QuillTrace = {
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
        insert: {
          image: 'data:image/jpeg;base64,...',
        },
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
