import {rsync} from '@jsonjoy.com/ui';
import {getActiveAlignment} from './behavior';
import {getCaretPathInfo, getCharacterCount, getCurrentBlockLabel, getEditorPlainText, getSelectedText, getWordCount} from './util';
import type {Editor} from 'slate';
import type {SlateTextAlign} from './types';

export class SlateEditorState {
  public readonly focused = rsync.val(false);
  public readonly collaborative = rsync.val(false);
  public readonly readOnly = rsync.val(false);
  public readonly linkMenuRequest = rsync.val(0);
  public readonly currentBlock = rsync.val('Paragraph');
  public readonly caretPath = rsync.val<string[]>([]);
  public readonly caretLinkHref = rsync.val('');
  public readonly alignment = rsync.val<SlateTextAlign>('left');
  public readonly wordCount = rsync.val(0);
  public readonly characterCount = rsync.val(0);
  public readonly selectionText = rsync.val('');

  constructor(opts?: {collaborative?: boolean; readOnly?: boolean}) {
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

  public readonly sync = (editor: Editor): void => {
    const text = getEditorPlainText(editor);
    const caret = getCaretPathInfo(editor);
    this.wordCount.set(getWordCount(text));
    this.characterCount.set(text.length);
    this.currentBlock.set(getCurrentBlockLabel(editor));
    this.caretPath.set(caret.path);
    this.caretLinkHref.set(caret.linkHref ?? '');
    this.alignment.set(getActiveAlignment(editor));
    this.selectionText.set(getSelectedText(editor));
  };
}
