import type {QuillTrace} from '../../types';

/**
 * Bolds and italics some text, then un-italics some part.
 */
export const boldItalicUnitalicQuillTrace: QuillTrace = {
  contents: {
    ops: [
      {
        attributes: {
          bold: true,
        },
        insert: 'bold',
      },
      {
        attributes: {
          italic: true,
          bold: true,
        },
        insert: ' bold-italic',
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
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 5,
      },
      {
        insert: 'b',
      },
    ],
    [
      {
        retain: 6,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 7,
      },
      {
        insert: 'l',
      },
    ],
    [
      {
        retain: 8,
      },
      {
        insert: 'd',
      },
    ],
    [
      {
        retain: 9,
      },
      {
        insert: '-',
      },
    ],
    [
      {
        retain: 10,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 11,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 12,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 13,
      },
      {
        insert: 'l',
      },
    ],
    [
      {
        retain: 14,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 15,
      },
      {
        insert: 'c',
      },
    ],
    [
      {
        retain: 16,
        attributes: {
          bold: true,
        },
      },
    ],
    [
      {
        retain: 5,
      },
      {
        retain: 11,
        attributes: {
          italic: true,
        },
      },
    ],
    [
      {
        retain: 5,
        attributes: {
          italic: true,
        },
      },
    ],
    [
      {
        retain: 4,
        attributes: {
          italic: null,
        },
      },
    ],
  ],
};
