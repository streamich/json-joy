import {rsync} from '@jsonjoy.com/ui';
import {getActiveAlignment} from './behavior';
import {getCharacterCount, getCurrentBlockLabel, getEditorPlainText, getSelectedText, getWordCount} from './util';
import type {Editor} from 'slate';
import type {SlateTextAlign} from './types';

export class SlateEditorState {
  public readonly focused = rsync.val(false);
  public readonly collaborative = rsync.val(false);
  public readonly readOnly = rsync.val(false);
  public readonly currentBlock = rsync.val('Paragraph');
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

  public readonly sync = (editor: Editor): void => {
    const text = getEditorPlainText(editor);
    this.wordCount.set(getWordCount(text));
    this.characterCount.set(getCharacterCount(text));
    this.currentBlock.set(getCurrentBlockLabel(editor));
    this.alignment.set(getActiveAlignment(editor));
    this.selectionText.set(getSelectedText(editor));
  };
}
