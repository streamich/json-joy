import * as React from 'react';
import {useEffect, useCallback} from 'react';
import {
  Plate,
  PlateContent,
  usePlateEditor,
  ParagraphPlugin,
} from '@udecode/plate/react';
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  CodePlugin,
} from '@udecode/plate-basic-marks/react';
import {HeadingPlugin} from '@udecode/plate-heading/react';
import {BlockquotePlugin} from '@udecode/plate-block-quote/react';
import {CodeBlockPlugin, CodeLinePlugin} from '@udecode/plate-code-block/react';
import {Editor, Transforms, Element as SlateElement} from 'slate';
import {bind} from '../../index';
import {plateInitialValue} from '../shared/initialValue';

const ParagraphElement = ({attributes, children}: any) => (
  <p
    {...attributes}
    style={{
      margin: '0 0 1em 0',
      lineHeight: 1.7,
    }}
  >
    {children}
  </p>
);

const HeadingElement = ({attributes, children, element}: any) => {
  const level = element.type?.replace('h', '') || '1';
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  const styles: Record<string, React.CSSProperties> = {
    h1: {
      fontSize: '2.25rem',
      fontWeight: 800,
      letterSpacing: '-0.025em',
      marginTop: '2rem',
      marginBottom: '1rem',
      lineHeight: 1.1,
      color: '#0f172a',
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      marginTop: '1.75rem',
      marginBottom: '0.75rem',
      lineHeight: 1.2,
      color: '#1e293b',
      borderBottom: '1px solid #e2e8f0',
      paddingBottom: '0.5rem',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      marginTop: '1.5rem',
      marginBottom: '0.5rem',
      lineHeight: 1.3,
      color: '#334155',
    },
  };

  return (
    <Tag {...attributes} style={styles[Tag] || styles.h3}>
      {children}
    </Tag>
  );
};

const BlockquoteElement = ({attributes, children}: any) => (
  <blockquote
    {...attributes}
    style={{
      borderLeft: '4px solid #64748b',
      marginLeft: 0,
      marginRight: 0,
      marginTop: '1rem',
      marginBottom: '1rem',
      paddingLeft: '1.5rem',
      paddingTop: '0.75rem',
      paddingBottom: '0.75rem',
      background: 'linear-gradient(to right, rgba(100, 116, 139, 0.08), transparent)',
      borderRadius: '0 8px 8px 0',
      fontStyle: 'italic',
      color: '#475569',
    }}
  >
    {children}
  </blockquote>
);

const CodeBlockElement = ({attributes, children, element}: any) => (
  <div {...attributes} style={{margin: '1.5rem 0', position: 'relative'}}>
    {element.lang && (
      <div
        contentEditable={false}
        style={{
          position: 'absolute',
          top: '0',
          right: '0',
          fontSize: '0.75rem',
          color: '#94a3b8',
          textTransform: 'uppercase',
          fontFamily: 'monospace',
          userSelect: 'none',
          backgroundColor: '#334155',
          padding: '4px 12px',
          borderRadius: '0 8px 0 8px',
          letterSpacing: '0.05em',
        }}
      >
        {element.lang}
      </div>
    )}
    <pre
      style={{
        backgroundColor: '#1e293b',
        color: '#e2e8f0',
        padding: '1.25rem',
        borderRadius: '8px',
        fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", Monaco, Consolas, monospace',
        fontSize: '0.875rem',
        lineHeight: 1.7,
        overflow: 'auto',
        margin: 0,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      }}
    >
      <code>{children}</code>
    </pre>
  </div>
);

const CodeLineElement = ({attributes, children}: any) => (
  <div {...attributes} style={{minHeight: '1.7em'}}>
    {children}
  </div>
);

// ============================================================================
// Custom Leaf Component for text marks
// ============================================================================

const RichLeaf = ({attributes, children, leaf}: any) => {
  let content = children;

  if (leaf.bold) {
    content = <strong style={{fontWeight: 600}}>{content}</strong>;
  }
  if (leaf.italic) {
    content = <em>{content}</em>;
  }
  if (leaf.underline) {
    content = <u style={{textDecorationColor: '#64748b', textUnderlineOffset: '2px'}}>{content}</u>;
  }
  if (leaf.code) {
    content = (
      <code
        style={{
          backgroundColor: '#f1f5f9',
          color: '#334155',
          padding: '0.125rem 0.375rem',
          borderRadius: '4px',
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          fontSize: '0.875em',
          fontWeight: 500,
        }}
      >
        {content}
      </code>
    );
  }

  return <span {...attributes}>{content}</span>;
};

// ============================================================================
// Toolbar Components
// ============================================================================

