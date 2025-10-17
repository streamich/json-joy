import type {QuillTrace} from '../../types';

/**
 * This trace includes almost all features of Quill Delta.
 *
 * - annotations: bold, italic, link, blockquote
 *   - and un-annotations
 * - insertions: text, newline
 * - paste
 * - deletions: single character and multiple characters
 * - retain
 * - paragraph formatting
 * - block splitting and un-splitting
 */
export const generalQuillTrace: QuillTrace = {
  contents: {
    ops: [
      {
        insert: 'This is a ',
      },
      {
        attributes: {
          bold: true,
        },
        insert: 'Quill Delta',
      },
      {
        insert: ' test ',
      },
      {
        attributes: {
          italic: true,
        },
        insert: 'editing trace ',
      },
      {
        insert: '(what is quill?). Lets ',
      },
      {
        attributes: {
          bold: true,
        },
        insert: 'inser',
      },
      {
        insert: 'T',
      },
      {
        attributes: {
          bold: true,
        },
        insert: ' ',
      },
      {
        attributes: {
          italic: true,
          bold: true,
        },
        insert: 'paste',
      },
      {
        insert: ' some text: ',
      },
      {
        attributes: {
          link: 'https://codepen.io/',
        },
        insert: 'https://codepens.io',
      },
      {
        insert: '\n\nThis is a block quote....',
      },
      {
        attributes: {
          blockquote: true,
        },
        insert: '\n',
      },
      {
        insert: '\nHello world!\n\n',
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
        insert: 'h',
      },
    ],
    [
      {
        retain: 2,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 3,
      },
      {
        insert: 's',
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
        insert: 'i',
      },
    ],
    [
      {
        retain: 6,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 7,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 8,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 9,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 10,
      },
      {
        insert: 'Q',
      },
    ],
    [
      {
        retain: 11,
      },
      {
        insert: 'u',
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
        insert: 'l',
      },
    ],
    [
      {
        retain: 14,
      },
      {
        insert: 'l',
      },
    ],
    [
      {
        retain: 15,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 16,
      },
      {
        insert: 'D',
      },
    ],
    [
      {
        retain: 17,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 18,
      },
      {
        insert: 'l',
      },
    ],
    [
      {
        retain: 19,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 20,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 21,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 22,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 23,
      },
      {
        insert: 's',
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
        retain: 23,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 24,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 25,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 26,
      },
      {
        insert: ' ',
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
        insert: 'd',
      },
    ],
    [
      {
        retain: 29,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 30,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 31,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 32,
      },
      {
        insert: 'n',
      },
    ],
    [
      {
        retain: 33,
      },
      {
        insert: 'g',
      },
    ],
    [
      {
        retain: 34,
      },
      {
        insert: ' ',
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
        insert: 'r',
      },
    ],
    [
      {
        retain: 37,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 38,
      },
      {
        insert: 'c',
      },
    ],
    [
      {
        retain: 39,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 40,
      },
      {
        insert: '.',
      },
    ],
    [
      {
        retain: 41,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 42,
      },
      {
        insert: 'Y',
      },
    ],
    [
      {
        retain: 43,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 44,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 45,
      },
      {
        insert: 'h',
      },
    ],
    [
      {
        retain: 46,
      },
      {
        insert: 'h',
      },
    ],
    [
      {
        retain: 47,
      },
      {
        insert: 'h',
      },
    ],
    [
      {
        retain: 48,
      },
      {
        insert: 'h',
      },
    ],
    [
      {
        retain: 49,
      },
      {
        insert: '!',
      },
    ],
    [
      {
        retain: 50,
      },
      {
        insert: '!',
      },
    ],
    [
      {
        retain: 41,
      },
      {
        delete: 10,
      },
    ],
    [
      {
        retain: 41,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 42,
      },
      {
        insert: 'L',
      },
    ],
    [
      {
        retain: 43,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 44,
      },
      {
        insert: 't',
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
        insert: ' ',
      },
    ],
    [
      {
        retain: 47,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 48,
      },
      {
        insert: 'p',
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
        insert: 'i',
      },
    ],
    [
      {
        retain: 51,
      },
      {
        insert: 't',
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
        insert: 'a',
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
        insert: 'b',
      },
    ],
    [
      {
        retain: 56,
      },
      {
        insert: 'l',
      },
    ],
    [
      {
        retain: 57,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 58,
      },
      {
        insert: 'c',
      },
    ],
    [
      {
        retain: 59,
      },
      {
        insert: 'k',
      },
    ],
    [
      {
        retain: 60,
      },
      {
        insert: ' ',
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
        insert: ' ',
      },
    ],
    [
      {
        retain: 63,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 64,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 65,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 66,
      },
      {
        insert: 'h',
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
        insert: 'e',
      },
    ],
    [
      {
        retain: 70,
      },
      {
        insert: 'n',
      },
    ],
    [
      {
        retain: 71,
      },
      {
        insert: 'd',
      },
    ],
    [
      {
        retain: 72,
      },
      {
        insert: ':',
      },
    ],
    [
      {
        retain: 73,
      },
      {
        insert: '\n',
      },
    ],
    [
      {
        retain: 74,
      },
      {
        insert: '\n',
      },
    ],
    [
      {
        retain: 75,
      },
      {
        insert: 'D',
      },
    ],
    [
      {
        retain: 76,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 77,
      },
      {
        insert: 'n',
      },
    ],
    [
      {
        retain: 78,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 79,
      },
      {
        insert: '!',
      },
    ],
    [
      {
        retain: 41,
      },
      {
        delete: 39,
      },
    ],
    [
      {
        retain: 41,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 42,
      },
      {
        insert: 'N',
      },
    ],
    [
      {
        retain: 43,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 44,
      },
      {
        insert: 'w',
      },
    ],
    [
      {
        retain: 45,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 46,
      },
      {
        insert: 'l',
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
        insert: 't',
      },
    ],
    [
      {
        retain: 49,
      },
      {
        insert: 's',
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
        insert: 's',
      },
    ],
    [
      {
        retain: 52,
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
        insert: 'l',
      },
    ],
    [
      {
        retain: 54,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 55,
      },
      {
        insert: 't',
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
        insert: 'a',
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
        insert: 'b',
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
        insert: 'o',
      },
    ],
    [
      {
        retain: 62,
      },
      {
        insert: 'c',
      },
    ],
    [
      {
        retain: 63,
      },
      {
        insert: 'k',
      },
    ],
    [
      {
        retain: 64,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 65,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 66,
      },
      {
        insert: 'n',
      },
    ],
    [
      {
        retain: 67,
      },
      {
        insert: ' ',
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
        insert: 'h',
      },
    ],
    [
      {
        retain: 70,
      },
      {
        insert: 'e',
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
        insert: 'm',
      },
    ],
    [
      {
        retain: 73,
      },
      {
        insert: 'i',
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
        insert: 'd',
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
        insert: '!',
      },
    ],
    [
      {
        retain: 59,
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
        insert: '(',
      },
    ],
    [
      {
        retain: 60,
      },
      {
        insert: 'h',
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
        insert: 'r',
      },
    ],
    [
      {
        retain: 63,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 64,
      },
      {
        insert: ':',
      },
    ],
    [
      {
        retain: 65,
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
        insert: '\n',
      },
    ],
    [
      {
        retain: 66,
      },
      {
        insert: '\n',
      },
    ],
    [
      {
        retain: 41,
      },
      {
        delete: 28,
      },
    ],
    [
      {
        retain: 41,
      },
      {
        delete: 20,
      },
    ],
    [
      {
        retain: 41,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 42,
      },
      {
        insert: 'L',
      },
    ],
    [
      {
        retain: 43,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 44,
      },
      {
        insert: 't',
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
        insert: ' ',
      },
    ],
    [
      {
        retain: 47,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 48,
      },
      {
        insert: 'n',
      },
    ],
    [
      {
        retain: 49,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 50,
      },
      {
        insert: 'e',
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
        insert: 't',
      },
    ],
    [
      {
        retain: 53,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 54,
      },
      {
        insert: 's',
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
        insert: 'm',
      },
    ],
    [
      {
        retain: 57,
      },
      {
        insert: 'e',
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
        insert: 't',
      },
    ],
    [
      {
        retain: 60,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 61,
      },
      {
        insert: 'x',
      },
    ],
    [
      {
        retain: 59,
      },
      {
        delete: 3,
      },
    ],
    [
      {
        retain: 54,
      },
      {
        delete: 5,
      },
    ],
    [
      {
        retain: 54,
      },
      {
        insert: 'p',
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
        retain: 58,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 59,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 60,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 61,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 62,
      },
      {
        insert: 'm',
      },
    ],
    [
      {
        retain: 63,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 64,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 65,
      },
      {
        insert: 't',
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
        insert: 'x',
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
        insert: ':',
      },
    ],
    [
      {
        retain: 70,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 71,
      },
      {
        insert: '!',
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
        insert: 'https://codepen.io/',
      },
    ],
    [
      {
        retain: 71,
      },
      {
        delete: 1,
      },
    ],
    [
      {
        retain: 86,
      },
      {
        insert: '\n',
      },
    ],
    [
      {
        retain: 87,
      },
      {
        insert: '\n',
      },
    ],
    [
      {
        retain: 86,
      },
      {
        insert: '.',
      },
    ],
    [
      {
        retain: 87,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 88,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 71,
      },
      {
        retain: 18,
        attributes: {
          link: 'https://codepen.io/',
        },
      },
    ],
    [
      {
        retain: 91,
      },
      {
        delete: 5,
      },
    ],
    [
      {
        retain: 90,
      },
      {
        delete: 1,
      },
    ],
    [
      {
        retain: 89,
      },
      {
        delete: 1,
      },
    ],
    [
      {
        retain: 86,
      },
      {
        attributes: {
          link: 'https://codepen.io/',
        },
        insert: 's',
      },
    ],
    [
      {
        retain: 90,
      },
      {
        insert: '\n',
      },
    ],
    [
      {
        retain: 91,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 92,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 93,
      },
      {
        insert: 'd',
      },
    ],
    [
      {
        retain: 94,
      },
      {
        insert: 'f',
      },
    ],
    [
      {
        retain: 91,
      },
      {
        insert: '\n',
      },
    ],
    [
      {
        retain: 92,
      },
      {
        insert: 'L',
      },
      {
        delete: 4,
      },
    ],
    [
      {
        retain: 93,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 94,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 95,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 96,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 97,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 98,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 99,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 100,
      },
      {
        insert: 'r',
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
        insert: ' ',
      },
    ],
    [
      {
        retain: 103,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 104,
      },
      {
        insert: 'n',
      },
    ],
    [
      {
        retain: 105,
      },
      {
        insert: 'l',
      },
    ],
    [
      {
        retain: 106,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 107,
      },
      {
        insert: 'n',
      },
    ],
    [
      {
        retain: 108,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 109,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 110,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 111,
      },
      {
        insert: 'd',
      },
    ],
    [
      {
        retain: 112,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 113,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 114,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 115,
      },
      {
        insert: 'n',
      },
    ],
    [
      {
        retain: 116,
      },
      {
        insert: 'g',
      },
    ],
    [
      {
        retain: 117,
      },
      {
        insert: '.',
      },
    ],
    [
      {
        retain: 97,
      },
      {
        retain: 5,
        attributes: {
          italic: true,
        },
      },
    ],
    [
      {
        retain: 103,
      },
      {
        retain: 6,
        attributes: {
          bold: true,
        },
      },
    ],
    [
      {
        retain: 102,
      },
      {
        attributes: {
          italic: true,
        },
        insert: 's',
      },
    ],
    [
      {
        retain: 110,
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
        retain: 90,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 91,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 92,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 93,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 90,
      },
      {
        delete: 4,
      },
    ],
    [
      {
        retain: 101,
      },
      {
        retain: 6,
        attributes: {
          bold: true,
        },
      },
    ],
    [
      {
        retain: 103,
      },
      {
        retain: 1,
        attributes: {
          italic: true,
        },
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
        retain: 104,
      },
      {
        attributes: {
          italic: true,
          bold: true,
        },
        insert: 't',
      },
    ],
    [
      {
        retain: 105,
      },
      {
        attributes: {
          italic: true,
          bold: true,
        },
        insert: 'e',
      },
    ],
    [
      {
        retain: 106,
      },
      {
        attributes: {
          italic: true,
          bold: true,
        },
        insert: 'x',
      },
    ],
    [
      {
        retain: 107,
      },
      {
        attributes: {
          italic: true,
          bold: true,
        },
        insert: 't',
      },
    ],
    [
      {
        retain: 108,
      },
      {
        retain: 1,
        attributes: {
          italic: true,
        },
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
        retain: 109,
      },
      {
        attributes: {
          italic: true,
          bold: true,
        },
        insert: 'i',
      },
    ],
    [
      {
        retain: 110,
      },
      {
        attributes: {
          italic: true,
          bold: true,
        },
        insert: 'n',
      },
    ],
    [
      {
        retain: 111,
      },
      {
        retain: 1,
        attributes: {
          italic: true,
        },
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
        retain: 112,
      },
      {
        attributes: {
          italic: true,
          bold: true,
        },
        insert: 't',
      },
    ],
    [
      {
        retain: 113,
      },
      {
        attributes: {
          italic: true,
          bold: true,
        },
        insert: 'h',
      },
    ],
    [
      {
        retain: 114,
      },
      {
        attributes: {
          italic: true,
          bold: true,
        },
        insert: 'e',
      },
    ],
    [
      {
        retain: 115,
      },
      {
        retain: 1,
        attributes: {
          italic: true,
        },
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
        retain: 116,
      },
      {
        attributes: {
          italic: true,
          bold: true,
        },
        insert: 'm',
      },
    ],
    [
      {
        retain: 117,
      },
      {
        attributes: {
          italic: true,
          bold: true,
        },
        insert: 'i',
      },
    ],
    [
      {
        retain: 118,
      },
      {
        attributes: {
          italic: true,
          bold: true,
        },
        insert: 'd',
      },
    ],
    [
      {
        retain: 119,
      },
      {
        attributes: {
          italic: true,
          bold: true,
        },
        insert: 'd',
      },
    ],
    [
      {
        retain: 120,
      },
      {
        attributes: {
          italic: true,
          bold: true,
        },
        insert: 'l',
      },
    ],
    [
      {
        retain: 121,
      },
      {
        attributes: {
          italic: true,
          bold: true,
        },
        insert: 'e',
      },
    ],
    [
      {
        retain: 109,
      },
      {
        retain: 8,
        attributes: {
          bold: null,
        },
      },
    ],
    [
      {
        retain: 112,
      },
      {
        attributes: {
          italic: true,
        },
        insert: ' ',
      },
    ],
    [
      {
        retain: 112,
      },
      {
        attributes: {
          italic: true,
        },
        insert: 'a',
      },
    ],
    [
      {
        retain: 113,
      },
      {
        attributes: {
          italic: true,
        },
        insert: 'h',
      },
    ],
    [
      {
        retain: 114,
      },
      {
        attributes: {
          italic: true,
        },
        insert: 'a',
      },
    ],
    [
      {
        retain: 115,
      },
      {
        attributes: {
          italic: true,
        },
        insert: '.',
      },
    ],
    [
      {
        retain: 116,
      },
      {
        attributes: {
          italic: true,
        },
        insert: '.',
      },
    ],
    [
      {
        retain: 117,
      },
      {
        attributes: {
          italic: true,
        },
        insert: '.',
      },
    ],
    [
      {
        retain: 112,
      },
      {
        retain: 10,
        attributes: {
          italic: null,
        },
      },
    ],
    [
      {
        retain: 96,
      },
      {
        retain: 42,
        attributes: {
          italic: true,
        },
      },
    ],
    [
      {
        retain: 96,
      },
      {
        retain: 42,
        attributes: {
          italic: null,
        },
      },
    ],
    [
      {
        retain: 96,
      },
      {
        retain: 42,
        attributes: {
          bold: true,
        },
      },
    ],
    [
      {
        retain: 96,
      },
      {
        retain: 42,
        attributes: {
          bold: null,
        },
      },
    ],
    [
      {
        retain: 92,
      },
      {
        delete: 54,
      },
    ],
    [
      {
        retain: 92,
      },
      {
        insert: 'L',
      },
    ],
    [
      {
        retain: 93,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 94,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 95,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 96,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 97,
      },
      {
        insert: 'c',
      },
    ],
    [
      {
        retain: 98,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 99,
      },
      {
        insert: 'n',
      },
    ],
    [
      {
        retain: 100,
      },
      {
        insert: 'v',
      },
    ],
    [
      {
        retain: 101,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 102,
      },
      {
        insert: 'r',
      },
    ],
    [
      {
        retain: 103,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 104,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 105,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 106,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 107,
      },
      {
        insert: 'p',
      },
    ],
    [
      {
        retain: 108,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 109,
      },
      {
        insert: 'r',
      },
    ],
    [
      {
        retain: 110,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 111,
      },
      {
        insert: 'g',
      },
    ],
    [
      {
        retain: 112,
      },
      {
        insert: 'r',
      },
    ],
    [
      {
        retain: 113,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 114,
      },
      {
        insert: 'p',
      },
    ],
    [
      {
        retain: 115,
      },
      {
        insert: 'h',
      },
    ],
    [
      {
        retain: 116,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 117,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 118,
      },
      {
        insert: 'n',
      },
    ],
    [
      {
        retain: 119,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 120,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 121,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 122,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 123,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 124,
      },
      {
        insert: 'h',
      },
    ],
    [
      {
        retain: 125,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 126,
      },
      {
        insert: 'a',
      },
    ],
    [
      {
        retain: 127,
      },
      {
        insert: 'd',
      },
    ],
    [
      {
        retain: 128,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 129,
      },
      {
        insert: 'n',
      },
    ],
    [
      {
        retain: 130,
      },
      {
        insert: 'g',
      },
    ],
    [
      {
        retain: 131,
      },
      {
        insert: '.',
      },
    ],
    [
      {
        retain: 132,
      },
      {
        insert: '\n',
      },
    ],
    [
      {
        retain: 133,
      },
      {
        insert: '\n',
      },
    ],
    [
      {
        retain: 134,
      },
      {
        insert: 'L',
      },
    ],
    [
      {
        retain: 135,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 136,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 137,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 138,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 139,
      },
      {
        insert: 'g',
      },
    ],
    [
      {
        retain: 140,
      },
      {
        insert: 'o',
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
        retain: 132,
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
        retain: 107,
      },
      {
        insert: '(',
      },
    ],
    [
      {
        retain: 108,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 109,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 110,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 111,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 112,
      },
      {
        insert: ')',
      },
    ],
    [
      {
        retain: 113,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 139,
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
        retain: 112,
      },
      {
        delete: 2,
      },
    ],
    [
      {
        retain: 108,
      },
      {
        delete: 4,
      },
    ],
    [
      {
        retain: 107,
      },
      {
        delete: 1,
      },
    ],
    [
      {
        retain: 132,
      },
      {
        retain: 1,
        attributes: {
          header: null,
          blockquote: true,
        },
      },
    ],
    [
      {
        retain: 92,
      },
      {
        insert: 'T',
      },
      {
        delete: 40,
      },
    ],
    [
      {
        retain: 93,
      },
      {
        insert: 'h',
      },
    ],
    [
      {
        retain: 94,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 95,
      },
      {
        insert: 's',
      },
    ],
    [
      {
        retain: 96,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 97,
      },
      {
        insert: 'i',
      },
    ],
    [
      {
        retain: 98,
      },
      {
        insert: 's',
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
        insert: 'a',
      },
    ],
    [
      {
        retain: 101,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 102,
      },
      {
        insert: 'b',
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
        insert: 'o',
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
        insert: 'k',
      },
    ],
    [
      {
        retain: 107,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 108,
      },
      {
        insert: 'q',
      },
    ],
    [
      {
        retain: 109,
      },
      {
        insert: 'u',
      },
    ],
    [
      {
        retain: 110,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 111,
      },
      {
        insert: 't',
      },
    ],
    [
      {
        retain: 112,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 113,
      },
      {
        insert: '.',
      },
    ],
    [
      {
        retain: 114,
      },
      {
        insert: '.',
      },
    ],
    [
      {
        retain: 115,
      },
      {
        insert: '.',
      },
    ],
    [
      {
        retain: 116,
      },
      {
        insert: '.',
      },
    ],
    [
      {
        retain: 119,
      },
      {
        delete: 8,
      },
    ],
    [
      {
        retain: 119,
      },
      {
        insert: 'H',
      },
    ],
    [
      {
        retain: 120,
      },
      {
        insert: 'e',
      },
    ],
    [
      {
        retain: 121,
      },
      {
        insert: 'l',
      },
    ],
    [
      {
        retain: 122,
      },
      {
        insert: 'l',
      },
    ],
    [
      {
        retain: 123,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 124,
      },
      {
        insert: ' ',
      },
    ],
    [
      {
        retain: 125,
      },
      {
        insert: 'w',
      },
    ],
    [
      {
        retain: 126,
      },
      {
        insert: 'o',
      },
    ],
    [
      {
        retain: 127,
      },
      {
        insert: 'r',
      },
    ],
    [
      {
        retain: 128,
      },
      {
        insert: 'l',
      },
    ],
    [
      {
        retain: 129,
      },
      {
        insert: 'd',
      },
    ],
    [
      {
        retain: 130,
      },
      {
        insert: '.',
      },
    ],
    [
      {
        retain: 131,
      },
      {
        insert: '!',
      },
    ],
    [
      {
        retain: 131,
      },
      {
        delete: 1,
      },
    ],
    [
      {
        retain: 130,
      },
      {
        delete: 1,
      },
    ],
    [
      {
        retain: 130,
      },
      {
        insert: '!',
      },
    ],
    [
      {
        retain: 131,
      },
      {
        insert: '\n',
      },
    ],
    [
      {
        retain: 10,
      },
      {
        retain: 11,
        attributes: {
          bold: true,
        },
      },
    ],
    [
      {
        retain: 27,
      },
      {
        retain: 13,
        attributes: {
          italic: true,
        },
      },
    ],
    [
      {
        retain: 40,
      },
      {
        attributes: {
          italic: true,
        },
        insert: 's',
      },
    ],
    [
      {
        retain: 40,
      },
      {
        delete: 1,
      },
    ],
    [
      {
        retain: 40,
      },
      {
        attributes: {
          italic: true,
        },
        insert: ' ',
      },
    ],
    [
      {
        retain: 41,
      },
      {
        attributes: {
          italic: true,
        },
        insert: '(',
      },
    ],
    [
      {
        retain: 42,
      },
      {
        attributes: {
          italic: true,
        },
        insert: 'w',
      },
    ],
    [
      {
        retain: 43,
      },
      {
        attributes: {
          italic: true,
        },
        insert: 'h',
      },
    ],
    [
      {
        retain: 44,
      },
      {
        attributes: {
          italic: true,
        },
        insert: 'a',
      },
    ],
    [
      {
        retain: 45,
      },
      {
        attributes: {
          italic: true,
        },
        insert: 't',
      },
    ],
    [
      {
        retain: 46,
      },
      {
        attributes: {
          italic: true,
        },
        insert: ' ',
      },
    ],
    [
      {
        retain: 47,
      },
      {
        attributes: {
          italic: true,
        },
        insert: 'i',
      },
    ],
    [
      {
        retain: 48,
      },
      {
        attributes: {
          italic: true,
        },
        insert: 's',
      },
    ],
    [
      {
        retain: 49,
      },
      {
        attributes: {
          italic: true,
        },
        insert: ' ',
      },
    ],
    [
      {
        retain: 50,
      },
      {
        attributes: {
          italic: true,
        },
        insert: 'q',
      },
    ],
    [
      {
        retain: 51,
      },
      {
        attributes: {
          italic: true,
        },
        insert: 'u',
      },
    ],
    [
      {
        retain: 52,
      },
      {
        attributes: {
          italic: true,
        },
        insert: 'i',
      },
    ],
    [
      {
        retain: 53,
      },
      {
        attributes: {
          italic: true,
        },
        insert: 'l',
      },
    ],
    [
      {
        retain: 54,
      },
      {
        attributes: {
          italic: true,
        },
        insert: 'l',
      },
    ],
    [
      {
        retain: 55,
      },
      {
        attributes: {
          italic: true,
        },
        insert: '?',
      },
    ],
    [
      {
        retain: 56,
      },
      {
        attributes: {
          italic: true,
        },
        insert: ')',
      },
    ],
    [
      {
        retain: 41,
      },
      {
        retain: 16,
        attributes: {
          italic: null,
        },
      },
    ],
    [
      {
        retain: 64,
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
        retain: 71,
      },
      {
        retain: 5,
        attributes: {
          italic: true,
        },
      },
    ],
    [
      {
        retain: 69,
      },
      {
        delete: 1,
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
        insert: 'T',
      },
    ],
    [
      {
        retain: 69,
      },
      {
        retain: 1,
        attributes: {
          bold: null,
        },
      },
    ],
    [
      {
        retain: 69,
      },
      {
        retain: 1,
        attributes: {
          italic: true,
        },
      },
    ],
    [
      {
        retain: 69,
      },
      {
        retain: 1,
        attributes: {
          italic: null,
        },
      },
    ],
    [
      {
        retain: 69,
      },
      {
        retain: 1,
        attributes: {
          bold: true,
        },
      },
    ],
    [
      {
        retain: 69,
      },
      {
        retain: 1,
        attributes: {
          bold: null,
        },
      },
    ],
  ],
};
