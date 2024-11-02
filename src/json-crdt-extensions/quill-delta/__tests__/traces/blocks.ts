import type {QuillTrace} from '../../types';

/**
 * Various block operations, changing block types.
 */
export const blockHandlingQuillTrace: QuillTrace = {
  contents: {
    ops: [
      {
        insert: 'Block types:\nparagraph \nheading 1 ',
      },
      {
        attributes: {
          header: 1,
        },
        insert: '\n',
      },
      {
        insert: 'heading 2 ',
      },
      {
        attributes: {
          header: 2,
        },
        insert: '\n',
      },
      {
        insert: 'list',
      },
      {
        attributes: {
          list: 'bullet',
        },
        insert: '\n',
      },
      {
        insert: 'sublist',
      },
      {
        attributes: {
          indent: 1,
          list: 'bullet',
        },
        insert: '\n',
      },
      {
        insert: "eval('process.exit()')",
      },
      {
        attributes: {
          'code-block': true,
        },
        insert: '\n',
      },
      {
        attributes: {
          font: 'serif',
        },
        insert: '...',
      },
      {
        insert: '\n\n',
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
        insert: 'B',
      },
    ],
    [
      {
        retain: 1,
      },
      {
        insert: 'l',
      },
    ],
    [
      {
        retain: 2,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 3,
      },
      {
        insert: 'c',
      },
    ],
    [
      {
        retain: 4,
      },
      {
        insert: 'k',
      },
    ],
    [
      {
        retain: 5,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 6,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 7,
      },
      {
        insert: 'y',
      },
    ],
    [
      {
        retain: 8,
      },
      {
        insert: 'p',
      },
    ],
    [
      {
        retain: 9,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 10,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 11,
      },
      {
        insert: ':',
      },
    ],
    [
      {
        retain: 12,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 13,
      },
      {
        insert: 'p',
      },
    ],
    [
      {
        retain: 14,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 15,
      },
      {
        insert: 'r',
      },
    ],
    [
      {
        retain: 16,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 17,
      },
      {
        insert: 'g',
      },
    ],
    [
      {
        retain: 18,
      },
      {
        insert: 'r',
      },
    ],
    [
      {
        retain: 19,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 20,
      },
      {
        insert: 'p',
      },
    ],
    [
      {
        retain: 21,
      },
      {
        insert: 'h',
      },
    ],
    [
      {
        retain: 22,
      },
      {
        insert: ',',
      },
    ],
    [
      {
        retain: 23,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 23,
      },
      {
        delete: 1,
      },
    ],
    [
      {
        retain: 22,
      },
      {
        delete: 1,
      },
    ],
    [
      {
        retain: 22,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 23,
      },
      {
        insert: 'h',
      },
    ],
    [
      {
        retain: 24,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 25,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 26,
      },
      {
        insert: 'd',
      },
    ],
    [
      {
        retain: 27,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 28,
      },
      {
        insert: 'n',
      },
    ],
    [
      {
        retain: 29,
      },
      {
        insert: 'g',
      },
    ],
    [
      {
        retain: 30,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 31,
      },
      {
        insert: '1',
      },
    ],
    [
      {
        retain: 32,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 33,
      },
      {
        insert: 'h',
      },
    ],
    [
      {
        retain: 34,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 35,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 36,
      },
      {
        insert: 'd',
      },
    ],
    [
      {
        retain: 37,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 38,
      },
      {
        insert: 'n',
      },
    ],
    [
      {
        retain: 39,
      },
      {
        insert: 'g',
      },
    ],
    [
      {
        retain: 40,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 41,
      },
      {
        insert: '2',
      },
    ],
    [
      {
        retain: 42,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 43,
      },
      {
        insert: 'l',
      },
    ],
    [
      {
        retain: 44,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 45,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 46,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 47,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 48,
      },
      {
        insert: 'c',
      },
    ],
    [
      {
        retain: 49,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 50,
      },
      {
        insert: 'd',
      },
    ],
    [
      {
        retain: 51,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 52,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 53,
      },
      {
        insert: '.',
      },
    ],
    [
      {
        retain: 54,
      },
      {
        insert: '.',
      },
    ],
    [
      {
        retain: 55,
      },
      {
        insert: '.',
      },
    ],
    [
      {
        retain: 12,
      },
      {
        delete: 1,
      },
    ],
    [
      {
        retain: 12,
      },
      {
        insert: '\n',
      },
    ],
    [
      {
        retain: 23,
      },
      {
        insert: '\n',
      },
    ],
    [
      {
        retain: 34,
      },
      {
        insert: '\n',
      },
    ],
    [
      {
        retain: 45,
      },
      {
        insert: '\n',
      },
    ],
    [
      {
        retain: 51,
      },
      {
        insert: '\n',
      },
    ],
    [
      {
        retain: 56,
      },
      {
        delete: 1,
      },
    ],
    [
      {
        retain: 56,
      },
      {
        insert: '\n',
      },
    ],
    [
      {
        retain: 50,
      },
      {
        delete: 1,
      },
    ],
    [
      {
        retain: 34,
      },
      {
        retain: 1,
        attributes: {
          header: 1,
        },
      },
    ],
    [
      {
        retain: 45,
      },
      {
        retain: 1,
        attributes: {
          header: 2,
        },
      },
    ],
    [
      {
        retain: 23,
      },
      {
        retain: 1,
        attributes: {
          align: 'right',
        },
      },
    ],
    [
      {
        retain: 23,
      },
      {
        retain: 1,
        attributes: {
          direction: 'rtl',
        },
      },
    ],
    [
      {
        retain: 23,
      },
      {
        retain: 1,
        attributes: {
          align: null,
        },
      },
    ],
    [
      {
        retain: 23,
      },
      {
        retain: 1,
        attributes: {
          direction: null,
        },
      },
    ],
    [
      {
        retain: 50,
      },
      {
        retain: 1,
        attributes: {
          list: 'ordered',
        },
      },
    ],
    [
      {
        retain: 50,
      },
      {
        retain: 1,
        attributes: {
          list: 'bullet',
        },
      },
    ],
    [
      {
        retain: 50,
      },
      {
        insert: '\n',
        attributes: {
          list: 'bullet',
        },
      },
    ],
    [
      {
        retain: 51,
      },
      {
        retain: 1,
        attributes: {
          indent: 1,
        },
      },
    ],
    [
      {
        retain: 51,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 52,
      },
      {
        insert: 'u',
      },
    ],
    [
      {
        retain: 53,
      },
      {
        insert: 'b',
      },
    ],
    [
      {
        retain: 54,
      },
      {
        insert: 'l',
      },
    ],
    [
      {
        retain: 55,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 56,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 57,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 63,
      },
      {
        retain: 1,
        attributes: {
          'code-block': true,
        },
      },
    ],
    [
      {
        retain: 62,
      },
      {
        delete: 1,
      },
    ],
    [
      {
        retain: 61,
      },
      {
        delete: 1,
      },
    ],
    [
      {
        retain: 60,
      },
      {
        delete: 1,
      },
    ],
    [
      {
        retain: 59,
      },
      {
        delete: 1,
      },
    ],
    [
      {
        retain: 59,
      },
      {
        insert: 'v',
      },
    ],
    [
      {
        retain: 59,
      },
      {
        delete: 1,
      },
    ],
    [
      {
        retain: 59,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 60,
      },
      {
        insert: 'v',
      },
    ],
    [
      {
        retain: 61,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 62,
      },
      {
        insert: 'l',
      },
    ],
    [
      {
        retain: 63,
      },
      {
        insert: '(',
      },
    ],
    [
      {
        retain: 64,
      },
      {
        insert: "'",
      },
    ],
    [
      {
        retain: 65,
      },
      {
        insert: 'p',
      },
    ],
    [
      {
        retain: 66,
      },
      {
        insert: 'r',
      },
    ],
    [
      {
        retain: 67,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 68,
      },
      {
        insert: 'c',
      },
    ],
    [
      {
        retain: 69,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 70,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 71,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 72,
      },
      {
        insert: '.',
      },
    ],
    [
      {
        retain: 73,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 74,
      },
      {
        insert: 'x',
      },
    ],
    [
      {
        retain: 75,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 76,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 77,
      },
      {
        insert: '(',
      },
    ],
    [
      {
        retain: 78,
      },
      {
        insert: ')',
      },
    ],
    [
      {
        retain: 79,
      },
      {
        insert: "'",
      },
    ],
    [
      {
        retain: 80,
      },
      {
        insert: ')',
      },
    ],
    [
      {
        retain: 85,
      },
      {
        retain: 1,
        attributes: {
          indent: 1,
        },
      },
    ],
    [
      {
        retain: 85,
      },
      {
        retain: 1,
        attributes: {
          indent: 2,
        },
      },
    ],
    [
      {
        retain: 85,
      },
      {
        retain: 1,
        attributes: {
          indent: 3,
        },
      },
    ],
    [
      {
        retain: 85,
      },
      {
        retain: 1,
        attributes: {
          indent: 2,
        },
      },
    ],
    [
      {
        retain: 85,
      },
      {
        retain: 1,
        attributes: {
          indent: 1,
        },
      },
    ],
    [
      {
        retain: 85,
      },
      {
        retain: 1,
        attributes: {
          indent: null,
        },
      },
    ],
    [
      {
        retain: 82,
      },
      {
        retain: 3,
        attributes: {
          font: 'serif',
        },
      },
    ],
    [
      {
        retain: 85,
      },
      {
        insert: '\n',
      },
    ],
  ],
};