interface ToolbarButtonProps {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({active, disabled, onClick, children, title}) => (
  <button
    title={title}
    disabled={disabled}
    style={{
      width: '36px',
      height: '36px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      borderRadius: '8px',
      background: active ? '#374151' : 'transparent',
      color: active ? 'white' : '#64748b',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '14px',
      fontWeight: 500,
      transition: 'all 0.15s ease',
      opacity: disabled ? 0.5 : 1,
    }}
    onMouseDown={(e) => {
      e.preventDefault();
      if (!disabled) onClick();
    }}
    onMouseOver={(e) => {
      if (!active && !disabled) {
        e.currentTarget.style.backgroundColor = '#f1f5f9';
      }
    }}
    onMouseOut={(e) => {
      if (!active) {
        e.currentTarget.style.backgroundColor = 'transparent';
      }
    }}
  >
    {children}
  </button>
);

const ToolbarSeparator = () => (
  <div style={{width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 4px'}} />
);

// ============================================================================
// Main Plate Editor Component
// ============================================================================

export const PlateEditor: React.FC = () => {
  const editor = usePlateEditor({
    value: plateInitialValue,
    plugins: [
      // Block plugins
      ParagraphPlugin,
      HeadingPlugin,
      BlockquotePlugin,
      CodeBlockPlugin,
      CodeLinePlugin,
      // Mark plugins
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
        blockquote: BlockquoteElement,
        code_block: CodeBlockElement,
        code_line: CodeLineElement,
        // Leaf components
        bold: RichLeaf,
        italic: RichLeaf,
        underline: RichLeaf,
        code: RichLeaf,
      } as any,
    },
  });

  const [, forceUpdate] = React.useState({});

  // Connect to json-joy peritext (mock for now)
  useEffect(() => {
    const mockPeritextNode = {};
    const unbind = bind(mockPeritextNode, editor as unknown as Editor);
    return unbind;
  }, [editor]);

  // Check if block type is active
  const isBlockActive = useCallback(
    (type: string): boolean => {
      try {
        const {selection} = editor as any;
        if (!selection) return false;

        const [match] = Editor.nodes(editor as any, {
          at: Editor.unhangRange(editor as any, selection),
          match: (n) => SlateElement.isElement(n) && (n as any).type === type,
        });
        return !!match;
      } catch {
        return false;
      }
    },
    [editor]
  );

  // Toggle block type
  const toggleBlock = useCallback(
    (type: string) => {
      const isActive = isBlockActive(type);

      if (type === 'code_block') {
        // Code blocks need special handling (wrap/unwrap)
        if (isActive) {
          Transforms.setNodes(editor as any, {type: 'p'} as any, {
            match: (n: any) => n.type === 'code_line',
          });
          Transforms.unwrapNodes(editor as any, {
            match: (n: any) => n.type === 'code_block',
          });
        } else {
          Transforms.setNodes(editor as any, {type: 'code_line'} as any, {
            match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor as any, n),
          });
          Transforms.wrapNodes(editor as any, {
            type: 'code_block',
            children: [],
          } as any);
        }
      } else {
        // Simple blocks (headings, blockquote, paragraph)
        Transforms.setNodes(editor as any, {type: isActive ? 'p' : type} as any, {
          match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor as any, n),
        });
      }
      forceUpdate({});
    },
    [editor, isBlockActive]
  );

  // Toggle mark helper
  const toggleMark = useCallback(
    (key: string) => {
      const marks = Editor.marks(editor as any);
      if (marks && (marks as any)[key]) {
        Editor.removeMark(editor as any, key);
      } else {
        Editor.addMark(editor as any, key, true);
      }
      forceUpdate({});
    },
    [editor]
  );

  // Check if mark is active
  const isMarkActive = useCallback(
    (key: string) => {
      const marks = Editor.marks(editor as any);
      return marks ? !!(marks as any)[key] : false;
    },
    [editor]
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '`':
            event.preventDefault();
            toggleMark('code');
            break;
        }
      }
    },
    [toggleMark]
  );

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
      }}
    >
      <Plate editor={editor} onSelectionChange={() => forceUpdate({})}>
        {/* Modern Toolbar */}
        <div
          style={{
            padding: '12px 16px',
            background: 'linear-gradient(to bottom, #fafafa, #f5f5f5)',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            flexWrap: 'wrap',
          }}
        >
          {/* Block type buttons */}
          <ToolbarButton
            active={isBlockActive('h1')}
            onClick={() => toggleBlock('h1')}
            title="Heading 1"
          >
            H1
          </ToolbarButton>
          <ToolbarButton
            active={isBlockActive('h2')}
            onClick={() => toggleBlock('h2')}
            title="Heading 2"
          >
            H2
          </ToolbarButton>

          <ToolbarSeparator />

          <ToolbarButton active={isMarkActive('bold')} onClick={() => toggleMark('bold')} title="Bold (⌘B)">
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton active={isMarkActive('italic')} onClick={() => toggleMark('italic')} title="Italic (⌘I)">
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
            active={isMarkActive('underline')}
            onClick={() => toggleMark('underline')}
            title="Underline (⌘U)"
          >
            <span style={{textDecoration: 'underline'}}>U</span>
          </ToolbarButton>
          <ToolbarButton active={isMarkActive('code')} onClick={() => toggleMark('code')} title="Inline Code (⌘`)">
            <span style={{fontFamily: 'monospace', fontSize: '12px'}}>&lt;/&gt;</span>
          </ToolbarButton>

          <ToolbarSeparator />

          <ToolbarButton
            active={isBlockActive('blockquote')}
            onClick={() => toggleBlock('blockquote')}
            title="Block Quote"
          >
            <span style={{fontSize: '18px', lineHeight: 1}}>❝</span>
          </ToolbarButton>
          <ToolbarButton
            active={isBlockActive('code_block')}
            onClick={() => toggleBlock('code_block')}
            title="Code Block"
          >
            <span style={{fontFamily: 'monospace', fontSize: '11px'}}>{'{ }'}</span>
          </ToolbarButton>
        </div>

        {/* Editor Content */}
        <PlateContent
          style={{
            padding: '32px 40px',
            minHeight: '500px',
            fontSize: '16px',
            lineHeight: 1.7,
            color: '#1e293b',
            outline: 'none',
          }}
          placeholder="Start writing..."
          spellCheck
          autoFocus
          onKeyDown={handleKeyDown}
        />

        {/* Footer with info */}
        <div
          style={{
            padding: '12px 16px',
            background: '#f9fafb',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            color: '#9ca3af',
          }}
        >
          <span>Powered by Plate.js + json-joy CRDTs</span>
          <span>⌘B Bold · ⌘I Italic · ⌘U Underline · ⌘` Code</span>
        </div>
      </Plate>
    </div>
  );
};
