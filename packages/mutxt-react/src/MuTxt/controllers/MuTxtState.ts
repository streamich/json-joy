import {rsync} from '@jsonjoy.com/ui';
import {getActiveAlignment} from '../behavior';
import {getCaretPathInfo, getCurrentBlockLabel, getEditorPlainText, getSelectedText, getWordCount} from '../util/index';
import {MuTxtApi} from './MuTxtApi';
import type {SlateTextAlign} from '../types';
import type {BaseEditor, Editor} from 'slate';
import type {HistoryEditor} from 'slate-history';
import type {ReactEditor} from 'slate-react';

export interface MuTxtStateOpts {
  // editor: BaseEditor & ReactEditor & HistoryEditor; 
}

export class MuTxtState {
  public readonly api = new MuTxtApi(this);
  public readonly focused = rsync.val(false);
  public readonly collaborative = rsync.val(false);
  public readonly readOnly = rsync.val(false);
  public readonly toolbarVersion = rsync.val(0);
  public readonly linkMenuRequest = rsync.val(0);
  public readonly currentBlock = rsync.val('Paragraph');
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

  constructor(
    public readonly editor: BaseEditor & ReactEditor & HistoryEditor,
    opts?: {collaborative?: boolean; readOnly?: boolean},
  ) {
    this.collaborative.next(!!opts?.collaborative);
    this.readOnly.next(!!opts?.readOnly);
  }

  public readonly setFocused = (focused: boolean): void => {
    this.focused.set(focused);
  };

  public readonly setCollaborative = (collaborative: boolean): void => {
    this.collaborative.set(collaborative);
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

  public readonly dispose = (): void => {
    // No-op. State currently owns only synchronous rsync values.
  };

  public readonly sync = (editor: Editor): void => {
    const text = getEditorPlainText(editor);
    const caret = getCaretPathInfo(editor);
    this.toolbarVersion.next(this.toolbarVersion.value + 1);
    this.wordCount.set(getWordCount(text));
    this.characterCount.set(text.length);
    this.currentBlock.set(getCurrentBlockLabel(editor));
    this.caretPath.set(caret.path);
    this.caretLinkHref.set(caret.linkHref ?? '');
    this.caretEmbedUrl.set(caret.embedUrl ?? '');
    this.alignment.set(getActiveAlignment(editor));
    this.selectionText.set(getSelectedText(editor));
  };
}
