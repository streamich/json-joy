import * as React from 'react';
import * as ScrollArea from '@jsonjoy.com/ui/lib/4-card/ScrollArea';
import {useMemo, useEffect, useCallback} from 'react';
import * as nanoTheme from 'nano-theme';
import {rule} from 'nano-theme';
import {createEditor, Transforms} from 'slate';
import {Slate, Editable, withReact, type RenderElementProps, type RenderLeafProps} from 'slate-react';
import {withHistory} from 'slate-history';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import useIsomorphicLayoutEffect from 'react-use/lib/useIsomorphicLayoutEffect';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {withPresenceLeaf, useSlatePresence} from '@jsonjoy.com/collaborative-slate';
import {isInRawTextBlock, withCodeBlockBreaks} from './behavior';
import {withEmbeds} from './behavior/embed';
import {withMath} from './behavior/math';
import {withHr} from './behavior/hr';
import {withLinkPaste} from './behavior/linkPaste';
import {withTitleSubmit} from './behavior/title';
import {withSelectAllGuard} from './behavior/selectAllGuard';
import {withFile} from './behavior/file';
import {withToc} from './behavior/toc';
import {withTranslit} from '../translit/bindings/slate';
import {MuTxtTranslit} from './translit/MuTxtTranslit';
import {BlockElement} from './components/blocks/BlockElement';
import {MuTxtFooter} from './chrome/footer/MuTxtFooter';
import {ScrollMap} from './chrome/scroll/ScrollMap';
import {Leaf} from './inline/components/Leaf';
import {DEF_PLACEHOLDER, Placeholder} from './inline/components/Placeholder';
import {MuTxtHeader} from './chrome/header/MuTxtHeader';
import {InlineFloater} from './inline/InlineFloater';
import {LinkFloater} from './inline/link/LinkFloater';
import {InlineMathFloater} from './inline/InlineMathFloater';
import {BlockFloater} from './block/BlockFloater';
import {EmbedFloater} from './void/embed/EmbedFloater';
import {FileFloater} from './void/file/FileFloater';
import {OmniFloater} from './omni/OmniFloater';
import {SelectAllGuardFloater} from './guard/SelectAllGuardFloater';
import {IndicatorFloater} from './state/IndicatorFloater';
import {SlateEditorContextProvider} from './context';
import {PortalParentProvider} from '@jsonjoy.com/ui/lib/utils/portal/context';
import {EnsureUiProvider, useUiServices} from '@jsonjoy.com/ui/lib/context';
import {useScopedResetClass} from '@jsonjoy.com/ui/lib/context/ScopedResetContext';
import {useToasts} from '@jsonjoy.com/ui/lib/7-fullscreen/ToastCardManager/context';
import {ToastCardManager} from '@jsonjoy.com/ui/lib/7-fullscreen/ToastCardManager';
import {Provider as StylesProvider} from '@jsonjoy.com/ui/lib/styles/context';
import {MuTxtState} from './state/MuTxtState';
import {decorActiveSelection} from './behavior/active-selection';
import {FONT_FAMILIES} from './behavior/font';
import {Sizer} from '@jsonjoy.com/ui/lib/5-block/Sizer';
import {s} from 'json-joy/lib/json-crdt';
import {ModelWithExt} from 'json-joy/lib/json-crdt-extensions';
import type {ObjNode} from 'json-joy/lib/json-crdt';
import type {ObjApi} from 'json-joy/lib/json-crdt';
import type {PresenceManager} from '@jsonjoy.com/collaborative-presence';
import type {CustomElement, EditableWidth, SlateEditorDocument} from './types';
import type {PeritextRef} from '@jsonjoy.com/collaborative-peritext';
import type {MuTxtApi} from './state/MuTxtApi';

import './loadFonts';

const KeyboardShortcutsModal = React.lazy(() =>
  import('./chrome/KeyboardShortcuts').then((m) => ({default: m.KeyboardShortcutsModal})),
);

const EmbedDocsModal = React.lazy(() => import('./chrome/EmbedDocs').then((m) => ({default: m.EmbedDocsModal})));

const TranslitMapModal = React.lazy(() =>
  import('./translit/TranslitMapModal').then((m) => ({default: m.TranslitMapModal})),
);

const computeEditableWidth = (shellWidth: number, kind: EditableWidth): number => {
  return kind === 'mid'
    ? Math.max(780, Math.min(900, Math.round(shellWidth * 0.6)))
    : kind === 'wide'
      ? Math.max(900, Math.min(1200, Math.round(shellWidth * 0.7)))
      : Math.max(640, Math.min(780, Math.round(shellWidth * 0.5)));
};

