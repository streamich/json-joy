import * as React from 'react';
import {useMemo, useEffect, useCallback} from 'react';
import {rule} from 'nano-theme';
import {createEditor, type Descendant} from 'slate';
import {Slate, Editable, withReact, type RenderElementProps, type RenderLeafProps} from 'slate-react';
import {withHistory} from 'slate-history';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import useIsomorphicLayoutEffect from 'react-use/lib/useIsomorphicLayoutEffect'
import * as ScrollArea from '@jsonjoy.com/ui/lib/4-card/ScrollArea';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {withPresenceLeaf, useSlatePresence} from '@jsonjoy.com/collaborative-slate';
import {toSlate} from '@jsonjoy.com/collaborative-slate/lib/sync/toSlate';
import {withCodeBlockBreaks} from './behavior';
import {withEmbeds} from './behavior/embed';
import {ext, ModelWithExt} from 'json-joy/lib/json-crdt-extensions';
import {FromSlate} from '@jsonjoy.com/collaborative-slate';
import type {Model} from 'json-joy/lib/json-crdt';
import {CodeHighlightState} from './behavior/code-highlighting';
import {handleKeyboardShortcuts} from './behavior/keyboard';
import {BlockElement} from './components/blocks/BlockElement';
import {MuTxtFooter} from './chrome/footer/MuTxtFooter';
import {ScrollMap} from './chrome/scroll/ScrollMap';
import {Leaf} from './components/inline/Leaf';
import {DEF_PLACEHOLDER, Placeholder} from './components/inline/Placeholder';
import {MuTxtHeader} from './chrome/header/MuTxtHeader';
import {FloatingBlockToolbar} from './components/toolbar/floating/FloatingBlockToolbar';
import {FloatingToolbar} from './components/toolbar/floating/FloatingToolbar';
import {SlashMenu} from './components/toolbar/floating/SlashMenu';
import {SlateEditorContextProvider} from './context';
import {MuTxtState} from './state/MuTxtState';
import type {PresenceManager} from '@jsonjoy.com/collaborative-presence';
import type {CustomElement, SlateEditorDocument} from './types';
import type {PeritextRef} from '@jsonjoy.com/collaborative-peritext';
import type {MuTxtApi} from './state/MuTxtApi';

const renderElement = (props: RenderElementProps) => <BlockElement {...(props as any)} />;

const createEmptyDocument = (): SlateEditorDocument => [{type: 'p', children: [{text: ''}]} as CustomElement];
const normalizeDocument = (value?: SlateEditorDocument): SlateEditorDocument => (value && value.length ? value : createEmptyDocument());

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

const editableClass = rule({
  w: '100%',
  mr: '0 auto',
  pd: '22px 24px',
  bxz: 'border-box',
  fz: '16px',
  lh: 1.8,
  out: 'none',
});

export interface MuTxtProps {
  peritext?: PeritextRef;
  presence?: PresenceManager;
  initialValue?: SlateEditorDocument;
  placeholder?: React.ReactNode;
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
  placeholder = DEF_PLACEHOLDER,
  presence,
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

  // ----------------------------------------------------------------- Peritext
  const peritextRef: PeritextRef = useMemo(() => {
    if (peritext) return peritext;
    const model = ModelWithExt.create(ext.peritext.new('')) as unknown as Model<any>;
    const value = initialValue ?? createEmptyDocument();
    const viewRange = FromSlate.convert(normalizeDocument(value) as any);
    const txt = (model as any).s.toExt().txt;
    txt.editor.merge(viewRange);
    txt.refresh();
    const ref = (() => (model as any).s.toExt());
    return ref;
  }, [peritext]);

