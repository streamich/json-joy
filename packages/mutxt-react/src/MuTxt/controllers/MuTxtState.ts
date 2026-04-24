import {rsync} from '@jsonjoy.com/ui';
import {getActiveAlignment} from '../behavior';
import {getCaretPathInfo, getEditorPlainText, getSelectedText, getWordCount} from '../util/index';
import {MuTxtApi} from './MuTxtApi';
import {SlateFacade} from '@jsonjoy.com/collaborative-slate';
import {PeritextBinding} from '@jsonjoy.com/collaborative-peritext/lib/PeritextBinding';
import type {PeritextRef} from '@jsonjoy.com/collaborative-peritext';
import type {SlateTextAlign} from '../types';
import type {BaseEditor, Editor} from 'slate';
import type {HistoryEditor} from 'slate-history';
import type {ReactEditor} from 'slate-react';

export interface MuTxtStateOpts {}

export class MuTxtState {
  public readonly api = new MuTxtApi(this);
  public readonly focused = rsync.val(false);
  public readonly readOnly = rsync.val(false);
  public readonly toolbarVersion = rsync.val(0);
  public readonly linkMenuRequest = rsync.val(0);
  public readonly blockLabel = rsync.val('Paragraph');
  public readonly caretPath = rsync.val<string[]>([]);
  public readonly caretLinkHref = rsync.val('');
  public readonly caretEmbedUrl = rsync.val('');
  public readonly alignment = rsync.val<SlateTextAlign>('left');
  public readonly wordCount = rsync.val(0);
  public readonly characterCount = rsync.val(0);
  public readonly selectionText = rsync.val('');
  private readonly scrollMapVersionTrigger = rsync.val(0);
  public readonly scrollMapVersion = this.scrollMapVersionTrigger;
  public readonly contentVersion = rsync.val(0);

  public publishPresence?: () => void;

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
    queueMicrotask(() => this.sync());
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

  public readonly requestLinkMenu = (): void => {
    this.linkMenuRequest.next(this.linkMenuRequest.value + 1);
  };

  public readonly requestScrollMapRefresh = (): void => {
    this.scrollMapVersionTrigger.next(this.scrollMapVersionTrigger.value + 1);
  };

  public readonly sync = (): void => {
    const editor = this.editor;
    const text = getEditorPlainText(editor);
    const caret = getCaretPathInfo(editor);
    this.toolbarVersion.next(this.toolbarVersion.value + 1);
    this.wordCount.set(getWordCount(text));
    this.characterCount.set(text.length);
    this.blockLabel.set(this.api.blockLabel());
    this.caretPath.set(caret.path);
    this.caretLinkHref.set(caret.linkHref ?? '');
    this.caretEmbedUrl.set(caret.embedUrl ?? '');
    this.alignment.set(getActiveAlignment(editor));
    this.selectionText.set(getSelectedText(editor));
  };
}
