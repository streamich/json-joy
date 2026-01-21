export type SlateElement = {
  type: string;
  level?: number;
  language?: string;
  children: Array<SlateElement | SlateText>;
};

export type SlateText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
};

export const slateInitialValue: SlateElement[] = [
  {
    type: 'heading',
    level: 1,
    children: [{text: 'Collaborative Rich-Text Editing'}],
  },
  {
    type: 'paragraph',
    children: [
      {text: 'This is a demonstration of '},
      {text: 'Slate.js', bold: true},
      {text: ' integrated with '},
      {text: 'json-joy', bold: true, italic: true},
      {text: ' JSON CRDTs for real-time collaborative editing.'},
    ],
  },
  {
    type: 'heading',
    level: 2,
    children: [{text: 'Text Formatting'}],
  },
  {
    type: 'paragraph',
    children: [
      {text: 'Try selecting text and using the toolbar or keyboard shortcuts:'},
    ],
  },
  {
    type: 'paragraph',
    children: [
      {text: '• '},
      {text: 'Bold', bold: true},
      {text: ' — Ctrl/Cmd+B'},
    ],
  },
  {
    type: 'paragraph',
    children: [
      {text: '• '},
      {text: 'Italic', italic: true},
      {text: ' — Ctrl/Cmd+I'},
    ],
  },
  {
    type: 'paragraph',
    children: [
      {text: '• '},
      {text: 'Underline', underline: true},
      {text: ' — Ctrl/Cmd+U'},
    ],
  },
  {
    type: 'paragraph',
    children: [
      {text: '• '},
      {text: 'Inline code', code: true},
      {text: ' — Ctrl/Cmd+`'},
    ],
  },
  {
    type: 'heading',
    level: 2,
    children: [{text: 'Block Elements'}],
  },
  {
    type: 'blockquote',
    children: [
      {
        type: 'paragraph',
        children: [
          {text: 'This is a blockquote. It can contain '},
          {text: 'formatted text', bold: true},
          {text: ' and even nested elements.'},
        ],
      },
      {
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: [{text: 'Blockquotes can be nested to show quoted replies or hierarchical content.'}],
          },
        ],
      },
    ],
  },
  {
    type: 'paragraph',
    children: [{text: 'Here is an example code block:'}],
  },
  {
    type: 'code-block',
    language: 'typescript',
    children: [
      {text: 'import {bind} from "@jsonjoy.com/collaborative-slate";\n'},
      {text: '\n'},
      {text: 'const editor = withReact(createEditor());\n'},
      {text: 'const unbind = bind(peritext, editor);\n'},
    ],
  },
  {
    type: 'paragraph',
    children: [{text: ''}],
  },
  {
    type: 'paragraph',
    children: [
      {text: 'You can combine formats: '},
      {text: 'bold and italic', bold: true, italic: true},
      {text: ' work together!'},
    ],
  },
];

// ============================================================================
// Plate.js format (uses 'p', 'h1', 'h2', 'blockquote', 'code_block', 'code_line')
// ============================================================================

export const plateInitialValue = [
  {
    type: 'h1',
    children: [{text: 'Welcome to Plate.js'}],
  },
  {
    type: 'p',
    children: [
      {text: 'This is a demonstration of '},
      {text: 'Plate.js', bold: true},
      {text: ' — a powerful plugin-based editor built on '},
      {text: 'Slate.js', bold: true},
      {text: ', integrated with '},
      {text: 'json-joy', bold: true, italic: true},
      {text: ' for collaborative editing.'},
    ],
  },
  {
    type: 'h2',
    children: [{text: 'Text Formatting'}],
  },
  {
    type: 'p',
    children: [
      {text: 'Use the toolbar or keyboard shortcuts:'},
    ],
  },
  {
    type: 'p',
    children: [
      {text: '• '},
      {text: 'Bold', bold: true},
      {text: ' — Ctrl/Cmd+B'},
    ],
  },
  {
    type: 'p',
    children: [
      {text: '• '},
      {text: 'Italic', italic: true},
      {text: ' — Ctrl/Cmd+I'},
    ],
  },
  {
    type: 'p',
    children: [
      {text: '• '},
      {text: 'Underline', underline: true},
      {text: ' — Ctrl/Cmd+U'},
    ],
  },
  {
    type: 'p',
    children: [
      {text: '• '},
      {text: 'Inline code', code: true},
      {text: ' — Ctrl/Cmd+`'},
    ],
  },
  {
    type: 'h2',
    children: [{text: 'Block Elements'}],
  },
  {
    type: 'blockquote',
    children: [
      {
        type: 'p',
        children: [
          {text: 'This is a blockquote. It can contain '},
          {text: 'formatted text', bold: true},
          {text: ' and nested elements.'},
        ],
      },
      {
        type: 'blockquote',
        children: [
          {
            type: 'p',
            children: [{text: 'Nested blockquotes show quoted replies or hierarchical content.'}],
          },
        ],
      },
    ],
  },
  {
    type: 'p',
    children: [{text: 'Here is an example code block:'}],
  },
  {
    type: 'code_block',
    lang: 'typescript',
    children: [
      {type: 'code_line', children: [{text: 'import {bind} from "@jsonjoy.com/collaborative-slate";'}]},
      {type: 'code_line', children: [{text: ''}]},
      {type: 'code_line', children: [{text: 'const editor = usePlateEditor({value: initialValue});'}]},
      {type: 'code_line', children: [{text: 'const unbind = bind(peritext, editor);'}]},
    ],
  },
  {
    type: 'p',
    children: [{text: ''}],
  },
  {
    type: 'p',
    children: [
      {text: 'Combine formats: '},
      {text: 'bold and italic', bold: true, italic: true},
      {text: ' work together!'},
    ],
  },
];
