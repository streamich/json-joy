import type {SlateTrace} from '../../tools/traces';

export const slateDeleteCharsTrace: SlateTrace = {
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
      text: 'T',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 1,
      text: 'H',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 2,
      text: 'i',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 3,
      text: 'a',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 4,
      text: 'd',
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
      text: 'o',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 7,
      text: ' ',
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
      text: 's',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 10,
      text: ' ',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 11,
      text: 'T',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 12,
      text: 'e',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 13,
      text: 's',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 14,
      text: 't',
    },
    {
      type: 'remove_text',
      path: [0, 0],
      offset: 14,
      text: 't',
    },
    {
      type: 'remove_text',
      path: [0, 0],
      offset: 13,
      text: 's',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 13,
      text: 'x',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 14,
      text: 't',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 15,
      text: '.',
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 0],
          offset: 16,
        },
        focus: {
          path: [0, 0],
          offset: 16,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 0],
          offset: 11,
        },
        focus: {
          path: [0, 0],
          offset: 11,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 0],
          offset: 11,
        },
        focus: {
          path: [0, 0],
          offset: 11,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 0],
          offset: 8,
        },
        focus: {
          path: [0, 0],
          offset: 8,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 0],
          offset: 8,
        },
        focus: {
          path: [0, 0],
          offset: 8,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 0],
          offset: 7,
        },
        focus: {
          path: [0, 0],
          offset: 7,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 0],
          offset: 7,
        },
        focus: {
          path: [0, 0],
          offset: 7,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 0],
          offset: 6,
        },
        focus: {
          path: [0, 0],
          offset: 6,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 0],
          offset: 6,
        },
        focus: {
          path: [0, 0],
          offset: 6,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 0],
          offset: 5,
        },
        focus: {
          path: [0, 0],
          offset: 5,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 0],
          offset: 5,
        },
        focus: {
          path: [0, 0],
          offset: 5,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 0],
          offset: 4,
        },
        focus: {
          path: [0, 0],
          offset: 4,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 0],
          offset: 4,
        },
        focus: {
          path: [0, 0],
          offset: 4,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 0],
          offset: 3,
        },
        focus: {
          path: [0, 0],
          offset: 3,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 0],
          offset: 3,
        },
        focus: {
          path: [0, 0],
          offset: 3,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 0],
          offset: 2,
        },
        focus: {
          path: [0, 0],
          offset: 2,
        },
      },
    },
    {
      type: 'remove_text',
      path: [0, 0],
      offset: 1,
      text: 'H',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 1,
      text: 'h',
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 0],
          offset: 2,
        },
        focus: {
          path: [0, 0],
          offset: 2,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 0],
          offset: 3,
        },
        focus: {
          path: [0, 0],
          offset: 3,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 0],
          offset: 3,
        },
        focus: {
          path: [0, 0],
          offset: 3,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 0],
          offset: 4,
        },
        focus: {
          path: [0, 0],
          offset: 4,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 0],
          offset: 4,
        },
        focus: {
          path: [0, 0],
          offset: 4,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 0],
          offset: 5,
        },
        focus: {
          path: [0, 0],
          offset: 5,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 0],
          offset: 5,
        },
        focus: {
          path: [0, 0],
          offset: 5,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 0],
          offset: 6,
        },
        focus: {
          path: [0, 0],
          offset: 6,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 0],
          offset: 6,
        },
        focus: {
          path: [0, 0],
          offset: 6,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 0],
          offset: 7,
        },
        focus: {
          path: [0, 0],
          offset: 7,
        },
      },
    },
    {
      type: 'remove_text',
      path: [0, 0],
      offset: 6,
      text: 'o',
    },
    {
      type: 'remove_text',
      path: [0, 0],
      offset: 5,
      text: 'f',
    },
    {
      type: 'remove_text',
      path: [0, 0],
      offset: 4,
      text: 'd',
    },
    {
      type: 'remove_text',
      path: [0, 0],
      offset: 3,
      text: 'a',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 3,
      text: 's',
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 0],
          offset: 4,
        },
        focus: {
          path: [0, 0],
          offset: 4,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 0],
          offset: 13,
        },
        focus: {
          path: [0, 0],
          offset: 13,
        },
      },
    },
    {
      type: 'remove_text',
      path: [0, 0],
      offset: 12,
      text: '.',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 12,
      text: '!',
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 0],
          offset: 13,
        },
        focus: {
          path: [0, 0],
          offset: 13,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 0],
          offset: 12,
        },
        focus: {
          path: [0, 0],
          offset: 12,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 0],
          offset: 12,
        },
        focus: {
          path: [0, 0],
          offset: 12,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 0],
          offset: 11,
        },
        focus: {
          path: [0, 0],
          offset: 11,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 0],
          offset: 11,
        },
        focus: {
          path: [0, 0],
          offset: 11,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 0],
          offset: 10,
        },
        focus: {
          path: [0, 0],
          offset: 10,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 0],
          offset: 10,
        },
        focus: {
          path: [0, 0],
          offset: 10,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 0],
          offset: 9,
        },
        focus: {
          path: [0, 0],
          offset: 9,
        },
      },
    },
    {
      type: 'remove_text',
      path: [0, 0],
      offset: 8,
      text: 'T',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 8,
      text: 't',
    },
  ],
  checkpoints: [
    2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 30, 31, 37, 38, 39, 40, 41, 43, 44, 49, 50,
  ],
};
