import {rsync} from '@jsonjoy.com/ui';
import {getActiveAlignment} from '../behavior';
import {getCaretPathInfo, getEditorPlainText, getSelectedText, getWordCount} from '../util/index';
import {MuTxtApi} from './MuTxtApi';
import {SlateFacade} from '@jsonjoy.com/collaborative-slate';
import {PeritextBinding} from '@jsonjoy.com/collaborative-peritext/lib/PeritextBinding';
import {Range, type BaseEditor, type Selection} from 'slate';
import {ElBox} from '@jsonjoy.com/ui/lib/utils/rsync';
import type {PeritextRef} from '@jsonjoy.com/collaborative-peritext';
import type {SlateTextAlign} from '../types';
import type {HistoryEditor} from 'slate-history';
import {ReactEditor} from 'slate-react';

export interface MuTxtStateOpts {}

export class MuTxtState {
  public readonly api = new MuTxtApi(this);

  public readonly version = rsync.val(0);
  public readonly contentVersion = rsync.val(0);
  public readonly scrollVersion = rsync.val(0);
  
  public editableBox?: ElBox<HTMLDivElement>;

  /** Current cursor position. */
  public readonly cursor = rsync.val<Selection | null>(null);
  /** Range selection. */
  public readonly selection = rsync.val<Selection | null>(null);

  public readonly focused = rsync.val(false);
  public readonly readOnly = rsync.val(false);
  public readonly blockLabel = rsync.val('Paragraph');
  public readonly caretPath = rsync.val<string[]>([]);
  public readonly caretLinkHref = rsync.val('');
  public readonly caretEmbedUrl = rsync.val('');
  public readonly alignment = rsync.val<SlateTextAlign>('left');
  public readonly wordCount = rsync.val(0);
  public readonly characterCount = rsync.val(0);
  public readonly selectionText = rsync.val('');

  public publishPresence?: () => void;
  public requestLinkMenu?: () => void;

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
    return () => {
      unbindCollaboration();
    };
  }

  public readonly setFocused = (focused: boolean): void => {
    this.focused.set(focused);
  };

  public readonly setReadOnly = (readOnly: boolean): void => {
    this.readOnly.set(readOnly);
  };

  public refreshScrollMap() {
    this.scrollVersion.next(this.scrollVersion.value + 1);
  }

  public readonly sync = (contentChanged: boolean): void => {
    this.refreshScrollMap();
    const {version, contentVersion, editor, cursor, selection} = this;
    version.next(version.value + 1);
    if (contentChanged) contentVersion.next(contentVersion.value + 1);

    const {selection: editorSelection} = editor;
    cursor.next(editorSelection);
    selection.next(editorSelection && !Range.isCollapsed(editorSelection) ? editorSelection : null);

    const text = getEditorPlainText(editor);
    const caret = getCaretPathInfo(editor);
    this.wordCount.set(getWordCount(text));
    this.characterCount.set(text.length);
    this.blockLabel.set(this.api.blockLabel());
    this.caretPath.set(caret.path);
    this.caretLinkHref.set(caret.linkHref ?? '');
    this.caretEmbedUrl.set(caret.embedUrl ?? '');
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
