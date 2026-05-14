import {rsync, type UiLifeCycles} from '@jsonjoy.com/ui';
import type {ToastService} from '@jsonjoy.com/ui/lib/7-fullscreen/ToastCardManager/services/ToastService';
import {KeyContext, KeySourceEl} from '@jsonjoy.com/keyboard';
import {getActiveAlignment} from '../behavior';
import {getCaretPathInfo} from '../behavior/path-info';
import {type DocumentOutlineItem, getDocumentOutline} from '../behavior/outline';
import {getEditorPlainText, getSelectedText, getWordCount} from '../util/index';
import {watch} from '../util/watch';
import {bindShortcuts} from '../behavior/keyboard';
import {bindImagePaste} from '../behavior/imagePaste';
import {MuTxtApi} from './MuTxtApi';
import {FromSlate, SlateFacade} from '@jsonjoy.com/collaborative-slate';
import {toSlate} from '@jsonjoy.com/collaborative-slate/lib/sync/toSlate';
import {PeritextBinding} from '@jsonjoy.com/collaborative-peritext/lib/PeritextBinding';
import {Range, type BaseEditor, type Descendant, type Path, type Selection} from 'slate';
import {ElBox} from '@jsonjoy.com/ui/lib/utils/rsync';
import {SizerState} from '@jsonjoy.com/ui/lib/5-block/Sizer';
import {windowSize} from '@jsonjoy.com/ui/lib/utils/windowSize';
import {ScrollState} from '@jsonjoy.com/ui/lib/4-card/ScrollArea';
import {InlineState} from '../inline/InlineState';
import {BlockState} from '../block/BlockState';
import {VoidState} from '../void/VoidState';
import {OmniState} from '../omni/OmniState';
import {SelectAllGuardState} from '../guard/SelectAllGuardState';
import {DocumentMenu} from './DocumentMenu';
import {IndicatorState} from './IndicatorState';
import {ThingStore} from './ThingStore';
import {CustomStyleState} from '../custom-style/CustomStyleState';
import {MuTxtTranslit} from '../translit/MuTxtTranslit';
import {s} from 'json-joy/lib/json-crdt';
import {ext} from 'json-joy/lib/json-crdt-extensions';
import {isFontKind} from '../behavior/font';
import type {ObjApi, ObjNode} from 'json-joy/lib/json-crdt';
import type {PeritextApi} from 'json-joy/lib/json-crdt-extensions';
import type {PeritextRef} from '@jsonjoy.com/collaborative-peritext';
import type {ReactEditor} from 'slate-react';
import type {
  CustomElement,
  DisplayMode,
  EditableWidth,
  FontKind,
  MathInlineElement,
  SlateEditorDocument,
  SlateTextAlign,
} from '../types';
export type {DocumentOutlineItem};
import type {HistoryEditor} from 'slate-history';

const isEditableWidth = (v: unknown): v is EditableWidth => v === 'narrow' || v === 'mid' || v === 'wide';

export type ThemeOverride = 'auto' | 'light' | 'dark';
const isThemeOverride = (v: unknown): v is ThemeOverride => v === 'auto' || v === 'light' || v === 'dark';

const createEmptyDocument = (): SlateEditorDocument => [{type: 'p', children: [{text: ''}]} as CustomElement];
const normalizeDocument = (value?: SlateEditorDocument): SlateEditorDocument =>
  value && value.length ? value : createEmptyDocument();

export interface MuTxtStateOpts {
  collaborative?: boolean;
  readOnly?: boolean;
  fromSlate?: SlateEditorDocument;
  translit?: MuTxtTranslit;
}

export class MuTxtState implements UiLifeCycles {
  public readonly api = new MuTxtApi(this);
  public readonly scroll: ScrollState = new ScrollState({
    railWidth: 12,
    hideDelay: 5000,
  });

  public readonly version = rsync.val(0);
  public readonly contentVersion = rsync.val(0);
  public readonly scrollVersion = rsync.val(0);

