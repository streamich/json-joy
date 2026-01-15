import type {SlateTrace} from '../../tools/traces';

export const slateRangeDeletesTrace: SlateTrace = {
  start: [
    {
      type: 'paragraph',
      children: [
        {
          text: 'This is editable ',
        },
        {
          text: 'rich',
          bold: true,
        },
        {
          text: ' text, ',
        },
        {
          text: 'much',
          italic: true,
        },
        {
          text: ' better than a ',
        },
        {
          text: '<textarea>',
          code: true,
        },
        {
          text: '!',
        },
      ],
    },
    {
      type: 'paragraph',
      children: [
        {
          text: "Since it's rich text, you can do things like turn a selection of text ",
        },
        {
          text: 'bold',
          bold: true,
        },
        {
          text: ', or add a semantically rendered block quote in the middle of the page, like this:',
        },
      ],
    },
    {
      type: 'block-quote',
      children: [
        {
          text: 'A wise quote.',
        },
      ],
    },
    {
      type: 'paragraph',
      align: 'center',
      children: [
        {
          text: 'Try it out for yourself!',
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
          path: [1, 0],
          offset: 37,
        },
        focus: {
          path: [1, 0],
          offset: 37,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [1, 0],
          offset: 37,
        },
        focus: {
          path: [1, 0],
          offset: 37,
        },
      },
      newProperties: {
        anchor: {
          path: [1, 0],
          offset: 33,
        },
        focus: {
          path: [1, 0],
          offset: 39,
        },
      },
    },
    {
      type: 'remove_text',
      path: [1, 0],
      offset: 33,
      text: 'things',
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [1, 0],
          offset: 33,
        },
        focus: {
          path: [1, 0],
          offset: 33,
        },
      },
      newProperties: {
        anchor: {
          path: [1, 1],
          offset: 1,
        },
        focus: {
          path: [1, 1],
          offset: 1,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [1, 1],
          offset: 1,
        },
      },
      newProperties: {
        focus: {
          path: [1, 1],
          offset: 0,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [1, 1],
          offset: 0,
        },
      },
      newProperties: {
        focus: {
          path: [1, 0],
          offset: 56,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [1, 0],
          offset: 56,
        },
      },
      newProperties: {
        focus: {
          path: [1, 0],
          offset: 55,
        },
      },
    },
    {
      type: 'remove_text',
      path: [1, 0],
      offset: 55,
      text: ' of text ',
    },
    {
      type: 'remove_text',
      path: [1, 1],
      offset: 0,
      text: 'b',
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
          offset: 55,
        },
      },
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 55,
      text: ' ',
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [1, 0],
          offset: 56,
        },
        focus: {
          path: [1, 0],
          offset: 56,
        },
      },
      newProperties: {
        anchor: {
          path: [1, 0],
          offset: 55,
        },
        focus: {
          path: [1, 0],
          offset: 55,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [1, 0],
          offset: 55,
        },
        focus: {
          path: [1, 0],
          offset: 55,
        },
      },
      newProperties: {
        anchor: {
          path: [1, 0],
          offset: 54,
        },
        focus: {
          path: [1, 0],
          offset: 54,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [1, 0],
          offset: 54,
        },
        focus: {
          path: [1, 0],
          offset: 54,
        },
      },
      newProperties: {
        anchor: {
          path: [1, 0],
          offset: 53,
        },
        focus: {
          path: [1, 0],
          offset: 53,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [1, 0],
          offset: 53,
        },
        focus: {
          path: [1, 0],
          offset: 53,
        },
      },
      newProperties: {
        anchor: {
          path: [1, 0],
          offset: 52,
        },
        focus: {
          path: [1, 0],
          offset: 52,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [1, 0],
          offset: 52,
        },
        focus: {
          path: [1, 0],
          offset: 52,
        },
      },
      newProperties: {
        anchor: {
          path: [1, 0],
          offset: 51,
        },
        focus: {
          path: [1, 0],
          offset: 51,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [1, 0],
          offset: 51,
        },
        focus: {
          path: [1, 0],
          offset: 51,
        },
      },
      newProperties: {
        anchor: {
          path: [1, 0],
          offset: 50,
        },
        focus: {
          path: [1, 0],
          offset: 50,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [1, 0],
          offset: 50,
        },
        focus: {
          path: [1, 0],
          offset: 50,
        },
      },
      newProperties: {
        anchor: {
          path: [1, 0],
          offset: 35,
        },
        focus: {
          path: [1, 0],
          offset: 35,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [1, 0],
          offset: 35,
        },
        focus: {
          path: [1, 0],
          offset: 35,
        },
      },
      newProperties: {
        anchor: {
          path: [1, 0],
          offset: 34,
        },
        focus: {
          path: [1, 0],
          offset: 34,
        },
      },
    },
    {
      type: 'remove_text',
      path: [1, 0],
      offset: 33,
      text: ' ',
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [1, 0],
          offset: 33,
        },
        focus: {
          path: [1, 0],
          offset: 33,
        },
      },
      newProperties: {
        anchor: {
          path: [1, 2],
          offset: 5,
        },
        focus: {
          path: [1, 2],
          offset: 5,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [1, 2],
          offset: 5,
        },
      },
      newProperties: {
        focus: {
          path: [1, 2],
          offset: 4,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [1, 2],
          offset: 4,
        },
      },
      newProperties: {
        focus: {
          path: [1, 0],
          offset: 47,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [1, 0],
          offset: 47,
        },
      },
      newProperties: {
        focus: {
          path: [1, 0],
          offset: 46,
        },
      },
    },
    {
      type: 'remove_text',
      path: [1, 0],
      offset: 46,
      text: 'election ',
    },
    {
      type: 'remove_node',
      path: [1, 1],
      node: {
        text: 'old',
        bold: true,
      },
    },
    {
      type: 'remove_text',
      path: [1, 1],
      offset: 0,
      text: ', or ',
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
          offset: 46,
        },
      },
    },
    {
      type: 'merge_node',
      path: [1, 1],
      position: 46,
      properties: {},
    },
    {
      type: 'insert_text',
      path: [1, 0],
      offset: 46,
      text: ' ',
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [1, 0],
          offset: 47,
        },
        focus: {
          path: [1, 0],
          offset: 47,
        },
      },
      newProperties: {
        anchor: {
          path: [1, 0],
          offset: 46,
        },
        focus: {
          path: [1, 0],
          offset: 46,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [1, 0],
          offset: 46,
        },
      },
      newProperties: {
        focus: {
          path: [1, 0],
          offset: 45,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [1, 0],
          offset: 45,
        },
      },
      newProperties: {
        focus: {
          path: [1, 0],
          offset: 44,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [1, 0],
          offset: 44,
        },
      },
      newProperties: {
        focus: {
          path: [1, 0],
          offset: 43,
        },
      },
    },
    {
      type: 'remove_text',
      path: [1, 0],
      offset: 43,
      text: 'a s',
    },
    {
      type: 'remove_text',
      path: [1, 0],
      offset: 42,
      text: ' ',
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [1, 0],
          offset: 42,
        },
        focus: {
          path: [1, 0],
          offset: 42,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 5],
          offset: 5,
        },
        focus: {
          path: [0, 5],
          offset: 5,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [0, 5],
          offset: 5,
        },
      },
      newProperties: {
        focus: {
          path: [0, 5],
          offset: 3,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [0, 5],
          offset: 3,
        },
      },
      newProperties: {
        focus: {
          path: [0, 4],
          offset: 11,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [0, 4],
          offset: 11,
        },
      },
      newProperties: {
        focus: {
          path: [0, 4],
          offset: 10,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [0, 4],
          offset: 10,
        },
      },
      newProperties: {
        focus: {
          path: [0, 4],
          offset: 9,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [0, 4],
          offset: 9,
        },
      },
      newProperties: {
        focus: {
          path: [0, 4],
          offset: 8,
        },
      },
    },
    {
      type: 'remove_text',
      path: [0, 4],
      offset: 8,
      text: 'than a ',
    },
    {
      type: 'remove_text',
      path: [0, 5],
      offset: 0,
      text: '<text',
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 5],
          offset: 0,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 4],
          offset: 8,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 4],
          offset: 8,
        },
        focus: {
          path: [0, 4],
          offset: 8,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 4],
          offset: 7,
        },
        focus: {
          path: [0, 4],
          offset: 7,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 4],
          offset: 7,
        },
        focus: {
          path: [0, 4],
          offset: 7,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 4],
          offset: 6,
        },
        focus: {
          path: [0, 4],
          offset: 6,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [0, 4],
          offset: 6,
        },
      },
      newProperties: {
        focus: {
          path: [1, 0],
          offset: 40,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [1, 0],
          offset: 40,
        },
      },
      newProperties: {
        focus: {
          path: [1, 0],
          offset: 120,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [1, 0],
          offset: 120,
        },
      },
      newProperties: {
        focus: {
          path: [1, 0],
          offset: 119,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [1, 0],
          offset: 119,
        },
      },
      newProperties: {
        focus: {
          path: [1, 0],
          offset: 118,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [1, 0],
          offset: 118,
        },
      },
      newProperties: {
        focus: {
          path: [1, 0],
          offset: 115,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [1, 0],
          offset: 115,
        },
      },
      newProperties: {
        focus: {
          path: [1, 0],
          offset: 19,
        },
      },
    },
    {
      type: 'remove_text',
      path: [0, 4],
      offset: 6,
      text: 'r ',
    },
    {
      type: 'remove_node',
      path: [0, 6],
      node: {
        text: '!',
      },
    },
    {
      type: 'remove_node',
      path: [0, 5],
      node: {
        text: 'area>',
        code: true,
      },
    },
    {
      type: 'remove_text',
      path: [1, 0],
      offset: 0,
      text: "Since it's rich tex",
    },
    {
      type: 'merge_node',
      path: [1],
      position: 5,
      properties: {
        type: 'paragraph',
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [0, 5],
          offset: 0,
        },
      },
      newProperties: {
        focus: {
          path: [0, 4],
          offset: 6,
        },
      },
    },
    {
      type: 'merge_node',
      path: [0, 5],
      position: 6,
      properties: {},
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 4],
          offset: 6,
        },
        focus: {
          path: [0, 4],
          offset: 6,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 4],
          offset: 7,
        },
        focus: {
          path: [0, 4],
          offset: 7,
        },
      },
    },
    {
      type: 'remove_text',
      path: [0, 4],
      offset: 6,
      text: 't',
    },
    {
      type: 'insert_text',
      path: [0, 4],
      offset: 6,
      text: 'r',
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 4],
          offset: 7,
        },
        focus: {
          path: [0, 4],
          offset: 7,
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
        focus: {
          path: [0, 0],
          offset: 11,
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
      type: 'remove_text',
      path: [0, 0],
      offset: 0,
      text: 'This is edi',
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
          path: [0, 4],
          offset: 93,
        },
        focus: {
          path: [0, 4],
          offset: 93,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 4],
          offset: 93,
        },
        focus: {
          path: [0, 4],
          offset: 93,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 4],
          offset: 92,
        },
        focus: {
          path: [0, 4],
          offset: 92,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 4],
          offset: 92,
        },
        focus: {
          path: [0, 4],
          offset: 92,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 4],
          offset: 91,
        },
        focus: {
          path: [0, 4],
          offset: 91,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        anchor: {
          path: [0, 4],
          offset: 91,
        },
        focus: {
          path: [0, 4],
          offset: 91,
        },
      },
      newProperties: {
        anchor: {
          path: [0, 4],
          offset: 90,
        },
        focus: {
          path: [0, 4],
          offset: 90,
        },
      },
    },
    {
      type: 'set_selection',
      properties: {
        focus: {
          path: [0, 4],
          offset: 90,
        },
      },
      newProperties: {
        focus: {
          path: [0, 4],
          offset: 107,
        },
      },
    },
    {
      type: 'remove_text',
      path: [0, 4],
      offset: 90,
      text: ' page, like this:',
    },
  ],
  checkpoints: [3, 10, 11, 20, 29, 30, 35, 36, 45, 60, 62, 63, 66, 72],
};
