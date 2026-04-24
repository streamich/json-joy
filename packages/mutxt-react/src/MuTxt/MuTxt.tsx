import * as React from 'react';
import {rule} from 'nano-theme';
import {createEditor, type Descendant} from 'slate';
import {Slate, Editable, withReact, type RenderElementProps, type RenderLeafProps, type RenderPlaceholderProps} from 'slate-react';
import {withHistory} from 'slate-history';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import useIsomorphicLayoutEffect from 'react-use/lib/useIsomorphicLayoutEffect'
import * as ScrollArea from '@jsonjoy.com/ui/lib/4-card/ScrollArea';
import {MuTxtLogo} from '@jsonjoy.com/ui/lib/icons/svg/MuTxtLogo';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {withPresenceLeaf, useSlatePresence} from '@jsonjoy.com/collaborative-slate';
import {toSlate} from '@jsonjoy.com/collaborative-slate/lib/sync/toSlate';
import {withCodeBlockBreaks} from './behavior';
import {withEmbeds} from './behavior/embed';
import {useCodeSyntaxDecorations} from './behavior/code-highlighting';
import {handleKeyboardShortcuts} from './behavior/keyboard';
import {BlockElement} from './components/blocks/BlockElement';
import {EditorFooter} from './components/chrome/EditorFooter';
import {EditorScrollMap} from './components/chrome/EditorScrollMap';
import {Leaf} from './components/inline/Leaf';
import {Placeholder} from './components/inline/Placeholder';
import {EditorToolbar} from './components/toolbar/EditorToolbar';
import {SlateEditorContextProvider} from './context';
import {MuTxtState} from './controllers/MuTxtState';
import {createEmptyDocument, createSlateEditorModel, shouldShowPlaceholder} from './util/index';
import type {PresenceManager} from '@jsonjoy.com/collaborative-presence';
import type {SlateEditorDocument} from './types';
import type {PeritextRef} from '@jsonjoy.com/collaborative-peritext';
import type {MuTxtApi} from './controllers/MuTxtApi';

const shellClass = rule({
  w: '100%',
  maxW: '1200px',
  mr: '0 auto',
  ov: 'hidden',
});

const fitShellClass = rule({
  h: '100%',
  d: 'flex',
  fld: 'column',
});

const defaultPlaceholder = (
  <span style={{display: 'inline-flex', alignItems: 'center'}}>
    Start writing or type "/" for commands in your <MuTxtLogo style={{margin: '-8px 0'}} /> document...
  </span>
);

export interface MuTxtProps {
  peritext?: PeritextRef;
  presence?: PresenceManager;
  initialValue?: SlateEditorDocument;
  placeholder?: string;
  maxWidth?: number;
  contentWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  height?: number;
  heightFit?: boolean;
  borderless?: boolean;
  autoFocus?: boolean;
  hoverElevate?: boolean;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
  state?: MuTxtState;
  onApi?: (api: MuTxtApi) => void;
}

