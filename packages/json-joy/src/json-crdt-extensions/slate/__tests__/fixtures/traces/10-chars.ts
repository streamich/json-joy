import type {SlateTrace} from '../../tools/traces';

export const slateEnterCharsTrace: SlateTrace = {
  start: [
    {
      type: 'paragraph',
      children: [
        {
          text: '',
        },
      ],
    },
  ],
  operations: [
    {
      type: 'set_selection',
      properties: null,
      newProperties: {
        anchor: {
          path: [0, 0],
          offset: 0,
        },
        focus: {
          path: [0, 0],
          offset: 0,
        },
      },
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 0,
      text: 'a',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 1,
      text: 'b',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 2,
      text: 'c',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 3,
      text: 'd',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 4,
      text: 'e',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 5,
      text: 'f',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 6,
      text: 'g',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 7,
      text: 'h',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 8,
      text: 'i',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 9,
      text: 'j',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 10,
      text: 'k',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 11,
      text: 'l',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 12,
      text: 'm',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 13,
      text: 'n',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 14,
      text: 'o',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 15,
      text: 'p',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 16,
      text: 'q',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 17,
      text: 'r',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 18,
      text: 's',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 19,
      text: 't',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 20,
      text: 'u',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 21,
      text: 'v',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 22,
      text: 'w',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 23,
      text: 'x',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 24,
      text: 'y',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 25,
      text: 'z',
    },
  ],
  checkpoints: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
};
