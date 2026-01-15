import type {SlateTrace} from '../../tools/traces';

export const slateCrossBlockInlineFormattingTrace: SlateTrace = {
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
      text: 'p',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 1,
      text: 'a',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 2,
      text: 'r',
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
      text: 'g',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 5,
      text: 'r',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 6,
      text: 'a',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 7,
      text: 'p',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 8,
      text: 'h',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 9,
      text: ' ',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 10,
      text: '1',
    },
    {
      type: 'split_node',
      path: [0, 0],
      position: 11,
      properties: {},
    },
    {
      type: 'split_node',
      path: [0],
      position: 1,
      properties: {
        type: 'paragraph',
      },
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 0,
      text: 'p',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 1,
      text: 'a',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 2,
      text: 'r',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 3,
      text: 'a',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 4,
      text: 'g',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 5,
      text: 'r',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 6,
      text: 'a',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 7,
      text: 'p',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 8,
      text: 'h',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 9,
      text: ' ',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 10,
      text: '2',
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [1, 0],
          offset: 11,
        },
        focus: {
          path: [1, 0],
          offset: 11,
        },
      },
      newProperties: {
        anchor: {
          path: [1, 0],
          offset: 10,
        },
        focus: {
          path: [1, 0],
          offset: 10,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [1, 0],
          offset: 10,
        },
        focus: {
          path: [1, 0],
          offset: 10,
        },
      },
      newProperties: {
        anchor: {
          path: [1, 0],
          offset: 9,
        },
        focus: {
          path: [1, 0],
          offset: 9,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [1, 0],
          offset: 9,
        },
      },
      newProperties: {
        focus: {
          path: [0, 0],
          offset: 9,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [0, 0],
          offset: 9,
        },
      },
      newProperties: {
        focus: {
          path: [0, 0],
          offset: 10,
        },
      },
    },
    {
      type: 'split_node',
      path: [1, 0],
      position: 9,
      properties: {},
    },
    {
      type: 'split_node',
      path: [0, 0],
      position: 10,
      properties: {},
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [1, 1],
          offset: 0,
        },
      },
      newProperties: {
        anchor: {
          path: [1, 0],
          offset: 9,
        },
      },
    },
    {
      type: 'set_node',
      path: [0, 1],
      properties: {},
      newProperties: {
        bold: true,
      },
    },
    {
      type: 'set_node',
      path: [1, 0],
      properties: {},
      newProperties: {
        bold: true,
      },
    },
    {
      type: 'set_node',
      path: [0, 1],
      properties: {
        bold: true,
      },
      newProperties: {},
    },
    {
      type: 'set_node',
      path: [1, 0],
      properties: {
        bold: true,
      },
      newProperties: {},
    },
    {
      type: 'merge_node',
      path: [1, 1],
      position: 9,
      properties: {},
    },
    {
      type: 'merge_node',
      path: [0, 1],
      position: 10,
      properties: {},
    },
    {
      type: 'split_node',
      path: [1, 0],
      position: 9,
      properties: {},
    },
    {
      type: 'split_node',
      path: [0, 0],
      position: 10,
      properties: {},
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [1, 1],
          offset: 0,
        },
      },
      newProperties: {
        anchor: {
          path: [1, 0],
          offset: 9,
        },
      },
    },
    {
      type: 'set_node',
      path: [0, 1],
      properties: {},
      newProperties: {
        italic: true,
      },
    },
    {
      type: 'set_node',
      path: [1, 0],
      properties: {},
      newProperties: {
        italic: true,
      },
    },
  ],
  checkpoints: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 34, 38, 43],
};