export const MuTxt: React.FC<MuTxtProps> = ({
  peritext,
  initialValue,
  presence,
  placeholder = defaultPlaceholder as any,
  contentWidth,
  minHeight,
  maxHeight,
  height,
  heightFit,
  borderless,
  autoFocus,
  hoverElevate,
  readOnly,
  className = '',
  style,
  state: _state,
  onApi,
}) => {
  const styles = useStyles();
  const standaloneModel = React.useMemo(() => createSlateEditorModel(initialValue ?? []), []);
  const peritextRef = React.useCallback(peritext ?? (() => (standaloneModel as any).s.toExt()), [peritext, standaloneModel]);

  // ------------------------------------------------------------- Slate editor
  const editor = React.useMemo(() => {
    let initialEditorValue: Descendant[] = [];
    try {
      initialEditorValue = toSlate(peritextRef().txt) as Descendant[];
    } catch {
      initialEditorValue = createEmptyDocument() as Descendant[];
    }
    const editor = withEmbeds(withCodeBlockBreaks(withHistory(withReact(createEditor()))));
    editor.children = initialEditorValue;
    editor.selection = null;
    return editor;
  }, [peritextRef]);

  // ------------------------------------------------------------- mu-txt state
  const state = React.useMemo(() => {
    if (_state) return _state;
    if (!peritext) throw new Error('NO_TXT');
    return new MuTxtState(editor, peritext, {collaborative: !!presence, readOnly});
  }, [_state, editor, peritext]);
  React.useEffect(() => {
    if (_state) return; // We don't own the state.
    return state.start();
  }, [_state, state]);
  const contentVersion = state.contentVersion.use();
  useIsomorphicLayoutEffect(() => {
    onApi?.(state.api);
  }, []);

  // ---------------------------------------------------- Props synchronization
  React.useEffect(() => {
    state.setReadOnly(!!readOnly);
  }, [state, readOnly]);
  
  // --------------------------------------------------------- Presence manager
  const {decorate: decorateRemoteCursors, sendLocalPresence} = useSlatePresence({
    manager: presence,
    peritext: peritextRef,
    editor,
    userFromMeta: (meta: any) => (meta ? {name: meta.name, color: meta.color} : undefined),
  });
  React.useEffect(() => {
    state.publishPresence = sendLocalPresence;
  }, [sendLocalPresence]);

  // ------------------------------------------- Code block syntax highlighting
  const decorateCodeHighlighting = useCodeSyntaxDecorations(editor, contentVersion);

  // -------------------------------------------------------- Slate decorations
  const decorate = React.useCallback(
    (entry: Parameters<typeof decorateRemoteCursors>[0]) => {
      return [...decorateRemoteCursors(entry), ...decorateCodeHighlighting(entry)];
    },
    [decorateRemoteCursors, decorateCodeHighlighting],
  );

  // -------------------------------------------------------------------- other
  const syncVisualState = React.useCallback((contentChanged = false) => {
    state.requestScrollMapRefresh();
    if (contentChanged) state.contentVersion.next(state.contentVersion.value + 1);
    state.sync();
    state.publishPresence?.();
  }, [state]);

  const renderElement = React.useCallback((props: RenderElementProps) => <BlockElement {...(props as any)} />, []);

  const renderLeaf = React.useMemo(() => {
    const base = (props: RenderLeafProps) => <Leaf {...(props as any)} />;
    return presence ? withPresenceLeaf(base) : base;
  }, [presence]);

  const showPlaceholder = shouldShowPlaceholder(editor);

  const renderPlaceholder = React.useCallback(
    (props: RenderPlaceholderProps) => <Placeholder {...props}>{showPlaceholder ? placeholder : ''}</Placeholder>,
    [placeholder, showPlaceholder],
  );

  const editableStyle: React.CSSProperties = {
    minHeight,
    width: '100%',
    maxWidth: contentWidth ?? 800,
    margin: '0 auto',
    padding: '22px 24px',
    boxSizing: 'border-box',
    fontSize: '16px',
    lineHeight: 1.8,
    outline: 'none',
    color: styles.light ? styles.g(0.15) : styles.g(0.92),
    caretColor: styles.light ? styles.g(0.08) : styles.g(0.96),
  };

  let content: React.ReactNode = (
    <Slate
      editor={editor} initialValue={editor.children} onChange={() => syncVisualState(true)} onSelectionChange={() => syncVisualState(false)}
    >
      <Editable
        decorate={decorate}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        renderPlaceholder={renderPlaceholder}
        placeholder={showPlaceholder ? placeholder : ''}
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
          if (handled) syncVisualState(true);
        }}
      />
    </Slate>
  );

  let scrollAreaStyle: React.CSSProperties | undefined;
  if (heightFit) {
    scrollAreaStyle ={flex: '1 1 0%', overflow: 'auto', minHeight: 0};
  } else if (height || maxHeight) {
    scrollAreaStyle = {height, maxHeight};
  }
  if (scrollAreaStyle) {
    content = (
      <ScrollArea.ScrollArea shadow railWidth={12} style={scrollAreaStyle} hideDelay={5000}>
        <ScrollArea.Viewport
          onMouseDown={(e) => {
            if (!state.api.focused()) {
              e.preventDefault();
              state.api.focus();
            }
          }}
          onMouseUp={(e) => {
            if (!state.api.focused()) {
              e.preventDefault();
              state.api.focus();
            }
          }}
        >
          {content}
        </ScrollArea.Viewport>
        <ScrollArea.ScrollRail>
          <ScrollArea.Thumb />
          <EditorScrollMap editor={editor} />
        </ScrollArea.ScrollRail>
      </ScrollArea.ScrollArea>
    );
  }

  content = (
    <>
      <EditorToolbar editor={editor} readOnly={readOnly} onVisualChange={() => syncVisualState(true)} />
      {content}
      <div style={{borderTop: `1px solid ${styles.light ? styles.g(0, 0.06) : styles.g(1, 0.08)}`}}>
        <EditorFooter />
      </div>
    </>
  );

  const contentClass = (className || '') + shellClass + (heightFit ? fitShellClass : '');

  if (borderless) {
    content = React.createElement('div', {style, className: contentClass}, content);
  } else {
    content = React.createElement(Paper, {round: true, contrast: true, hover: true, hoverElevate, style, className: contentClass}, content);
  }

  return (
    <SlateEditorContextProvider state={state}>
      {content}
    </SlateEditorContextProvider>
  );
};