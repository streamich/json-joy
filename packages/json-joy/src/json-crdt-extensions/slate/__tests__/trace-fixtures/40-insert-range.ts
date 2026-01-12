import type {SlateTrace} from '../traces';

export const slateInsertRangeTrace: SlateTrace = {
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
      text: 'I',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 1,
      text: 'n',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 2,
      text: 's',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 3,
      text: 'e',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 4,
      text: 'r',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 5,
      text: 't',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 6,
      text: ' ',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 7,
      text: 't',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 8,
      text: 'e',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 9,
      text: 'x',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 10,
      text: 't',
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
          offset: 6,
        },
        focus: {
          path: [0, 0],
          offset: 6,
        },
      },
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 6,
      text: ' ',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 7,
      text: 'richtext',
    },
  ],
  checkpoints: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15],
};
