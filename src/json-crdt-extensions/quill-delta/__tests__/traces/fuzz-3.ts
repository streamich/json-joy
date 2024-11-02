import type {QuillTrace} from '../../types';

export const fuzz3QuillTrace: QuillTrace = {
  contents: {
    ops: [{insert: {link: '0000'}}, {insert: '11112242'}, {insert: {link: '55555'}}],
  },
  transactions: [
    [
      {
        insert: {
          link: '0000',
        },
      },
      {
        insert: '1111111',
      },
    ],
    [
      {
        retain: 4,
      },
      {
        retain: 4,
        attributes: {
          bold: null,
        },
      },
      {
        insert: '222',
      },
    ],
    [
      {
        retain: 7,
      },
      {
        insert: {
          link: '33',
        },
      },
      {
        retain: 3,
      },
      {
        insert: '4',
      },
      {
        retain: 1,
      },
      {
        insert: {
          link: '55555',
        },
      },
    ],
    [
      {
        retain: 5,
      },
      {
        delete: 4,
      },
    ],
  ],
};
