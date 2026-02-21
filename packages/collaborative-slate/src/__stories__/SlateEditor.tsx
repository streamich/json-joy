import * as React from 'react';
import {useCallback, useMemo, useState} from 'react';
import {createEditor, Descendant, Editor, Transforms, Element as SlateElement, BaseEditor} from 'slate';
import {Slate, Editable, withReact, RenderLeafProps, RenderElementProps, ReactEditor} from 'slate-react';
import {HistoryEditor} from 'slate-history';
import {SlateFacade} from '../SlateFacade';
import {PeritextBinding} from '@jsonjoy.com/collaborative-peritext/lib/PeritextBinding';
import {useSlatePresence} from '../presence/useSlatePresence';
import {withPresenceLeaf} from '../presence/PresenceLeaf';
import type {PresenceManager} from '@jsonjoy.com/collaborative-presence';
import type {Model} from 'json-joy/lib/json-crdt';

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
  children: (CustomElement | CustomText)[];
};

type HeadingElement = {
  type: 'heading';
  level: 1 | 2 | 3;
  children: (CustomElement | CustomText)[];
};

type BlockquoteElement = {
  type: 'blockquote';
  children: (CustomElement | CustomText)[];
};

type CodeBlockElement = {
  type: 'code-block';
  language?: string;
  children: CustomText[];
};

type CustomElement = ParagraphElement | HeadingElement | BlockquoteElement | CodeBlockElement;

// Extend Slate's types
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

type MarkFormat = 'bold' | 'italic' | 'underline' | 'code';
type BlockFormat = 'paragraph' | 'heading' | 'blockquote' | 'code-block';

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

// Check if a block is active
const isBlockActive = (editor: Editor, format: BlockFormat, level?: number): boolean => {
  const {selection} = editor;
  if (!selection) return false;

  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (n) => {
      if (!SlateElement.isElement(n)) return false;
      if (n.type !== format) return false;
      if (format === 'heading' && level !== undefined) {
        return (n as HeadingElement).level === level;
      }
      return true;
    },
  });

  return !!match;
};

// Toggle a block type
const toggleBlock = (editor: Editor, format: BlockFormat, level?: number): void => {
  const isActive = isBlockActive(editor, format, level);

  Transforms.setNodes(
    editor,
    {
      type: isActive ? 'paragraph' : format,
      ...(format === 'heading' && level ? {level} : {}),
    } as Partial<CustomElement>,
    {match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n)}
  );
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
          fontSize: '0.9em',
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
      const level = (element as HeadingElement).level;
      const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3';
      const styles: Record<string, React.CSSProperties> = {
        h1: {fontSize: '1.875rem', fontWeight: 700, marginBottom: '1rem', marginTop: '1.5rem', lineHeight: 1.2},
        h2: {fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem', marginTop: '1.25rem', lineHeight: 1.3},
        h3: {fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', marginTop: '1rem', lineHeight: 1.4},
      };
      return (
        <HeadingTag {...attributes} style={styles[HeadingTag]}>
          {children}
        </HeadingTag>
      );
    }
    case 'blockquote':
      return (
        <blockquote
          {...attributes}
          style={{
            borderLeft: '6px solid #64748b',
            marginLeft: 0,
            marginRight: 0,
            marginTop: '0.5rem',
            marginBottom: '0.5rem',
            paddingLeft: '1rem',
            paddingTop: '0.25rem',
            paddingBottom: '0.25rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0 4px 4px 0',
            color: '#475569',
          }}
        >
          {children}
        </blockquote>
      );
    case 'code-block':
      return (
        <div {...attributes} style={{margin: '0.75rem 0', position: 'relative'}}>
          {(element as CodeBlockElement).language && (
            <div
              contentEditable={false}
              style={{
                position: 'absolute',
                top: '8px',
                right: '12px',
                fontSize: '11px',
                color: '#94a3b8',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
                userSelect: 'none',
              }}
            >
              {(element as CodeBlockElement).language}
            </div>
          )}
          <pre
            style={{
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              padding: '1rem',
              borderRadius: '8px',
              fontFamily: '"JetBrains Mono", "Fira Code", Monaco, Consolas, monospace',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              overflow: 'auto',
              margin: 0,
            }}
          >
            <code>{children}</code>
          </pre>
        </div>
      );
    case 'paragraph':
    default:
      return (
        <p {...attributes} style={{margin: '0 0 0.5rem 0', lineHeight: 1.6}}>
          {children}
        </p>
      );
  }
};

// Toolbar button component for marks
interface MarkButtonProps {
  format: MarkFormat;
  label: string;
  editor: Editor;
  icon?: React.ReactNode;
}

const MarkButton: React.FC<MarkButtonProps> = ({format, label, editor, icon}) => {
  const [, forceUpdate] = useState({});
  const isActive = isMarkActive(editor, format);

  return (
    <button
      title={label}
      style={{
        width: '32px',
        height: '32px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        background: isActive ? '#374151' : 'white',
        color: isActive ? 'white' : '#374151',
        cursor: 'pointer',
        fontWeight: format === 'bold' ? 700 : 400,
        fontStyle: format === 'italic' ? 'italic' : 'normal',
        textDecoration: format === 'underline' ? 'underline' : 'none',
        fontFamily: format === 'code' ? 'monospace' : 'inherit',
        fontSize: '14px',
        transition: 'all 0.15s ease',
      }}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
        forceUpdate({});
      }}
    >
      {icon || label}
    </button>
  );
};

