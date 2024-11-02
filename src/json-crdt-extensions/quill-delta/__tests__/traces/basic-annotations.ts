import type {QuillTrace} from '../../types';

/**
 * This trace includes only simple bold and italic annotations and growing of
 * bold text.
 */
export const basicAnnotationsQuillTrace: QuillTrace = {
  contents: {
    ops: [
      {
        insert: 'Trace with simple highlighting - ',
      },
      {
        attributes: {
          bold: true,
        },
        insert: 'bold',
      },
      {
        insert: ', ',
      },
      {
        attributes: {
          italic: true,
        },
        insert: 'italic',
      },
      {
        insert: ', ',
      },
      {
        attributes: {
          bold: true,
        },
        insert: 'bold growing yes it is growing',
      },
      {
        insert: '. Now lets do ',
      },
      {
        attributes: {
          italic: true,
          bold: true,
        },
        insert: 'bold and italic',
      },
      {
        insert: '.\n',
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
        insert: 'T',
      },
    ],
    [
      {
        retain: 1,
      },
      {
        insert: 'r',
      },
    ],
    [
      {
        retain: 2,
      },
      {
        insert: 'a',
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
        insert: 'e',
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
        insert: 'w',
      },
    ],
    [
      {
        retain: 7,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 8,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 9,
      },
      {
        insert: 'h',
      },
    ],
    [
      {
        retain: 10,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 11,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 12,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 13,
      },
      {
        insert: 'm',
      },
    ],
    [
      {
        retain: 14,
      },
      {
        insert: 'p',
      },
    ],
    [
      {
        retain: 15,
      },
      {
        insert: 'l',
      },
    ],
    [
      {
        retain: 16,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 17,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 18,
      },
      {
        insert: 'h',
      },
    ],
    [
      {
        retain: 19,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 20,
      },
      {
        insert: 'g',
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
        insert: 'l',
      },
    ],
    [
      {
        retain: 23,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 24,
      },
      {
        insert: 'g',
      },
    ],
    [
      {
        retain: 25,
      },
      {
        insert: 'h',
      },
    ],
    [
      {
        retain: 26,
      },
      {
        insert: 't',
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
        insert: '.',
      },
    ],
    [
      {
        retain: 30,
      },
      {
        delete: 1,
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
        insert: '-',
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
        insert: 'b',
      },
    ],
    [
      {
        retain: 34,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 35,
      },
      {
        insert: 'l',
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
        insert: ',',
      },
    ],
    [
      {
        retain: 38,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 39,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 40,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 41,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 42,
      },
      {
        insert: 'l',
      },
    ],
    [
      {
        retain: 43,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 44,
      },
      {
        insert: 'c',
      },
    ],
    [
      {
        retain: 45,
      },
      {
        insert: ',',
      },
    ],
    [
      {
        retain: 46,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 47,
      },
      {
        insert: 'b',
      },
    ],
    [
      {
        retain: 48,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 49,
      },
      {
        insert: 'l',
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
        insert: ' ',
      },
    ],
    [
      {
        retain: 52,
      },
      {
        insert: 'g',
      },
    ],
    [
      {
        retain: 53,
      },
      {
        insert: 'r',
      },
    ],
    [
      {
        retain: 54,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 55,
      },
      {
        insert: 'w',
      },
    ],
    [
      {
        retain: 56,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 57,
      },
      {
        insert: 'n',
      },
    ],
    [
      {
        retain: 58,
      },
      {
        insert: 'g',
      },
    ],
    [
      {
        retain: 59,
      },
      {
        insert: '.',
      },
    ],
    [
      {
        retain: 33,
      },
      {
        retain: 4,
        attributes: {
          bold: true,
        },
      },
    ],
    [
      {
        retain: 39,
      },
      {
        retain: 6,
        attributes: {
          italic: true,
        },
      },
    ],
    [
      {
        retain: 47,
      },
      {
        retain: 12,
        attributes: {
          bold: true,
        },
      },
    ],
    [
      {
        retain: 59,
      },
      {
        attributes: {
          bold: true,
        },
        insert: ' ',
      },
    ],
    [
      {
        retain: 60,
      },
      {
        attributes: {
          bold: true,
        },
        insert: 'y',
      },
    ],
    [
      {
        retain: 61,
      },
      {
        attributes: {
          bold: true,
        },
        insert: 'e',
      },
    ],
    [
      {
        retain: 62,
      },
      {
        attributes: {
          bold: true,
        },
        insert: 's',
      },
    ],
    [
      {
        retain: 63,
      },
      {
        attributes: {
          bold: true,
        },
        insert: ' ',
      },
    ],
    [
      {
        retain: 64,
      },
      {
        attributes: {
          bold: true,
        },
        insert: 'i',
      },
    ],
    [
      {
        retain: 65,
      },
      {
        attributes: {
          bold: true,
        },
        insert: 't',
      },
    ],
    [
      {
        retain: 66,
      },
      {
        attributes: {
          bold: true,
        },
        insert: ' ',
      },
    ],
    [
      {
        retain: 67,
      },
      {
        attributes: {
          bold: true,
        },
        insert: 'i',
      },
    ],
    [
      {
        retain: 68,
      },
      {
        attributes: {
          bold: true,
        },
        insert: 's',
      },
    ],
    [
      {
        retain: 69,
      },
      {
        attributes: {
          bold: true,
        },
        insert: ' ',
      },
    ],
    [
      {
        retain: 70,
      },
      {
        attributes: {
          bold: true,
        },
        insert: 'g',
      },
    ],
    [
      {
        retain: 71,
      },
      {
        attributes: {
          bold: true,
        },
        insert: 'r',
      },
    ],
    [
      {
        retain: 72,
      },
      {
        attributes: {
          bold: true,
        },
        insert: 'o',
      },
    ],
    [
      {
        retain: 73,
      },
      {
        attributes: {
          bold: true,
        },
        insert: 'w',
      },
    ],
    [
      {
        retain: 74,
      },
      {
        attributes: {
          bold: true,
        },
        insert: 'i',
      },
    ],
    [
      {
        retain: 75,
      },
      {
        attributes: {
          bold: true,
        },
        insert: 'n',
      },
    ],
    [
      {
        retain: 76,
      },
      {
        attributes: {
          bold: true,
        },
        insert: 'g',
      },
    ],
    [
      {
        retain: 78,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 79,
      },
      {
        insert: 'N',
      },
    ],
    [
      {
        retain: 80,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 81,
      },
      {
        insert: 'w',
      },
    ],
    [
      {
        retain: 82,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 83,
      },
      {
        insert: 'l',
      },
    ],
    [
      {
        retain: 84,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 85,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 85,
      },
      {
        delete: 1,
      },
    ],
    [
      {
        retain: 85,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 86,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 87,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 88,
      },
      {
        insert: 'd',
      },
    ],
    [
      {
        retain: 89,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 90,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 91,
      },
      {
        insert: 'b',
      },
    ],
    [
      {
        retain: 92,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 93,
      },
      {
        insert: 'l',
      },
    ],
    [
      {
        retain: 94,
      },
      {
        insert: 'd',
      },
    ],
    [
      {
        retain: 95,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 96,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 97,
      },
      {
        insert: 'n',
      },
    ],
    [
      {
        retain: 98,
      },
      {
        insert: 'd',
      },
    ],
    [
      {
        retain: 99,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 100,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 101,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 102,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 103,
      },
      {
        insert: 'l',
      },
    ],
    [
      {
        retain: 104,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 105,
      },
      {
        insert: 'c',
      },
    ],
    [
      {
        retain: 106,
      },
      {
        insert: '.',
      },
    ],
    [
      {
        retain: 91,
      },
      {
        retain: 15,
        attributes: {
          bold: true,
        },
      },
    ],
    [
      {
        retain: 91,
      },
      {
        retain: 15,
        attributes: {
          italic: true,
        },
      },
    ],
  ],
};