const renderElement = (props: RenderElementProps) => <BlockElement {...(props as any)} />;

const shellClass = rule({
  pos: 'relative',
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

// Host for MathLive's `<math-field>` virtual keyboard when in fullwindow /
// fullscreen mode.
const mathKbdHostClass = rule({
  pos: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  '& .MLK__backdrop': {
    pointerEvents: 'auto',
  },
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

  /**
   * Theme override coming from the embedding environment. Takes precedence
   * over the surrounding `UiProvider` theme. Falls back to the system
   * preference when no parent `UiProvider` is present. The internal
   * MuTxt-level override stored on the document (see `MuTxtState#theme`)
   * always takes precedence over this prop.
   */
  theme?: 'light' | 'dark';
}

interface MuTxtInnerProps extends MuTxtProps {
  state: MuTxtState;
  editor: ReturnType<typeof withTitleSubmit>;
}

const MuTxtInner: React.FC<MuTxtInnerProps> = ({
  state,
  editor,
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
}) => {
  const styles = useStyles();
  const scopedResetClass = useScopedResetClass();
  const peritextRef: PeritextRef = state.peritextRef;

  // --------------------------------------------------------- Presence manager
  const {decorate: decorateRemoteCursors, sendLocalPresence} = useSlatePresence({
    manager: presence,
    peritext: peritextRef,
    editor,
    userFromMeta: (meta: any) => (meta ? {name: meta.name, color: meta.color} : undefined),
  });
  // biome-ignore lint/correctness/useExhaustiveDependencies: state instance is stable for the lifetime of the component
  useEffect(() => {
    state.publishPresence = sendLocalPresence;
  }, [sendLocalPresence]);

  // ----------------------------------------------------------- Toasts binding
  const toasts = useToasts();
  useEffect(() => {
    state.toasts = toasts;
    return () => {
      if (state.toasts === toasts) state.toasts = undefined;
    };
  }, [state, toasts]);

  // -------------------------------------------------------- Slate decorations
  const linkPopupOpen = state.inline.link.open.use();
  const activeSelectionRange = state.inline.link.rangeSnapshot.use();
  const omniOpen = state.omni.open.use();
  const omniRange = state.omni.rangeSnapshot.use();
  const shortcutsOpen = state.shortcutsOpen.use();
  const embedDocsOpen = state.embedDocsOpen.use();
  const translitMapOpen = state.translit.mapOpen.use();
  const displayMode = state.displayMode.use();
  const font = state.font.use();
  const editableWidthKind = state.editableWidth.use();
  const shellAvailableWidth = state.sizer.width.use();
  const shellDesiredWidth = state.sizer.content.use();
  const actualShellWidth =
    shellAvailableWidth > 0 ? Math.min(shellAvailableWidth, shellDesiredWidth) : shellDesiredWidth;
  const computedEditableWidth =
    actualShellWidth > 0 ? computeEditableWidth(actualShellWidth, editableWidthKind) : undefined;
  const [shellEl, setShellEl] = React.useState<HTMLElement | null>(null);
  const handleShellRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      setShellEl(el);
      state.bindShell(el);
    },
    [state],
  );
  const [mathKbdHostEl, setMathKbdHostEl] = React.useState<HTMLElement | null>(null);

  // MathLive's `<math-field>` virtual keyboard mounts into `document.body` by
  // default. In `fullwindow` and `fullscreen` we mount it inside the shell
  // instead, to ensure it appears above the editor content.
  useEffect(() => {
    const vk = (globalThis as any).window?.mathVirtualKeyboard;
    if (!vk) return;
    const needsHost = displayMode === 'fullwindow' || displayMode === 'fullscreen';
    const next = needsHost && mathKbdHostEl ? mathKbdHostEl : document.body;
    // MathLive throws when
    try {
      vk.container = next;
    } catch {}
    return () => {
      try {
        vk.container = document.body;
      } catch {}
    };
  }, [displayMode, mathKbdHostEl]);

  const decorate = useCallback(
    (entry: Parameters<typeof decorateRemoteCursors>[0]) => {
      const ranges = [...decorateRemoteCursors(entry)];
      if (linkPopupOpen && activeSelectionRange) {
        const linkRange = decorActiveSelection(entry, activeSelectionRange);
        if (linkRange) ranges.push(linkRange as any);
      }
      if (omniOpen && omniRange) {
        const omniDecor = decorActiveSelection(entry, omniRange);
        if (omniDecor) ranges.push(omniDecor as any);
      }
      return ranges;
    },
    [decorateRemoteCursors, linkPopupOpen, activeSelectionRange, omniOpen, omniRange],
  );

  // ---------------------------------------------------------------- Renderers
  const renderLeaf = useMemo(() => {
    const base = (props: RenderLeafProps) => <Leaf {...(props as any)} />;
    return presence ? withPresenceLeaf(base) : base;
  }, [presence]);

  const editableStyle: React.CSSProperties = {
    minHeight,
    maxWidth: contentWidth ?? computedEditableWidth ?? 800,
    color: styles.g(0.15),
    caretColor: styles.g(0),
    fontFamily: FONT_FAMILIES[font],
  };

  let content: React.ReactNode = (
    <Slate
      editor={editor}
      initialValue={editor.children}
      onChange={state.onChange}
      onSelectionChange={state.onSelection}
    >
      <Editable
        ref={(el) => {
          state.editableBox.setEl(el ?? undefined);
          state.bindKbdSource(el);
          state.customStyle.setEditableEl((el as HTMLElement | null) ?? undefined);
        }}
        decorate={decorate}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder={placeholder as any}
        renderPlaceholder={(props) => <Placeholder {...props} />}
        spellCheck
        autoFocus={autoFocus}
        readOnly={readOnly}
        className={editableClass}
        style={editableStyle}
        onFocus={() => state.setFocused(true)}
        onBlur={() => state.setFocused(false)}
      />
      {!shortcutsOpen && !embedDocsOpen && !translitMapOpen && <InlineFloater />}
      {!shortcutsOpen && !embedDocsOpen && !translitMapOpen && <BlockFloater />}
      <LinkFloater />
      <EmbedFloater />
      <FileFloater />
      <InlineMathFloater />
      {!shortcutsOpen && !embedDocsOpen && !translitMapOpen && <OmniFloater />}
      {!shortcutsOpen && !embedDocsOpen && !translitMapOpen && <IndicatorFloater />}
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
            if (!e.currentTarget.contains(e.target as Node)) return;
            if (!state.api.focused() && !(e.target as HTMLElement).closest('[contenteditable]')) {
              e.preventDefault();
              state.api.focus();
            }
          }}
          onMouseUp={(e) => {
            if (!e.currentTarget.contains(e.target as Node)) return;
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
      <MuTxtHeader editor={editor} />
      <div
        ref={(el) => state.customStyle.setBodyEl(el ?? undefined)}
        style={heightFit ? {flex: '1 1 0%', minHeight: 0, display: 'flex', flexDirection: 'column'} : undefined}
      >
        {content}
      </div>
      <MuTxtFooter />
      {shortcutsOpen && (
        <React.Suspense fallback={null}>
          <KeyboardShortcutsModal />
        </React.Suspense>
      )}
      {embedDocsOpen && (
        <React.Suspense fallback={null}>
          <EmbedDocsModal />
        </React.Suspense>
      )}
      {!!translitMapOpen && (
        <React.Suspense fallback={null}>
          <TranslitMapModal />
        </React.Suspense>
      )}
      {!shortcutsOpen && !embedDocsOpen && !translitMapOpen && <SelectAllGuardFloater />}
      <div ref={setMathKbdHostEl} className={mathKbdHostClass} aria-hidden />
      {/* The global `ToastCardManager` in `UiProvider` is at `z-index: 5000`
          in document-body stacking context, so in `fullwindow` it's hidden
          behind the shell (`z-index: 9999`); in `fullscreen` it sits outside
          the fullscreen element and isn't rendered at all. A second manager
          inside the shell subscribes to the same toast service and renders
          inside the shell's stacking context / fullscreen root, so toasts
          remain visible in both full modes. */}
      {(displayMode === 'fullwindow' || displayMode === 'fullscreen') && <ToastCardManager />}
    </>
  );

  const combinedClass =
    (scopedResetClass ? scopedResetClass + ' ' : '') +
    (className || '') +
    shellClass +
    (heightFit ? fitShellClass : '');

  const shellStyle: React.CSSProperties =
    displayMode === 'fullwindow'
      ? {
          ...style,
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          maxWidth: 'none',
          borderRadius: 0,
          zIndex: 9999,
          background: String(styles.bg),
        }
      : (style as React.CSSProperties);

  if (borderless) {
    content = React.createElement('div', {ref: handleShellRef, style: shellStyle, className: combinedClass}, content);
  } else {
    content = React.createElement(
      Paper,
      {
        ref: handleShellRef,
        round: displayMode !== 'fullwindow',
        contrast: true,
        hover: true,
        hoverElevate,
        style: shellStyle,
        className: combinedClass,
      },
      content,
    );
  }

  return (
    <SlateEditorContextProvider state={state}>
      <PortalParentProvider value={displayMode === 'fullscreen' ? shellEl : null}>
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
      </PortalParentProvider>
    </SlateEditorContextProvider>
  );
};

export const MuTxt: React.FC<MuTxtProps> = (props) => {
  const {
    obj,
    fromSlate,
    presence,
    autoFocus,
    readOnly,
    state: _state,
    onApi,
    startWithTitle,
    onTitleSubmit,
    theme: themeProp,
  } = props;

  // ---------------------------------------------- Parent UiProvider detection
  // Read parent context BEFORE wrapping in `EnsureUiProvider` so that
  // `parentServices` is null when no real parent provider is mounted above.
  const parentServices = useUiServices();
  const parentNano = nanoTheme.useTheme();
  const parentResolvedTheme: 'light' | 'dark' | null = parentServices ? (parentNano.isLight ? 'light' : 'dark') : null;

  // ---------------------------------------------------- Title-submit callback
  const onTitleSubmitRef = React.useRef(onTitleSubmit);
  React.useEffect(() => {
    onTitleSubmitRef.current = onTitleSubmit;
  }, [onTitleSubmit]);

  // ------------------------------------------------------------- Editor state
  // biome-ignore lint/correctness/useExhaustiveDependencies: presence/readOnly/fromSlate are init-time only; do not recreate state on change
  const [editor, state] = useMemo(() => {
    const translit = new MuTxtTranslit();
    const editor = withTitleSubmit(
      withTranslit(
        withToc(
          withHr(
            withFile(withMath(withEmbeds(withLinkPaste(withCodeBlockBreaks(withHistory(withReact(createEditor()))))))),
          ),
        ),
        translit,
        {shouldRun: (e) => !isInRawTextBlock(e as any)},
      ),
      () => onTitleSubmitRef.current,
    );
    const state = _state
      ? _state
      : new MuTxtState(
          editor,
          obj ? (obj as ObjApi<ObjNode>) : ModelWithExt.create<any>(s.obj({'@type': s.con('mutxt')})).api.obj([]),
          {collaborative: !!presence, readOnly, fromSlate, translit},
        );
    const editorToReturn = _state ? _state.editor : editor;
    withSelectAllGuard(editorToReturn, {
      onDelete: () => state.selectAllGuard.requestDelete(),
      onReplaceWithText: (text) => state.selectAllGuard.requestReplaceWithText(text),
      onReplaceWithFragment: (fragment) => state.selectAllGuard.requestReplaceWithFragment(fragment),
    });
    return [editorToReturn, state];
  }, [obj, _state]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: autoFocus only applies on initial mount of the owned state
  useEffect(() => {
    if (_state) return; // We don't own the state.
    const stop = state.start();
    if (startWithTitle && state.api.isEmpty()) {
      // Convert the default empty paragraph into an empty title block. This
      // runs after `state.start()` so the operation flows through the active
      // PeritextBinding into the underlying CRDT (rather than being a stale
      // direct mutation of `editor.children`).
      Transforms.setNodes(editor, {type: 'title'} as Partial<CustomElement>, {at: [0]});
    }
    let focusTimer: any | undefined;
    if (autoFocus) focusTimer = setTimeout(() => state.api.focus(), 101);
    return () => {
      stop();
      clearTimeout(focusTimer);
    };
  }, [_state, state, startWithTitle, editor]);
  useIsomorphicLayoutEffect(() => {
    onApi?.(state.api);
  }, []);

  // ---------------------------------------------------- Props synchronization
  useEffect(() => {
    state.setReadOnly(!!readOnly);
  }, [state, readOnly]);

  // -------------------------------------------------------------------- Theme
  const themeOverride = state.theme.use();
  const systemDark = state.systemDark.use();
  let resolvedTheme: 'light' | 'dark';
  if (themeOverride === 'light' || themeOverride === 'dark') resolvedTheme = themeOverride;
  else if (themeOverride === 'auto') resolvedTheme = systemDark ? 'dark' : 'light';
  else if (themeProp === 'light' || themeProp === 'dark') resolvedTheme = themeProp;
  else if (parentResolvedTheme) resolvedTheme = parentResolvedTheme;
  else resolvedTheme = systemDark ? 'dark' : 'light';

  return (
    <EnsureUiProvider>
      <nanoTheme.Provider theme={resolvedTheme}>
        <StylesProvider dark={resolvedTheme === 'dark'}>
          <MuTxtInner {...props} state={state} editor={editor} />
        </StylesProvider>
      </nanoTheme.Provider>
    </EnsureUiProvider>
  );
};
