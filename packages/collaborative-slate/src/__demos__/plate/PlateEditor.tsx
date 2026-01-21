import * as React from 'react';
import {useEffect, useCallback} from 'react';
import {
  Plate,
  PlateContent,
  usePlateEditor,
} from '@udecode/plate/react';
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  CodePlugin,
} from '@udecode/plate-basic-marks/react';
import {ParagraphPlugin} from '@udecode/plate/react';
import {HeadingPlugin} from '@udecode/plate-heading/react';
import {Editor} from 'slate';
import {bind} from '../../index';

// Custom leaf component for marks (bold, italic, underline, code)
const RichLeaf = ({attributes, children, leaf}: any) => {
  let content = children;

  if (leaf.bold) {
    content = <strong>{content}</strong>;
  }
  if (leaf.italic) {
    content = <em>{content}</em>;
  }
  if (leaf.underline) {
    content = <u>{content}</u>;
  }
  if (leaf.code) {
    content = (
      <code
        style={{
          backgroundColor: '#f4f4f4',
          padding: '2px 4px',
          borderRadius: '3px',
          fontFamily: 'monospace',
        }}
      >
        {content}
      </code>
    );
  }

  return <span {...attributes}>{content}</span>;
};

// Custom paragraph element
const ParagraphElement = ({attributes, children}: any) => {
  return (
    <p {...attributes} style={{margin: '0 0 8px 0'}}>
      {children}
    </p>
  );
};

// Custom heading elements
const HeadingElement = ({attributes, children, element}: any) => {
  const level = element.type?.replace('h', '') || '1';
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  const styles: Record<string, React.CSSProperties> = {
    h1: {fontSize: '2em', fontWeight: 'bold', margin: '0 0 16px 0'},
    h2: {fontSize: '1.5em', fontWeight: 'bold', margin: '0 0 12px 0'},
    h3: {fontSize: '1.17em', fontWeight: 'bold', margin: '0 0 10px 0'},
  };

  return (
    <Tag {...attributes} style={styles[Tag] || {}}>
      {children}
    </Tag>
  );
};

// Initial document content
const initialValue = [
  {
    type: 'h1',
    children: [{text: 'Welcome to Plate.js'}],
  },
  {
    type: 'p',
    children: [
      {text: 'Plate.js is a powerful rich-text editor framework built on top of '},
      {text: 'Slate.js', bold: true},
      {text: '. It provides a plugin-based architecture for building complex editors.'},
    ],
  },
  {
    type: 'h2',
    children: [{text: 'Features'}],
  },
  {
    type: 'p',
    children: [
      {text: 'This demo includes basic text formatting:'},
    ],
  },
  {
    type: 'p',
    children: [
      {text: '• '},
      {text: 'Bold text', bold: true},
      {text: ' (Ctrl/Cmd+B)'},
    ],
  },
  {
    type: 'p',
    children: [
      {text: '• '},
      {text: 'Italic text', italic: true},
      {text: ' (Ctrl/Cmd+I)'},
    ],
  },
  {
    type: 'p',
    children: [
      {text: '• '},
      {text: 'Underlined text', underline: true},
      {text: ' (Ctrl/Cmd+U)'},
    ],
  },
  {
    type: 'p',
    children: [
      {text: '• '},
      {text: 'Inline code', code: true},
      {text: ' (Ctrl/Cmd+`)'},
    ],
  },
  {
    type: 'h2',
    children: [{text: 'Collaboration'}],
  },
  {
    type: 'p',
    children: [
      {text: 'This editor will be integrated with '},
      {text: 'json-joy', bold: true, italic: true},
      {text: ' JSON CRDTs for real-time collaborative editing.'},
    ],
  },
];

// Toolbar button component
interface ToolbarButtonProps {
  editor: any;
  format: string;
  label: string;
  style?: React.CSSProperties;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({editor, format, label, style}) => {
  const marks = Editor.marks(editor);
  const isActive = marks ? (marks as any)[format] === true : false;

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
      onMouseDown={(e) => {
        e.preventDefault();
        // Toggle mark using Plate's transform API
        if (isActive) {
          Editor.removeMark(editor, format);
        } else {
          Editor.addMark(editor, format, true);
        }
      }}
    >
      {label}
    </button>
  );
};

export const PlateEditor: React.FC = () => {
  // Create the Plate editor with plugins
  const editor = usePlateEditor({
    value: initialValue,
    plugins: [
      // Block plugins
      ParagraphPlugin,
      HeadingPlugin,
      // Mark plugins - these handle keyboard shortcuts automatically
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      CodePlugin,
    ],
    override: {
      components: {
        // Element components
        p: ParagraphElement,
        h1: HeadingElement,
        h2: HeadingElement,
        h3: HeadingElement,
        // Leaf components
        bold: RichLeaf,
        italic: RichLeaf,
        underline: RichLeaf,
        code: RichLeaf,
      } as any,
    },
  });

  // Force re-render for toolbar state
  const [, forceUpdate] = React.useState({});

  // Connect to json-joy peritext (mock for now)
  // The Plate editor IS a Slate editor, so we can use it directly with bind()
  useEffect(() => {
    const mockPeritextNode = {};
    // editor from usePlateEditor is compatible with Slate's Editor interface
    const unbind = bind(mockPeritextNode, editor as unknown as Editor);
    return unbind;
  }, [editor]);

  // Handle keyboard shortcut for code (Plate doesn't have default)
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === '`') {
        event.preventDefault();
        const marks = Editor.marks(editor as any);
        if (marks && (marks as any).code) {
          Editor.removeMark(editor as any, 'code');
        } else {
          Editor.addMark(editor as any, 'code', true);
        }
        forceUpdate({});
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
      <Plate editor={editor} onSelectionChange={() => forceUpdate({})}>
        {/* Toolbar */}
        <div
          style={{
            borderBottom: '1px solid #ccc',
            padding: '8px',
            background: '#f9f9f9',
          }}
        >
          <ToolbarButton editor={editor} format="bold" label="B" />
          <ToolbarButton editor={editor} format="italic" label="I" />
          <ToolbarButton editor={editor} format="underline" label="U" />
          <ToolbarButton editor={editor} format="code" label="</>" />
        </div>

        {/* Editable Area */}
        <PlateContent
          style={{
            padding: '16px',
            minHeight: '300px',
            fontSize: '16px',
            lineHeight: '1.6',
            outline: 'none',
          }}
          placeholder="Start typing..."
          spellCheck
          autoFocus
          onKeyDown={handleKeyDown}
        />
      </Plate>
    </div>
  );
};