  public readonly sizer: SizerState;
  public readonly editableBox: ElBox<HTMLDivElement> = new ElBox<HTMLDivElement>();
  /**
   * Measures the outer Paper shell. Differs from {@link sizer}.width in
   * `fullwindow` and `fullscreen` modes, where the shell escapes the inline
   * layout (fixed-position 100vw, or native browser fullscreen at screen
   * size) — `sizer.width` would still report the inline container's width.
   */
  public readonly shellBox: ElBox<HTMLElement> = new ElBox<HTMLElement>();
  public readonly wnd = windowSize();

  public readonly kbd: KeyContext = new KeyContext(undefined, 'mutxt');
  private kbdSourceUnbind?: () => void;

  /** Current cursor position (caret or range). */
  public readonly cursor = rsync.val<Selection | null>(null);
  /** Caret selection. */
  public readonly caret = rsync.val<Selection | null>(null);
  /** Range selection. */
  public readonly selection = rsync.val<Selection | null>(null);

  public readonly focused = rsync.val(false);
  public readonly readOnly = rsync.val(false);
  public readonly blockLabel = rsync.val('Paragraph');
  public readonly caretPath = rsync.val<string[]>([]);
  public readonly caretLinkHref = rsync.val('');
  public readonly caretEmbedUrl = rsync.val('');
  public readonly caretCodeText = rsync.val('');
  public readonly caretMathThingId = rsync.val('');
  public readonly alignment = rsync.val<SlateTextAlign>('left');
  public readonly wordCount = rsync.val(0);
  public readonly characterCount = rsync.val(0);
  public readonly selectionText = rsync.val('');

  public readonly inline = new InlineState(this, this.scroll);
  public readonly block = new BlockState(this, this.scroll);
  public readonly voids = new VoidState(this);
  public readonly omni = new OmniState(this);
  public readonly selectAllGuard = new SelectAllGuardState(this);
  public readonly indicator = new IndicatorState(this);
  public readonly docMenu = new DocumentMenu(this);
  public readonly things = new ThingStore(this);
  public readonly customStyle = new CustomStyleState(this);
  public readonly translit: MuTxtTranslit;

  /** Whether the keyboard-shortcuts modal is open. */
  public readonly shortcutsOpen = rsync.val(false);

  /** Whether the developer "embed this editor" docs modal is open. */
  public readonly embedDocsOpen = rsync.val(false);

  /** Current rendering display mode. */
  public readonly displayMode = rsync.val<DisplayMode>('inline');

  /** Document-level typeface family. */
  public readonly font = rsync.val<FontKind>('sans');

  /** Editable content area width preset. */
  public readonly editableWidth = rsync.val<EditableWidth>('mid');

  /** MuTxt-internal theme override. When unset, the UiProvider theme applies. */
  public readonly theme = rsync.val<ThemeOverride | undefined>(undefined);

  /** Whether the OS/browser currently reports a dark color-scheme preference. */
  public readonly systemDark = rsync.val<boolean>(
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false,
  );

  /** The shell element wrapping the entire editor (header, content, footer). */
  public shellEl: HTMLElement | null = null;

  public publishPresence?: () => void;
  public requestLinkMenu?: () => void;

  public toasts?: ToastService;

  public onTitleSubmit?: (title: string) => void = void 0;

  public readonly peritextRef: PeritextRef;

