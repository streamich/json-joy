import * as React from 'react';
import * as ScrollArea from '@jsonjoy.com/ui/lib/4-card/ScrollArea';
import {useMemo, useEffect, useCallback} from 'react';
import {rule} from 'nano-theme';
import {createEditor, Transforms} from 'slate';
import {Slate, Editable, withReact, type RenderElementProps, type RenderLeafProps} from 'slate-react';
import {withHistory} from 'slate-history';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import useIsomorphicLayoutEffect from 'react-use/lib/useIsomorphicLayoutEffect'
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {withPresenceLeaf, useSlatePresence} from '@jsonjoy.com/collaborative-slate';
import {withCodeBlockBreaks} from './behavior';
import {withEmbeds} from './behavior/embed';
import {withHr} from './behavior/hr';
import {withTitleSubmit} from './behavior/title';
import {withFile} from './behavior/file';
import {ObjNode} from 'json-joy/lib/json-crdt';
import type {ObjApi} from 'json-joy/lib/json-crdt';
import {BlockElement} from './components/blocks/BlockElement';
import {MuTxtFooter} from './chrome/footer/MuTxtFooter';
import {ScrollMap} from './chrome/scroll/ScrollMap';
import {Leaf} from './inline/components/Leaf';
import {DEF_PLACEHOLDER, Placeholder} from './inline/components/Placeholder';
import {MuTxtHeader} from './chrome/header/MuTxtHeader';
import {InlineFloater} from './inline/InlineFloater';
import {LinkFloater} from './inline/link/LinkFloater';
import {BlockFloater} from './block/BlockFloater';
import {VoidFloater} from './void/VoidFloater';
import {EmbedFloater} from './void/embed/EmbedFloater';
import {FileFloater} from './void/file/FileFloater';
import {SlashMenu} from './void/slash/SlashMenu';
import {SlateEditorContextProvider} from './context';
import {MuTxtState} from './state/MuTxtState';
import {decorActiveSelection} from './behavior/active-selection';
import {Sizer} from '@jsonjoy.com/ui/lib/5-block/Sizer';
import type {PresenceManager} from '@jsonjoy.com/collaborative-presence';
import type {CustomElement, SlateEditorDocument} from './types';
import type {PeritextRef} from '@jsonjoy.com/collaborative-peritext';
import type {MuTxtApi} from './state/MuTxtApi';

const renderElement = (props: RenderElementProps) => <BlockElement {...(props as any)} />;

const shellClass = rule({
  w: '100%',
  bxz: 'border-box',
  // maxW: '1200px',
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
  /**
   * The mutxt document, represented as a JSON CRDT object of the shape
   * `{'@type': 'mutxt', text: <peritext>}`. When omitted, MuTxt creates its
   * own in-memory model.
   */
  obj?: ObjApi;

  /** Collaborative presence indicator manager. */
  presence?: PresenceManager;

  /**
   * Slate document used to seed a freshly created mutxt document. Ignored when
   * the underlying document is not empty — in that case the existing content is
   * loaded as-is.
   */
  fromSlate?: SlateEditorDocument;

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

  /**
   * When the editor mounts with an empty document, replace the default
   * empty paragraph with an empty `title` block. Useful for "new document"
   * flows where the first thing the user sees is a title prompt.
   */
  startWithTitle?: boolean;

  /**
   * Called with the text contents of the `title` block when the user
   * presses Enter at the end of it. Fires before the default Enter
   * behaviour (which converts the new block into a subtitle).
   */
  onTitleSubmit?: (title: string) => void;
}

export const MuTxt: React.FC<MuTxtProps> = ({
  obj,
  fromSlate,
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
  startWithTitle,
  onTitleSubmit,
}) => {
  const styles = useStyles();

  // ---------------------------------------------------- Title-submit callback
  const onTitleSubmitRef = React.useRef(onTitleSubmit);
  React.useEffect(() => {
    onTitleSubmitRef.current = onTitleSubmit;
  }, [onTitleSubmit]);

  // ------------------------------------------------------------- Editor state
  const [editor, state] = useMemo(() => {
    const editor = withTitleSubmit(
      withHr(
        withFile(
          withEmbeds(withCodeBlockBreaks(withHistory(withReact(createEditor())))),
        ),
      ),
      () => onTitleSubmitRef.current,
    );
    if (_state) return [_state.editor, _state];
    const state = new MuTxtState(editor, obj as ObjApi<ObjNode>, {collaborative: !!presence, readOnly, fromSlate});
    return [editor, state];
  }, [obj, _state]);
  const peritextRef: PeritextRef = state.peritextRef;
  useEffect(() => {
    if (_state) return; // We don't own the state.
    const stop = state.start();
    if (startWithTitle && state.api.isEmpty()) {
      // Convert the default empty paragraph into an empty title block. This
      // runs after `state.start()` so the operation flows through the active
      // PeritextBinding into the underlying CRDT (rather than being a stale
      // direct mutation of `editor.children`).
      Transforms.setNodes(
        editor,
        {type: 'title'} as Partial<CustomElement>,
        {at: [0]},
      );
    }
    if (autoFocus) requestAnimationFrame(() => state.api.focus());
    return stop;
  }, [_state, state, startWithTitle, editor]);
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

  // -------------------------------------------------------- Slate decorations
  const linkPopupOpen = state.inline.link.open.use();
  const activeSelectionRange = state.inline.link.rangeSnapshot.use();
  const decorate = useCallback(
    (entry: Parameters<typeof decorateRemoteCursors>[0]) => {
      const ranges = [...decorateRemoteCursors(entry)];
      if (linkPopupOpen && activeSelectionRange) {
        const linkRange = decorActiveSelection(entry, activeSelectionRange);
        if (linkRange) ranges.push(linkRange as any);
      }
      return ranges;
    },
    [decorateRemoteCursors, linkPopupOpen, activeSelectionRange],
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
          state.editableBox.setEl(el ?? undefined);
          state.bindKbdSource(el);
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
      />
      <InlineFloater />
      <BlockFloater />
      <VoidFloater />
      <LinkFloater />
      <EmbedFloater />
      <FileFloater />
      <SlashMenu />
    </Slate>
  );

  let scrollAreaStyle: React.CSSProperties | undefined;
  if (heightFit) {
    // NOTE: do NOT set `overflow: auto` here. The actual scrolling happens in
    // the inner `<ScrollArea.Viewport>`, which hides its native scrollbar via
    // `scrollbar-width: none` and `::-webkit-scrollbar { display: none }`.
    // Setting overflow on this outer wrapper would create a second native
    // scroll context with no scrollbar-hiding CSS — on macOS that surfaces as
    // the system overlay scrollbar flashing over the virtual one.
    scrollAreaStyle = {flex: '1 1 0%', minHeight: 0};
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

  const combinedClass = (className || '') + shellClass + (heightFit ? fitShellClass : '');

  if (borderless) {
    content = React.createElement('div', {style, className: combinedClass}, content);
  } else {
    content = React.createElement(Paper, {round: true, contrast: true, hover: true, hoverElevate, style, className: combinedClass}, content);
  }

  return (
    <SlateEditorContextProvider state={state}>
      <Sizer
        state={state.sizer}
        minWidth={300}
        handlePadding={64}
        handleMaxHeight={500}
        handleWidth={3}
        style={heightFit ? {height: '100%', minHeight: 0} : undefined}
      >
        {content}
      </Sizer>
    </SlateEditorContextProvider>
  );
};