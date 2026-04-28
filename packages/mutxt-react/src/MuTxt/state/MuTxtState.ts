import {rsync, UiLifeCycles} from '@jsonjoy.com/ui';
import {KeyContext, KeySourceEl} from '@jsonjoy.com/keyboard';
import {getActiveAlignment} from '../behavior';
import {getCaretPathInfo} from '../behavior/path-info';
import {getEditorPlainText, getSelectedText, getWordCount} from '../util/index';
import {bindShortcuts} from '../behavior/keyboard';
import {MuTxtApi} from './MuTxtApi';
import {SlateFacade} from '@jsonjoy.com/collaborative-slate';
import {PeritextBinding} from '@jsonjoy.com/collaborative-peritext/lib/PeritextBinding';
import {Range, type BaseEditor, type Selection} from 'slate';
import {ElBox} from '@jsonjoy.com/ui/lib/utils/rsync';
import {windowSize} from '@jsonjoy.com/ui/lib/utils/windowSize';
import {ReactEditor} from 'slate-react';
import {ScrollState} from '@jsonjoy.com/ui/lib/4-card/ScrollArea';
import {InlineState} from '../inline/InlineState';
import {BlockState} from '../block/BlockState';
import {VoidState} from '../void/VoidState';
import type {PeritextRef} from '@jsonjoy.com/collaborative-peritext';
import type {SlateTextAlign} from '../types';
import type {HistoryEditor} from 'slate-history';

export interface MuTxtStateOpts {}

export class MuTxtState implements UiLifeCycles {
  public readonly api = new MuTxtApi(this);
  public readonly scroll: ScrollState = new ScrollState({
    railWidth: 12,
    hideDelay: 5000,
  });

  public readonly version = rsync.val(0);
  public readonly contentVersion = rsync.val(0);
  public readonly scrollVersion = rsync.val(0);

  public readonly editableBox: ElBox<HTMLDivElement> = new ElBox<HTMLDivElement>();
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
  public readonly alignment = rsync.val<SlateTextAlign>('left');
  public readonly wordCount = rsync.val(0);
  public readonly characterCount = rsync.val(0);
  public readonly selectionText = rsync.val('');

  public readonly inline = new InlineState(this, this.scroll);
  public readonly block = new BlockState(this, this.scroll);
  public readonly voids = new VoidState(this);

  public publishPresence?: () => void;
  public requestLinkMenu?: () => void;

  /**
   * Called when the user presses "/". Returns true if the key was consumed
   * (the slash menu opened and the "/" character should not be inserted).
   */
  public onSlashKey?: () => boolean;

  constructor(
    public readonly editor: BaseEditor & ReactEditor & HistoryEditor,
    public readonly peritextRef: PeritextRef,
    opts?: {collaborative?: boolean; readOnly?: boolean},
  ) {
    this.readOnly.next(!!opts?.readOnly);
  }

  public start(): (() => void) {
    // -------------------------------------------------- Collaboration binding
    const facade = new SlateFacade(this.editor, this.peritextRef);
    const unbindCollaboration = PeritextBinding.bind(this.peritextRef, facade);
    queueMicrotask(() => this.sync(true));
    // -------------------------------------------------------------- Scrolling
    const scrollUnsubscribe = this.scroll.scrollTop$.subscribe(() => {
      this.scrollVersion.next(this.scrollVersion.value + 1);
    });

    const stopInline = this.inline.start();
    const stopBlock = this.block.start();
    const stopVoids = this.voids.start();
    const unbindShortcuts = bindShortcuts(this);

    return () => {
      unbindCollaboration();
      scrollUnsubscribe();
      stopInline();
      stopBlock();
      stopVoids();
      unbindShortcuts();
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

  public readonly sync = (contentChanged: boolean): void => {
    const {version, contentVersion, editor, cursor, selection} = this;
    version.next(version.value + 1);
    if (contentChanged) contentVersion.next(contentVersion.value + 1);

    const {selection: editorSelection} = editor;
    let nextSelection: Selection | null = null;
    let nextCaret: Selection | null = null;
    if (editorSelection) {
      const isCollapsed = Range.isCollapsed(editorSelection);
      if (!isCollapsed) nextSelection = editorSelection; else nextCaret = editorSelection;
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
}
