import type {SlateTrace} from '../traces';

export const slateBlockJoinTrace: SlateTrace = {
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
      text: ' ',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 4,
      text: '1',
    },
    {
      type: 'split_node',
      path: [0, 0],
      position: 5,
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
      text: ' ',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 4,
      text: '2',
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [1, 0],
          offset: 5,
        },
        focus: {
          path: [1, 0],
          offset: 5,
        },
      },
      newProperties: {
        anchor: {
          path: [1, 0],
          offset: 0,
        },
        focus: {
          path: [1, 0],
          offset: 0,
        },
      },
    },
    {
      type: 'merge_node',
      path: [1],
      position: 1,
      properties: {
        type: 'paragraph',
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 1],
          offset: 0,
        },
        focus: {
          path: [0, 1],
          offset: 0,
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
      type: 'merge_node',
      path: [0, 1],
      position: 5,
      properties: {},
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 5,
      text: ' ',
    },
  ],
  checkpoints: [2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 17, 18],
};