  constructor(
    public readonly editor: BaseEditor & ReactEditor & HistoryEditor,
    public readonly obj: ObjApi<ObjNode>,
    opts?: MuTxtStateOpts,
  ) {
    this.readOnly.next(!!opts?.readOnly);
    this.translit = opts?.translit ?? new MuTxtTranslit();
    this.translit.bindState(this);
    if (obj.read('/@type') !== 'mutxt') obj.set({'@type': s.con('mutxt')});
    let peritextNode: PeritextApi;
    let isNewDocument = false;
    try {
      peritextNode = obj.in(['text']).asExt(ext.peritext);
    } catch {
      isNewDocument = true;
      obj.set({text: ext.peritext.new('')});
      peritextNode = obj.in(['text']).asExt(ext.peritext);
    }
    this.peritextRef = () => peritextNode;
    if (isNewDocument && opts?.fromSlate) {
      const viewRange = FromSlate.convert(normalizeDocument(opts.fromSlate) as any);
      const txt = this.peritextRef().peritext();
      txt.editor.merge(viewRange);
      txt.refresh();
    }
    let initialValue: Descendant[];
    try {
      initialValue = toSlate(this.peritextRef().peritext()) as Descendant[];
      if (!initialValue.length) initialValue = createEmptyDocument() as Descendant[];
    } catch {
      initialValue = createEmptyDocument() as Descendant[];
    }
    this.sizer = new SizerState(Number(obj.read('/width')) || 1330);
    const storedFont = obj.read('/font');
    if (isFontKind(storedFont)) this.font.next(storedFont);
    const storedEditableWidth = obj.read('/ew');
    if (isEditableWidth(storedEditableWidth)) this.editableWidth.next(storedEditableWidth);
    const storedTheme = obj.read('/theme');
    if (isThemeOverride(storedTheme)) this.theme.next(storedTheme);
    editor.children = initialValue;
    editor.selection = null;
    (editor as any).onOpenInlineMathEdit = (element: MathInlineElement, path: Path) => {
      this.inline.math.openEdit(element, path);
    };
  }

  public start(): () => void {
    // -------------------------------------------------- Collaboration binding
    const facade = new SlateFacade(this.editor, this.peritextRef);
    const unbindCollaboration = PeritextBinding.bind(this.peritextRef, facade);
    queueMicrotask(() => this.sync(true));
    // -------------------------------------------------------------- Scrolling
    const scrollUnsubscribe = this.scroll.scrollTop$.subscribe(() => {
      this.scrollVersion.next(this.scrollVersion.value + 1);
    });
    // ------------------------------------------------ Sizer width persistence
    const stopSizerPersist = watch(this.sizer.content, 600, 1, (w) => {
      if (w > 0 && !this.readOnly.value) this.obj.add('/width', Math.round(w));
    });

    const stopInline = this.inline.start();
    const stopBlock = this.block.start();
    const stopVoids = this.voids.start();
    const stopOmni = this.omni.start();
    const stopSelectAllGuard = this.selectAllGuard.start();
    const stopIndicator = this.indicator.start();
    const stopThings = this.things.start();
    const stopCustomStyle = this.customStyle.start();
    const stopTranslit = this.translit.start();
    const unbindShortcuts = bindShortcuts(this);
    bindImagePaste(this);

    // --------------------------------------------- Native fullscreen tracking
    // Keep `displayMode` in sync when the user exits fullscreen via Esc or
    // when the browser drops out of fullscreen for any other reason.
    const onFullscreenChange = (): void => {
      const inNativeFullscreen = !!document.fullscreenElement;
      const mode = this.displayMode.value;
      if (!inNativeFullscreen && mode === 'fullscreen') this.displayMode.set('inline');
    };
    if (typeof document !== 'undefined') document.addEventListener('fullscreenchange', onFullscreenChange);

    // ------------------------------------------- System color-scheme tracking
    let systemDarkMq: MediaQueryList | undefined;
    let onSystemDarkChange: ((e: MediaQueryListEvent) => void) | undefined;
    if (typeof window !== 'undefined' && window.matchMedia) {
      systemDarkMq = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemDark.set(systemDarkMq.matches);
      onSystemDarkChange = (e) => this.systemDark.set(e.matches);
      systemDarkMq.addEventListener('change', onSystemDarkChange);
    }

    return () => {
      unbindCollaboration();
      scrollUnsubscribe();
      stopSizerPersist();
      stopInline();
      stopBlock();
      stopVoids();
      stopOmni();
      stopSelectAllGuard();
      stopIndicator();
      stopThings();
      stopCustomStyle();
      stopTranslit();
      unbindShortcuts();
      if (typeof document !== 'undefined') document.removeEventListener('fullscreenchange', onFullscreenChange);
      if (systemDarkMq && onSystemDarkChange) systemDarkMq.removeEventListener('change', onSystemDarkChange);
      this.kbdSourceUnbind?.();
      this.kbdSourceUnbind = undefined;
      this.kbd.dispose();
    };
  }

