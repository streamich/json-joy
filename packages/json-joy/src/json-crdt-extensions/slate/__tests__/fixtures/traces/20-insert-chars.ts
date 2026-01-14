import type {SlateTrace} from '../traces';

export const slateInsertCharsTrace: SlateTrace = {
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
      text: 'e',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 1,
      text: 'o',
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
          offset: 1,
        },
        focus: {
          path: [0, 0],
          offset: 1,
        },
      },
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
      text: 'l',
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
      text: 'H',
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 0],
          offset: 1,
        },
        focus: {
          path: [0, 0],
          offset: 1,
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
      type: 'insert_text',
      path: [0, 0],
      offset: 5,
      text: '!',
    },
  ],
  checkpoints: [2, 3, 5, 6, 8, 10],
};