// Toolbar button component for blocks
interface BlockButtonProps {
  format: BlockFormat;
  label: string;
  editor: Editor;
  level?: number;
  icon?: React.ReactNode;
}

const BlockButton: React.FC<BlockButtonProps> = ({format, label, editor, level, icon}) => {
  const [, forceUpdate] = useState({});
  const isActive = isBlockActive(editor, format, level);

  return (
    <button
      title={label}
      style={{
        width: '32px',
        height: '32px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        background: isActive ? '#374151' : 'white',
        color: isActive ? 'white' : '#374151',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 500,
        transition: 'all 0.15s ease',
      }}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format, level);
        forceUpdate({});
      }}
    >
      {icon || label}
    </button>
  );
};

// Toolbar separator
const ToolbarSeparator: React.FC = () => (
  <div style={{width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 8px'}} />
);

export interface SlateEditorProps {
  model: Model<any>;
  onEditor?: (editor: Editor) => void;
  presence?: PresenceManager;
}

// Placeholder initial value used only during the brief window before the
// binding performs its first sync (replaces children from the CRDT model).
const placeholderValue: Descendant[] = [{type: 'paragraph', children: [{text: ''}]} as any];

export const SlateEditor: React.FC<SlateEditorProps> = ({model, onEditor, presence}) => {
  // Create editor instance (memoized to persist across renders)
  const editor = useMemo(() => withReact(createEditor()), []);

  // Force re-render for toolbar state
  const [, forceUpdate] = useState({});

  // Peritext ref for presence hook
  const peritextRef = useCallback(() => (model as any).s.toExt(), [model]);

  // Bind Model to Slate editor
  React.useEffect(() => {
    const peritextRef = () => (model as any).s.toExt();
    const facade = new SlateFacade(editor, peritextRef);
    const unbind = PeritextBinding.bind(peritextRef, facade);
    if (onEditor) onEditor(editor);
    return () => {
      unbind();
    };
  }, [model, editor, onEditor]);
  const {decorate, sendLocalPresence} = useSlatePresence({
    manager: presence,
    peritext: peritextRef,
    editor,
    userFromMeta: (meta: any) => (meta ? {name: meta.name, color: meta.color} : undefined),
  });
  const renderLeaf = useMemo(() => {
    const baseRenderLeaf = (props: RenderLeafProps) => <Leaf {...props} />;
    return presence ? withPresenceLeaf(baseRenderLeaf) : baseRenderLeaf
  }, [presence]);
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
        case 'z': {
          if (!HistoryEditor.isHistoryEditor(editor)) break;
          event.preventDefault();
          if (event.shiftKey) {
            editor.redo();
          } else {
            editor.undo();
          }
          forceUpdate({});
          break;
        }
        case 'y': {
          if (!HistoryEditor.isHistoryEditor(editor)) break;
          event.preventDefault();
          editor.redo();
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
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        width: '100%',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
      }}
    >
      <Slate
        editor={editor}
        initialValue={placeholderValue}
        onSelectionChange={() => {
          forceUpdate({});
          sendLocalPresence();
        }}
        onChange={() => {
          sendLocalPresence();
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            borderBottom: '1px solid #e2e8f0',
            padding: '8px 12px',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexWrap: 'wrap',
          }}
        >
          {/* Block buttons */}
          <BlockButton format="heading" level={1} label="Heading 1" editor={editor} icon="H1" />
          <BlockButton format="heading" level={2} label="Heading 2" editor={editor} icon="H2" />
          <BlockButton format="blockquote" label="Quote" editor={editor} icon="&#10077;" />
          <BlockButton format="code-block" label="Code Block" editor={editor} icon="{ }" />

          <ToolbarSeparator />

          {/* Mark buttons */}
          <MarkButton format="bold" label="Bold (Ctrl+B)" editor={editor} icon="B" />
          <MarkButton format="italic" label="Italic (Ctrl+I)" editor={editor} icon="I" />
          <MarkButton format="underline" label="Underline (Ctrl+U)" editor={editor} icon="U" />
          <MarkButton format="code" label="Code (Ctrl+`)" editor={editor} icon="<>" />

          <ToolbarSeparator />

          {/* Undo / Redo buttons */}
          <button
            title="Undo (Ctrl+Z)"
            style={{
              width: '32px',
              height: '32px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              background: 'white',
              color: HistoryEditor.isHistoryEditor(editor) && editor.history.undos.length > 0 ? '#374151' : '#cbd5e1',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
            onMouseDown={(event) => {
              event.preventDefault();
              if (HistoryEditor.isHistoryEditor(editor)) {
                editor.undo();
                forceUpdate({});
              }
            }}
          >
            ↩
          </button>
          <button
            title="Redo (Ctrl+Shift+Z)"
            style={{
              width: '32px',
              height: '32px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              background: 'white',
              color: HistoryEditor.isHistoryEditor(editor) && editor.history.redos.length > 0 ? '#374151' : '#cbd5e1',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
            onMouseDown={(event) => {
              event.preventDefault();
              if (HistoryEditor.isHistoryEditor(editor)) {
                editor.redo();
                forceUpdate({});
              }
            }}
          >
            ↪
          </button>
        </div>

        {/* Editable Area */}
        <Editable
          style={{
            padding: '20px 24px',
            minHeight: '340px',
            fontSize: '16px',
            lineHeight: 1.6,
            outline: 'none',
          }}
          decorate={decorate}
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
