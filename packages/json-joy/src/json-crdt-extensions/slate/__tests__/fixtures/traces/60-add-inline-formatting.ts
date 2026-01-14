import type {SlateTrace} from '../traces';

export const slateAddInlineFormattingTrace: SlateTrace = {
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
      type: 'set_selection',
      properties: {
        focus: {
          path: [0, 0],
          offset: 3,
        },
      },
      newProperties: {
        focus: {
          path: [0, 0],
          offset: 0,
        },
      },
    },
    {
      type: 'set_node',
      path: [0, 0],
      properties: {},
      newProperties: {
        bold: true,
      },
    },
  ],
  checkpoints: [2, 3, 4, 6],
};
