import * as React from 'react';
import {rule} from 'nano-theme';
import {createEditor, type Descendant, type Editor} from 'slate';
import {Slate, Editable, withReact, type RenderElementProps, type RenderLeafProps, type RenderPlaceholderProps} from 'slate-react';
import {withHistory} from 'slate-history';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import * as ScrollArea from '@jsonjoy.com/ui/lib/4-card/ScrollArea';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {PeritextBinding} from '@jsonjoy.com/collaborative-peritext/lib/PeritextBinding';
import {SlateFacade} from '../SlateFacade';
import {withPresenceLeaf} from '../presence/PresenceLeaf';
import {useSlatePresence} from '../presence/useSlatePresence';
import {withCodeBlockBreaks} from './behavior';
import {useCodeSyntaxDecorations} from './behavior/code-highlighting';
import {handleKeyboardShortcuts} from './keyboard';
import {BlockElement} from './components/blocks/BlockElement';
import {EditorFooter} from './components/chrome/EditorFooter';
import {Leaf} from './components/inline/Leaf';
import {Placeholder} from './components/inline/Placeholder';
import {EditorToolbar} from './components/toolbar/EditorToolbar';
import {SlateEditorContextProvider} from './context';
import {SlateEditorState} from './state';
import {createSlateEditorModel, EMPTY_DOCUMENT} from './util';
import type {PresenceManager} from '@jsonjoy.com/collaborative-presence';
import type {Model} from 'json-joy/lib/json-crdt';
import type {SlateEditorDocument} from './types';

const shellClass = rule({
  w: '100%',
  maxW: '1200px',
  mr: '0 auto',
  ov: 'hidden',
});

export interface SlateEditorProps {
  model?: Model<any>;
  initialValue?: SlateEditorDocument;
  presence?: PresenceManager;
  onEditor?: (editor: Editor) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  height?: number;
  autoFocus?: boolean;
  readOnly?: boolean;
  className?: string;
  state?: SlateEditorState;
}

const placeholderValue: Descendant[] = EMPTY_DOCUMENT as Descendant[];

export const SlateEditor: React.FC<SlateEditorProps> = ({
  model,
  initialValue,
  presence,
  onEditor,
  placeholder = 'Start with a heading, a note, or a quick thought.',
  minHeight = 360,
  maxHeight,
  height,
  autoFocus,
  readOnly,
  className = '',
  state: providedState,
}) => {
  const styles = useStyles();
  const editor = React.useMemo(() => withCodeBlockBreaks(withHistory(withReact(createEditor()))), []);
  const [tick, setTick] = React.useState(0);
  const [contentVersion, setContentVersion] = React.useState(0);
  const state = React.useMemo(() => providedState ?? new SlateEditorState({collaborative: !!presence, readOnly}), [providedState]);
  const standaloneModel = React.useMemo(() => createSlateEditorModel(initialValue), []);
  const resolvedModel = model ?? standaloneModel;
  const peritextRef = React.useCallback(() => (resolvedModel as any).s.toExt(), [resolvedModel]);

  React.useEffect(() => {
    state.setCollaborative(!!presence);
  }, [state, presence]);

  React.useEffect(() => {
    state.setReadOnly(!!readOnly);
  }, [state, readOnly]);

  React.useEffect(() => {
    const facade = new SlateFacade(editor, peritextRef);
    const unbind = PeritextBinding.bind(peritextRef, facade);
    onEditor?.(editor);
    queueMicrotask(() => state.sync(editor));
    return () => {
      unbind();
    };
  }, [editor, onEditor, peritextRef, state]);

  const {decorate, sendLocalPresence} = useSlatePresence({
    manager: presence,
    peritext: peritextRef,
    editor,
    userFromMeta: (meta: any) => (meta ? {name: meta.name, color: meta.color} : undefined),
  });
  const decorateCodeSyntax = useCodeSyntaxDecorations(editor, contentVersion);

  const syncVisualState = React.useCallback((contentChanged = false) => {
    setTick((value) => value + 1);
    if (contentChanged) setContentVersion((value) => value + 1);
    state.sync(editor);
  }, [editor, state]);

  const refreshAfterEditorChange = React.useCallback((contentChanged = false) => {
    syncVisualState(contentChanged);
    sendLocalPresence();
  }, [sendLocalPresence, syncVisualState]);

  const handleSlateChange = React.useCallback(() => {
    const contentChanged = editor.operations.some((operation) => operation.type !== 'set_selection');
    refreshAfterEditorChange(contentChanged);
  }, [editor, refreshAfterEditorChange]);

  const renderElement = React.useCallback((props: RenderElementProps) => <BlockElement {...(props as any)} />, []);

  const renderLeaf = React.useMemo(() => {
    const base = (props: RenderLeafProps) => <Leaf {...(props as any)} />;
    return presence ? withPresenceLeaf(base) : base;
  }, [presence]);

  const renderPlaceholder = React.useCallback(
    (props: RenderPlaceholderProps) => <Placeholder {...props}>{placeholder}</Placeholder>,
    [placeholder],
  );

  const decorateLeaf = React.useCallback(
    (entry: Parameters<typeof decorate>[0]) => {
      const presenceRanges = decorate(entry);
      const syntaxRanges = decorateCodeSyntax(entry);
      if (!syntaxRanges.length) return presenceRanges;
      if (!presenceRanges.length) return syntaxRanges;
      return [...presenceRanges, ...syntaxRanges];
    },
    [decorate, decorateCodeSyntax],
  );

  const editableStyle: React.CSSProperties = {
    minHeight,
    maxWidth: 800,
    margin: '0 auto',
    padding: '22px 24px',
    fontSize: '16px',
    lineHeight: 1.8,
    outline: 'none',
    color: styles.light ? styles.g(0.15) : styles.g(0.92),
    caretColor: styles.light ? styles.g(0.08) : styles.g(0.96),
  };

  void tick;

  let content: React.ReactNode = (
    <Slate editor={editor} initialValue={placeholderValue} onChange={handleSlateChange} onSelectionChange={() => refreshAfterEditorChange(false)}>
      <Editable
        decorate={decorateLeaf}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        renderPlaceholder={renderPlaceholder}
        placeholder={placeholder}
        spellCheck
        autoFocus={autoFocus}
        readOnly={readOnly}
        style={editableStyle}
        onFocus={() => state.setFocused(true)}
        onBlur={() => state.setFocused(false)}
        onKeyDown={(event) => {
          const handled = handleKeyboardShortcuts(editor, event, {
            requestLinkMenu: state.requestLinkMenu,
          });
          if (handled) refreshAfterEditorChange(true);
        }}
      />
    </Slate>
  );

  if (height || maxHeight) {
    content = (
      <ScrollArea.ScrollArea style={{ height, maxHeight }}>
        <ScrollArea.Viewport>
          {content}
        </ScrollArea.Viewport>
        <ScrollArea.ScrollRail />
      </ScrollArea.ScrollArea>
    );
  }

  return (
    <SlateEditorContextProvider state={state}>
      <Paper
        round
        contrast
        hover
        className={[className, shellClass].filter(Boolean).join(' ')}
      >
        <EditorToolbar editor={editor} readOnly={readOnly} onVisualChange={() => refreshAfterEditorChange(true)} />
        {content}
        <div style={{borderTop: `1px solid ${styles.light ? styles.g(0, 0.06) : styles.g(1, 0.08)}`}}>
          <EditorFooter />
        </div>
      </Paper>
    </SlateEditorContextProvider>
  );
};