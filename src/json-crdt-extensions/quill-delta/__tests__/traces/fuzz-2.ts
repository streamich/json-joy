import type {QuillTrace} from '../../types';

export const fuzz2QuillTrace: QuillTrace = {
  contents: {
    ops: [
      {
        insert: ':',
      },
      {
        insert: '<.',
        attributes: {
          italic: true,
        },
      },
      {
        insert: 'P',
      },
      {
        insert: 'CE',
        attributes: {
          italic: true,
        },
      },
      {
        insert: {
          link: 'ER}Z',
        },
      },
      {
        insert: '2_F#',
      },
      {
        insert: {
          link: 'P?G',
        },
      },
    ],
  },
  transactions: [
    [
      {
        insert: {
          link: '5@J/',
        },
      },
    ],
    [
      {
        delete: 1,
      },
      {
        insert: ':<.CE',
      },
    ],
    [
      {
        retain: 3,
      },
      {
        retain: 2,
        attributes: {
          italic: null,
        },
      },
      {
        insert: {
          link: 'ER}Z',
        },
      },
    ],
    [
      {
        retain: 1,
      },
      {
        retain: 4,
        attributes: {
          italic: true,
          bold: null,
        },
      },
      {
        retain: 1,
      },
      {
        insert: '2_F#',
      },
    ],
    [
      {
        retain: 3,
      },
      {
        insert: 'P',
      },
      {
        retain: 6,
      },
      {
        retain: 1,
        attributes: {
          italic: null,
        },
      },
      {
        insert: {
          link: 'P?G',
        },
      },
    ],
  ],
};
