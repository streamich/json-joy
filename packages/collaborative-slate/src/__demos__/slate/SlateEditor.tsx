import * as React from 'react';
import {useCallback, useMemo, useState} from 'react';
import {createEditor, Descendant, Editor, Transforms, Text, BaseEditor} from 'slate';
import {Slate, Editable, withReact, RenderLeafProps, RenderElementProps, ReactEditor} from 'slate-react';
import {bind} from '../../index';

// Custom types for the editor
type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
};

type ParagraphElement = {
  type: 'paragraph';
  children: CustomText[];
};

type HeadingElement = {
  type: 'heading';
  level: 1 | 2 | 3;
  children: CustomText[];
};

type CustomElement = ParagraphElement | HeadingElement;

// Extend Slate's types
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

type MarkFormat = 'bold' | 'italic' | 'underline' | 'code';

// Check if a mark is active
const isMarkActive = (editor: Editor, format: MarkFormat): boolean => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

// Toggle a mark on/off
const toggleMark = (editor: Editor, format: MarkFormat): void => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

// Renders formatted text (bold, italic, underline, code)
const Leaf: React.FC<RenderLeafProps> = ({attributes, children, leaf}) => {
  if ((leaf as CustomText).bold) {
    children = <strong>{children}</strong>;
  }
  if ((leaf as CustomText).italic) {
    children = <em>{children}</em>;
  }
  if ((leaf as CustomText).underline) {
    children = <u>{children}</u>;
  }
  if ((leaf as CustomText).code) {
    children = (
      <code
        style={{
          backgroundColor: '#f4f4f4',
          padding: '2px 4px',
          borderRadius: '3px',
          fontFamily: 'monospace',
        }}
      >
        {children}
      </code>
    );
  }
  return <span {...attributes}>{children}</span>;
};

// Renders block-level elements
const Element: React.FC<RenderElementProps> = ({attributes, children, element}) => {
  switch ((element as CustomElement).type) {
    case 'heading': {
      const HeadingTag = `h${(element as HeadingElement).level}` as 'h1' | 'h2' | 'h3';
      return <HeadingTag {...attributes}>{children}</HeadingTag>;
    }
    case 'paragraph':
    default:
      return <p {...attributes}>{children}</p>;
  }
};

// Toolbar button component
interface MarkButtonProps {
  format: MarkFormat;
  label: string;
  editor: Editor;
  style?: React.CSSProperties;
}

const MarkButton: React.FC<MarkButtonProps> = ({format, label, editor, style}) => {
  const [, forceUpdate] = useState({});
  const isActive = isMarkActive(editor, format);

  return (
    <button
      style={{
        padding: '6px 12px',
        marginRight: '4px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        background: isActive ? '#333' : 'white',
        color: isActive ? 'white' : '#333',
        cursor: 'pointer',
        fontWeight: format === 'bold' ? 'bold' : 'normal',
        fontStyle: format === 'italic' ? 'italic' : 'normal',
        textDecoration: format === 'underline' ? 'underline' : 'none',
        fontFamily: format === 'code' ? 'monospace' : 'inherit',
        ...style,
      }}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
        forceUpdate({});
      }}
    >
      {label}
    </button>
  );
};

// Initial document content
const initialValue: Descendant[] = [
  {
    type: 'heading',
    level: 1,
    children: [{text: 'Collaborative Rich-Text Editing'}],
  } as HeadingElement,
  {
    type: 'paragraph',
    children: [{text: 'This is a demonstration of Slate.js integrated with '}],
  },
  {
    type: 'paragraph',
    children: [
      {text: 'Try selecting some text and using the toolbar or keyboard shortcuts:'},
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
      {text: 'Code', code: true},
      {text: ' — Ctrl/Cmd+`'},
    ],
  },
  {
    type: 'paragraph',
    children: [{text: ''}],
  },
  {
    type: 'paragraph',
    children: [
      {text: 'You can also combine formats: '},
      {text: 'bold and italic', bold: true, italic: true},
      {text: ' work together!'},
    ],
  },
];

export const SlateEditor: React.FC = () => {
  // Create editor instance (memoized to persist across renders)
  const editor = useMemo(() => withReact(createEditor()), []);

  // Force re-render for toolbar state
  const [, forceUpdate] = useState({});

  // Connect to json-joy peritext (mock for now)
  React.useEffect(() => {
    // In the future, this will be a real peritext node from json-joy
    const mockPeritextNode = {};
    const unbind = bind(mockPeritextNode, editor);
    return unbind;
  }, [editor]);

  // Memoized render functions
  const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, []);
  const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!event.ctrlKey && !event.metaKey) return;

      switch (event.key) {
        case 'b': {
          event.preventDefault();
          toggleMark(editor, 'bold');
          forceUpdate({});
          break;
        }
        case 'i': {
          event.preventDefault();
          toggleMark(editor, 'italic');
          forceUpdate({});
          break;
        }
        case 'u': {
          event.preventDefault();
          toggleMark(editor, 'underline');
          forceUpdate({});
          break;
        }
        case '`': {
          event.preventDefault();
          toggleMark(editor, 'code');
          forceUpdate({});
          break;
        }
      }
    },
    [editor]
  );

  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <Slate editor={editor} initialValue={initialValue} onSelectionChange={() => forceUpdate({})}>
        {/* Toolbar */}
        <div
          style={{
            borderBottom: '1px solid #ccc',
            padding: '8px',
            background: '#f9f9f9',
          }}
        >
          <MarkButton format="bold" label="B" editor={editor} />
          <MarkButton format="italic" label="I" editor={editor} />
          <MarkButton format="underline" label="U" editor={editor} />
          <MarkButton format="code" label="</>" editor={editor} />
        </div>

        {/* Editable Area */}
        <Editable
          style={{
            padding: '16px',
            minHeight: '300px',
            fontSize: '16px',
            lineHeight: '1.6',
            outline: 'none',
          }}
          renderLeaf={renderLeaf}
          renderElement={renderElement}
          onKeyDown={handleKeyDown}
          placeholder="Start typing..."
          spellCheck
          autoFocus
        />
      </Slate>
    </div>
  );
};
