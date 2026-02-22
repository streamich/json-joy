import type {SlateTrace} from '../../tools/traces';

export const slateBlockAttributesTrace: SlateTrace = {
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
      text: 'B',
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
      text: 'B',
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
      type: 'split_node',
      path: [1, 0],
      position: 7,
      properties: {},
    },
    {
      type: 'split_node',
      path: [1],
      position: 1,
      properties: {
        type: 'paragraph',
      },
    },
    {
      type: 'split_node',
      path: [2, 0],
      position: 0,
      properties: {},
    },
    {
      type: 'split_node',
      path: [2],
      position: 1,
      properties: {
        type: 'paragraph',
      },
    },
    {
      type: 'remove_node',
      path: [2],
      node: {
        type: 'paragraph',
        children: [
          {
            text: '',
          },
        ],
      },
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 0,
      text: 'B',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 1,
      text: 'l',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 2,
      text: 'o',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 3,
      text: 'c',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 4,
      text: 'k',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 5,
      text: ' ',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 6,
      text: '3',
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [2, 0],
          offset: 7,
        },
        focus: {
          path: [2, 0],
          offset: 7,
        },
      },
      newProperties: {
        anchor: {
          path: [1, 0],
          offset: 7,
        },
        focus: {
          path: [1, 0],
          offset: 7,
        },
      },
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
          offset: 0,
        },
        focus: {
          path: [0, 0],
          offset: 0,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 0],
          offset: 0,
        },
        focus: {
          path: [0, 0],
          offset: 0,
        },
      },
      newProperties: {
        anchor: {
          path: [1, 0],
          offset: 7,
        },
        focus: {
          path: [1, 0],
          offset: 7,
        },
      },
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
        focus: {
          path: [0, 0],
          offset: 7,
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
      path: [0],
      properties: {
        type: 'paragraph',
      },
      newProperties: {
        type: 'block-quote',
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
          offset: 0,
        },
      },
      newProperties: {
        anchor: {
          path: [1, 0],
          offset: 7,
        },
        focus: {
          path: [1, 0],
          offset: 7,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [1, 0],
          offset: 7,
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
      type: 'set_node',
      path: [1],
      properties: {
        type: 'paragraph',
      },
      newProperties: {
        type: 'heading-two',
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
          path: [1, 0],
          offset: 7,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [1, 0],
          offset: 7,
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
        anchor: {
          path: [1, 0],
          offset: 7,
        },
        focus: {
          path: [1, 0],
          offset: 0,
        },
      },
      newProperties: {
        anchor: {
          path: [1, 0],
          offset: 0,
        },
        focus: {
          path: [1, 0],
          offset: 7,
        },
      },
    },
    {
      type: 'remove_text',
      path: [1, 0],
      offset: 0,
      text: 'Block 2',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 0,
      text: 'T',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 1,
      text: 'h',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 2,
      text: 'i',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 3,
      text: 's',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 4,
      text: ' ',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 5,
      text: 'i',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 6,
      text: 's',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 7,
      text: ' ',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 8,
      text: 't',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 9,
      text: 'i',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 10,
      text: 't',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 11,
      text: 'l',
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 12,
      text: 'e',
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [1, 0],
          offset: 13,
        },
        focus: {
          path: [1, 0],
          offset: 13,
        },
      },
      newProperties: {
        anchor: {
          path: [2, 0],
          offset: 7,
        },
        focus: {
          path: [2, 0],
          offset: 7,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [2, 0],
          offset: 7,
        },
      },
      newProperties: {
        focus: {
          path: [2, 0],
          offset: 0,
        },
      },
    },
    {
      type: 'set_node',
      path: [2],
      properties: {},
      newProperties: {
        align: 'center',
      },
    },
    {
      type: 'set_node',
      path: [2],
      properties: {
        align: 'center',
      },
      newProperties: {
        align: 'right',
      },
    },
    {
      type: 'set_node',
      path: [2],
      properties: {
        align: 'right',
      },
      newProperties: {
        align: 'center',
      },
    },
    {
      type: 'set_node',
      path: [2],
      properties: {
        align: 'center',
      },
      newProperties: {
        align: 'left',
      },
    },
    {
      type: 'set_node',
      path: [2],
      properties: {
        align: 'left',
      },
      newProperties: {
        align: 'justify',
      },
    },
    {
      type: 'set_node',
      path: [2],
      properties: {
        align: 'justify',
      },
      newProperties: {
        align: 'left',
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [2, 0],
          offset: 0,
        },
      },
      newProperties: {
        focus: {
          path: [2, 0],
          offset: 7,
        },
      },
    },
    {
      type: 'set_node',
      path: [2],
      properties: {
        type: 'paragraph',
      },
      newProperties: {
        type: 'list-item',
      },
    },
    {
      type: 'insert_node',
      path: [3],
      node: {
        type: 'numbered-list',
        children: [],
      },
    },
    {
      type: 'move_node',
      path: [2],
      newPath: [3, 0],
    },
    {
      type: 'move_node',
      path: [2, 0],
      newPath: [3],
    },
    {
      type: 'remove_node',
      path: [2],
      node: {
        type: 'numbered-list',
        children: [],
      },
    },
    {
      type: 'insert_node',
      path: [3],
      node: {
        type: 'bulleted-list',
        children: [],
      },
    },
    {
      type: 'move_node',
      path: [2],
      newPath: [3, 0],
    },
    {
      type: 'move_node',
      path: [2, 0],
      newPath: [3],
    },
    {
      type: 'remove_node',
      path: [2],
      node: {
        type: 'bulleted-list',
        children: [],
      },
    },
    {
      type: 'insert_node',
      path: [3],
      node: {
        type: 'numbered-list',
        children: [],
      },
    },
    {
      type: 'move_node',
      path: [2],
      newPath: [3, 0],
    },
    {
      type: 'move_node',
      path: [2, 0],
      newPath: [3],
    },
    {
      type: 'remove_node',
      path: [2],
      node: {
        type: 'numbered-list',
        children: [],
      },
    },
    {
      type: 'set_node',
      path: [2],
      properties: {
        type: 'list-item',
      },
      newProperties: {
        type: 'paragraph',
      },
    },
    {
      type: 'set_node',
      path: [2],
      properties: {
        align: 'left',
      },
      newProperties: {},
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [2, 0],
          offset: 7,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 0],
          offset: 0,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 0],
          offset: 0,
        },
      },
      newProperties: {
        anchor: {
          path: [2, 0],
          offset: 7,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [2, 0],
          offset: 7,
        },
      },
      newProperties: {
        focus: {
          path: [2, 0],
          offset: 0,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [2, 0],
          offset: 7,
        },
        focus: {
          path: [2, 0],
          offset: 0,
        },
      },
      newProperties: {
        anchor: {
          path: [2, 0],
          offset: 0,
        },
        focus: {
          path: [2, 0],
          offset: 7,
        },
      },
    },
    {
      type: 'remove_text',
      path: [2, 0],
      offset: 0,
      text: 'Block 3',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 0,
      text: 'T',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 1,
      text: 'h',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 2,
      text: 'i',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 3,
      text: 's',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 4,
      text: ' ',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 5,
      text: 'i',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 6,
      text: 's',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 7,
      text: ' ',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 8,
      text: 'p',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 9,
      text: 'l',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 10,
      text: 'a',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 11,
      text: 'i',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 12,
      text: 'n',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 13,
      text: ' ',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 14,
      text: 'p',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 15,
      text: 'a',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 16,
      text: 'r',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 17,
      text: 'a',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 18,
      text: 'g',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 19,
      text: 'r',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 20,
      text: 'a',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 21,
      text: 'p',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 22,
      text: 'h',
    },
    {
      type: 'insert_text',
      path: [2, 0],
      offset: 23,
      text: '.',
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [2, 0],
          offset: 24,
        },
        focus: {
          path: [2, 0],
          offset: 24,
        },
      },
      newProperties: {
        anchor: {
          path: [1, 0],
          offset: 13,
        },
        focus: {
          path: [1, 0],
          offset: 13,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [1, 0],
          offset: 13,
        },
        focus: {
          path: [1, 0],
          offset: 13,
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
          offset: 0,
        },
        focus: {
          path: [0, 0],
          offset: 0,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [0, 0],
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
      type: 'remove_text',
      path: [0, 0],
      offset: 0,
      text: 'Block 1',
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
      text: 'o',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 2,
      text: ' ',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 3,
      text: 'b',
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
      text: ' ',
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
      text: 'r',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 8,
      text: ' ',
    },
    {
      type: 'remove_text',
      path: [0, 0],
      offset: 8,
      text: ' ',
    },
    {
      type: 'remove_text',
      path: [0, 0],
      offset: 7,
      text: 'r',
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
      text: ' ',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 5,
      text: ',',
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
      text: 'o',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 8,
      text: 't',
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
      text: 'n',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 11,
      text: 'o',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 12,
      text: 't',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 13,
      text: ' ',
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
      text: 'o',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 16,
      text: ' ',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 17,
      text: 'b',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 18,
      text: 'e',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 19,
      text: '.',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 20,
      text: '.',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 21,
      text: '.',
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 0],
          offset: 22,
        },
        focus: {
          path: [0, 0],
          offset: 22,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 0],
          offset: 17,
        },
        focus: {
          path: [0, 0],
          offset: 17,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 0],
          offset: 17,
        },
        focus: {
          path: [0, 0],
          offset: 17,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 0],
          offset: 14,
        },
        focus: {
          path: [0, 0],
          offset: 14,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 0],
          offset: 14,
        },
        focus: {
          path: [0, 0],
          offset: 14,
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
      text: 't',
    },
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 8,
      text: 'r',
    },
  ],
  checkpoints: [
    2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29, 36, 39, 44, 45, 46, 47,
    48, 49, 50, 51, 52, 53, 54, 55, 56, 59, 60, 61, 62, 63, 64, 66, 68, 70, 72, 74, 76, 78, 79, 80, 86, 87, 88, 89, 90,
    91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 115, 116, 117, 118, 119, 120,
    121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143,
    144, 149, 150,
  ],
};
