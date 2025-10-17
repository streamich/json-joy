import type {QuillTrace} from '../../types';

/**
 * This trace includes only inserts and deletes. Including multi-character
 * inserts and deletes.
 */
export const insertDeleteQuillTrace: QuillTrace = {
  contents: {
    ops: [
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
        insert: 'H',
      },
    ],
    [
      {
        retain: 1,
      },
      {
        insert: 'e',
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
        insert: 'l',
      },
    ],
    [
      {
        retain: 4,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 5,
      },
      {
        insert: '!',
      },
    ],
    [
      {
        retain: 6,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 7,
      },
      {
        insert: 'T',
      },
    ],
    [
      {
        retain: 8,
      },
      {
        insert: 'h',
      },
    ],
    [
      {
        retain: 9,
      },
      {
        insert: 'i',
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
        insert: ' ',
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
        insert: 's',
      },
    ],
    [
      {
        retain: 14,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 15,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 16,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 17,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 18,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 19,
      },
      {
        insert: 'm',
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
        insert: 'l',
      },
    ],
    [
      {
        retain: 22,
      },
      {
        insert: 'e',
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
        retain: 24,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 25,
      },
      {
        insert: 'n',
      },
    ],
    [
      {
        retain: 26,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 27,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 27,
      },
      {
        delete: 1,
      },
    ],
    [
      {
        retain: 27,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 28,
      },
      {
        insert: 'r',
      },
    ],
    [
      {
        retain: 29,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 30,
      },
      {
        insert: '/',
      },
    ],
    [
      {
        retain: 31,
      },
      {
        insert: 'd',
      },
    ],
    [
      {
        retain: 32,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 33,
      },
      {
        insert: 'l',
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
        insert: 't',
      },
    ],
    [
      {
        retain: 36,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 37,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 38,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 39,
      },
      {
        insert: 'r',
      },
    ],
    [
      {
        retain: 40,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 41,
      },
      {
        insert: 'c',
      },
    ],
    [
      {
        retain: 42,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 43,
      },
      {
        insert: '!',
      },
    ],
    [
      {
        retain: 43,
      },
      {
        delete: 1,
      },
    ],
    [
      {
        retain: 43,
      },
      {
        insert: '.',
      },
    ],
    [
      {
        retain: 44,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 45,
      },
      {
        insert: 'Y',
      },
    ],
    [
      {
        retain: 46,
      },
      {
        insert: 'u',
      },
    ],
    [
      {
        retain: 47,
      },
      {
        insert: 'p',
      },
    ],
    [
      {
        retain: 48,
      },
      {
        insert: ',',
      },
    ],
    [
      {
        retain: 49,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 50,
      },
      {
        insert: 'h',
      },
    ],
    [
      {
        retain: 51,
      },
      {
        insert: 'w',
      },
    ],
    [
      {
        retain: 52,
      },
      {
        insert: 'e',
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
        retain: 53,
      },
      {
        delete: 1,
      },
    ],
    [
      {
        retain: 52,
      },
      {
        delete: 1,
      },
    ],
    [
      {
        retain: 51,
      },
      {
        delete: 1,
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
        insert: 'r',
      },
    ],
    [
      {
        retain: 53,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 54,
      },
      {
        insert: ' ',
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
        insert: 'e',
      },
    ],
    [
      {
        retain: 57,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 58,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 59,
      },
      {
        insert: 'n',
      },
    ],
    [
      {
        retain: 60,
      },
      {
        insert: 'l',
      },
    ],
    [
      {
        retain: 61,
      },
      {
        insert: 'y',
      },
    ],
    [
      {
        retain: 62,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 63,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 64,
      },
      {
        insert: 'n',
      },
    ],
    [
      {
        retain: 65,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 66,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 67,
      },
      {
        insert: 'r',
      },
    ],
    [
      {
        retain: 68,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 69,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 70,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 71,
      },
      {
        insert: 'n',
      },
    ],
    [
      {
        retain: 72,
      },
      {
        insert: 'd',
      },
    ],
    [
      {
        retain: 73,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 74,
      },
      {
        insert: 'd',
      },
    ],
    [
      {
        retain: 75,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 76,
      },
      {
        insert: 'l',
      },
    ],
    [
      {
        retain: 77,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 78,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 79,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 80,
      },
      {
        insert: '!',
      },
    ],
    [
      {
        retain: 7,
      },
      {
        delete: 38,
      },
    ],
    [
      {
        retain: 6,
      },
      {
        delete: 1,
      },
    ],
    [
      {
        retain: 6,
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
        insert: ' ',
      },
    ],
    [
      {
        retain: 44,
      },
      {
        insert: 'H',
      },
    ],
    [
      {
        retain: 45,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 46,
      },
      {
        insert: 'r',
      },
    ],
    [
      {
        retain: 47,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 48,
      },
      {
        insert: ',',
      },
    ],
    [
      {
        retain: 49,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 50,
      },
      {
        insert: 'g',
      },
    ],
    [
      {
        retain: 51,
      },
      {
        insert: 'r',
      },
    ],
    [
      {
        retain: 52,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 53,
      },
      {
        insert: 'p',
      },
    ],
    [
      {
        retain: 53,
      },
      {
        delete: 1,
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
        insert: ' ',
      },
    ],
    [
      {
        retain: 55,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 56,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 57,
      },
      {
        insert: 'l',
      },
    ],
    [
      {
        retain: 58,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 59,
      },
      {
        insert: 'n',
      },
    ],
    [
      {
        retain: 60,
      },
      {
        insert: 'k',
      },
    ],
    [
      {
        retain: 61,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 62,
      },
      {
        insert: '(',
      },
    ],
    [
      {
        retain: 63,
      },
      {
        insert: ')',
      },
    ],
    [
      {
        retain: 63,
      },
      {
        delete: 1,
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
        retain: 61,
      },
      {
        insert: ':',
      },
    ],
    [
      {
        retain: 62,
      },
      {
        insert: ' ',
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
        insert: ')',
      },
    ],
    [
      {
        retain: 65,
      },
      {
        insert: '!',
      },
    ],
    [
      {
        retain: 64,
      },
      {
        insert: 'https://codepen.io/',
      },
    ],
    [
      {
        retain: 44,
      },
      {
        insert: 'S',
      },
      {
        delete: 41,
      },
    ],
    [
      {
        retain: 45,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 46,
      },
      {
        insert: 'r',
      },
    ],
    [
      {
        retain: 47,
      },
      {
        insert: 'r',
      },
    ],
    [
      {
        retain: 48,
      },
      {
        insert: 'y',
      },
    ],
    [
      {
        retain: 49,
      },
      {
        insert: ',',
      },
    ],
    [
      {
        retain: 50,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 51,
      },
      {
        insert: 'a',
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
        insert: 'w',
      },
    ],
    [
      {
        retain: 54,
      },
      {
        insert: 'r',
      },
    ],
    [
      {
        retain: 55,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 56,
      },
      {
        insert: 'n',
      },
    ],
    [
      {
        retain: 57,
      },
      {
        insert: 'g',
      },
    ],
    [
      {
        retain: 58,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 59,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 60,
      },
      {
        insert: 'n',
      },
    ],
    [
      {
        retain: 61,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 62,
      },
      {
        insert: ',',
      },
    ],
    [
      {
        retain: 63,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 64,
      },
      {
        insert: 'h',
      },
    ],
    [
      {
        retain: 65,
      },
      {
        insert: 'e',
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
        insert: 'e',
      },
    ],
    [
      {
        retain: 68,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 69,
      },
      {
        insert: 'i',
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
        insert: ' ',
      },
    ],
    [
      {
        retain: 72,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 73,
      },
      {
        insert: 'h',
      },
    ],
    [
      {
        retain: 74,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 75,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 76,
      },
      {
        insert: 'r',
      },
    ],
    [
      {
        retain: 77,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 78,
      },
      {
        insert: 'g',
      },
    ],
    [
      {
        retain: 79,
      },
      {
        insert: 'h',
      },
    ],
    [
      {
        retain: 80,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 81,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 82,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 83,
      },
      {
        insert: 'n',
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
        insert: ':',
      },
    ],
    [
      {
        retain: 86,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 87,
      },
      {
        insert: 'https://codepen.io/Vadim-Dalecky/pen/PoyMVmz',
      },
    ],
    [
      {
        retain: 131,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 132,
      },
      {
        insert: '.',
      },
    ],
    [
      {
        retain: 133,
      },
      {
        insert: '.',
      },
    ],
    [
      {
        retain: 134,
      },
      {
        insert: '.',
      },
    ],
    [
      {
        retain: 135,
      },
      {
        insert: '.',
      },
    ],
    [
      {
        retain: 136,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 137,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 138,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 139,
      },
      {
        insert: 'd',
      },
    ],
    [
      {
        retain: 140,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 141,
      },
      {
        insert: '!',
      },
    ],
    [
      {
        retain: 7,
      },
      {
        delete: 135,
      },
    ],
    [
      {
        retain: 7,
      },
      {
        insert: 'B',
      },
    ],
    [
      {
        retain: 8,
      },
      {
        insert: 'y',
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
        insert: '!',
      },
    ],
    [
      {
        delete: 7,
      },
    ],
    [
      {
        delete: 4,
      },
    ],
    [
      {
        insert: '.',
      },
    ],
    [
      {
        delete: 1,
      },
    ],
  ],
};
