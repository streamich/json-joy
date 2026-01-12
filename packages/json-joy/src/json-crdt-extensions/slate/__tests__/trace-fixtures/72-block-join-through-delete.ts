import type {SlateTrace} from '../traces';

export const slateBlockJoinThroughDeleteTrace: SlateTrace = {
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
      text: 'b',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 1,
      text: 'l',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 2,
      text: 'o',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 3,
      text: 'c',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 4,
      text: 'k',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 5,
      text: ' ',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 6,
      text: '1',
    },
    {
      type: 'split_node',
      path: [0, 0],
      position: 7,
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
      text: 'b',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 1,
      text: 'l',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 2,
      text: 'o',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 3,
      text: 'c',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 4,
      text: 'k',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 5,
      text: ' ',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 6,
      text: '2',
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [1, 0],
          offset: 7,
        },
        focus: {
          path: [1, 0],
          offset: 7,
        },
      },
      newProperties: {
        anchor: {
          path: [1, 0],
          offset: 6,
        },
        focus: {
          path: [1, 0],
          offset: 6,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [1, 0],
          offset: 6,
        },
        focus: {
          path: [1, 0],
          offset: 6,
        },
      },
      newProperties: {
        anchor: {
          path: [1, 0],
          offset: 5,
        },
        focus: {
          path: [1, 0],
          offset: 5,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [1, 0],
          offset: 5,
        },
      },
      newProperties: {
        focus: {
          path: [1, 0],
          offset: 0,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [1, 0],
          offset: 0,
        },
      },
      newProperties: {
        focus: {
          path: [0, 0],
          offset: 7,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [0, 0],
          offset: 7,
        },
      },
      newProperties: {
        focus: {
          path: [0, 0],
          offset: 6,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [0, 0],
          offset: 6,
        },
      },
      newProperties: {
        focus: {
          path: [0, 0],
          offset: 5,
        },
      },
    },
    {
      type: 'remove_text',
      path: [0, 0],
      offset: 5,
      text: ' 1',
    },
    {
      type: 'remove_text',
      path: [1, 0],
      offset: 0,
      text: 'block',
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
      },
      newProperties: {
        anchor: {
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
  ],
  checkpoints: [2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 28],
};