  // ------------------------------------------------------------- Editor state
  const [editor, state] = useMemo(() => {
    if (!peritextRef) throw new Error('NO_TXT');
    let initialValue: Descendant[] = [];
    try {
      initialValue = toSlate(peritextRef().txt) as Descendant[];
    } catch {
      initialValue = createEmptyDocument() as Descendant[];
    }
    const editor = withEmbeds(withCodeBlockBreaks(withHistory(withReact(createEditor()))));
    editor.children = initialValue;
    editor.selection = null;
    if (_state) return [_state.editor, _state];
    const state = new MuTxtState(editor, peritextRef, {collaborative: !!presence, readOnly});
    return [editor, state];
  }, [peritextRef, _state]);
  useEffect(() => {
    if (_state) return; // We don't own the state.
    return state.start();
  }, [_state, state]);
  useIsomorphicLayoutEffect(() => {
    onApi?.(state.api);
  }, []);

  // ---------------------------------------------------- Props synchronization
  useEffect(() => {
    state.setReadOnly(!!readOnly);
  }, [state, readOnly]);
  
  // --------------------------------------------------------- Presence manager
  const {decorate: decorateRemoteCursors, sendLocalPresence} = useSlatePresence({
    manager: presence,
    peritext: peritextRef,
    editor,
    userFromMeta: (meta: any) => (meta ? {name: meta.name, color: meta.color} : undefined),
  });
  useEffect(() => {
    state.publishPresence = sendLocalPresence;
  }, [sendLocalPresence]);

  // ------------------------------------------- Code block syntax highlighting
  const highlighter = useMemo(() => new CodeHighlightState(), []);
  highlighter.tick.use();

  // -------------------------------------------------------- Slate decorations
  const decorate = useCallback(
    (entry: Parameters<typeof decorateRemoteCursors>[0]) => {
      return [...decorateRemoteCursors(entry), ...highlighter.decorate(entry)];
    },
    [decorateRemoteCursors, highlighter],
  );

  // ---------------------------------------------------------------- Renderers
  const renderLeaf = useMemo(() => {
    const base = (props: RenderLeafProps) => <Leaf {...(props as any)} />;
    return presence ? withPresenceLeaf(base) : base;
  }, [presence]);

  const editableStyle: React.CSSProperties = {
    minHeight,
    maxWidth: contentWidth ?? 800,
    color: styles.g(0.15),
    caretColor: styles.g(0),
  };

  let content: React.ReactNode = (
    <Slate
      editor={editor} initialValue={editor.children} onChange={state.onChange} onSelectionChange={state.onSelection}
    >
      <Editable
        ref={(el) => {
          if (el) state.editableBox.setEl(el);
        }}
        decorate={decorate}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder={placeholder as any}
        renderPlaceholder={props => <Placeholder {...props} />}
        spellCheck
        autoFocus={autoFocus}
        readOnly={readOnly}
        className={editableClass}
        style={editableStyle}
        onFocus={() => state.setFocused(true)}
        onBlur={() => state.setFocused(false)}
        onKeyDown={(event) => {
          const handled = handleKeyboardShortcuts(editor, event, {
            requestLinkMenu: state.requestLinkMenu,
            onSlashKey: state.onSlashKey,
          });
          if (handled) state.sync(true);
        }}
      />
      <FloatingBlockToolbar />
      <FloatingToolbar />
      <SlashMenu />
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
      <ScrollArea.ScrollArea state={state.scroll} shadow style={scrollAreaStyle}>
        <ScrollArea.Viewport
          onMouseDown={(e) => {
            if (!state.api.focused() && !(e.target as HTMLElement).closest('[contenteditable]')) {
              e.preventDefault();
              state.api.focus();
            }
          }}
          onMouseUp={(e) => {
            if (!state.api.focused() && !(e.target as HTMLElement).closest('[contenteditable]')) {
              e.preventDefault();
              state.api.focus();
            }
          }}
        >
          {content}
        </ScrollArea.Viewport>
        <ScrollArea.ScrollRail>
          <ScrollArea.Thumb />
          <ScrollMap editor={editor} />
        </ScrollArea.ScrollRail>
      </ScrollArea.ScrollArea>
    );
  }

  content = (
    <>
      <MuTxtHeader editor={editor} readOnly={readOnly} onVisualChange={() => state.sync(true)} />
      {content}
      <div style={{borderTop: `1px solid ${styles.light ? styles.g(0, 0.06) : styles.g(1, 0.08)}`}}>
        <MuTxtFooter />
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