  public readonly bindKbdSource = (el: HTMLElement | null): void => {
    this.kbdSourceUnbind?.();
    this.kbdSourceUnbind = undefined;
    if (el) {
      const source = new KeySourceEl(el);
      this.kbdSourceUnbind = source.bind(this.kbd);
    }
  };

  public readonly setFocused = (focused: boolean): void => {
    this.focused.set(focused);
  };

  public readonly setReadOnly = (readOnly: boolean): void => {
    this.readOnly.set(readOnly);
  };

  public readonly setFont = (kind: FontKind): void => {
    if (this.font.value === kind) return;
    if (this.readOnly.value) return;
    this.font.set(kind);
    this.obj.add('/font', kind);
  };

  public readonly setEditableWidth = (kind: EditableWidth): void => {
    if (this.editableWidth.value === kind) return;
    if (this.readOnly.value) return;
    this.editableWidth.set(kind);
    this.obj.add('/ew', kind);
  };

  public readonly setTheme = (value: ThemeOverride | undefined): void => {
    if (this.theme.value === value) return;
    if (this.readOnly.value) return;
    this.theme.set(value);
    if (value === undefined) this.obj.del(['theme']);
    else this.obj.add('/theme', value);
  };

  public readonly setDisplayMode = (mode: DisplayMode): void => {
    const current = this.displayMode.value;
    if (current === mode) return;
    if (current === 'fullscreen' && document.fullscreenElement) document.exitFullscreen().catch(() => {});
    if (mode === 'fullscreen') {
      const target = this.shellEl ?? document.documentElement;
      target.requestFullscreen?.().catch(() => {});
    }
    this.displayMode.set(mode);
  };

  public readonly bindShell = (el: HTMLElement | null): void => {
    this.shellEl = el;
    this.shellBox.setEl(el ?? void 0);
  };

  public readonly sync = (contentChanged: boolean): void => {
    const {version, contentVersion, editor, cursor, selection} = this;
    version.next(version.value + 1);
    if (contentChanged) contentVersion.next(contentVersion.value + 1);

    const {selection: editorSelection} = editor;
    let nextSelection: Selection | null = null;
    let nextCaret: Selection | null = null;
    if (editorSelection) {
      const isCollapsed = Range.isCollapsed(editorSelection);
      if (!isCollapsed) nextSelection = editorSelection;
      else nextCaret = editorSelection;
    }
    if (editorSelection !== cursor.value) cursor.next(editorSelection);
    if (nextSelection !== selection.value) selection.next(nextSelection);
    if (nextCaret !== this.caret.value) this.caret.next(nextCaret);

    const text = getEditorPlainText(editor);
    const caret = getCaretPathInfo(editor);
    this.wordCount.set(getWordCount(text));
    this.characterCount.set(text.length);
    this.blockLabel.set(this.api.blockLabel());
    this.caretPath.set(caret.path);
    this.caretLinkHref.set(caret.linkHref ?? '');
    this.caretEmbedUrl.set(caret.embedUrl ?? '');
    this.caretCodeText.set(caret.codeText ?? '');
    this.caretMathThingId.set(caret.mathThingId ?? '');
    this.alignment.set(getActiveAlignment(editor));
    this.selectionText.set(getSelectedText(editor));
    this.publishPresence?.();
  };

  public readonly onChange = () => {
    this.sync(true);
  };

  public readonly onSelection = () => {
    this.sync(false);
  };

  // --------------------------------------------------------- Document outline

  /** Cached document outline, recomputed when content changes. */
  private _outlineVersion = -1;
  private _outlineCache: DocumentOutlineItem[] = [];

  /**
   * Returns the document heading outline. The result is cached per
   * `contentVersion`, so repeated calls within the same content revision are
   * cheap. Consumers that want re-render reactivity should call this from a
   * component that subscribes to `contentVersion`.
   */
  public readonly outline = (): DocumentOutlineItem[] => {
    const version = this.contentVersion.value;
    if (this._outlineVersion === version) return this._outlineCache;
    this._outlineCache = getDocumentOutline(this.editor.children as SlateEditorDocument);
    this._outlineVersion = version;
    return this._outlineCache;
  };
}
