import {rsync, type UiLifeCycles} from '@jsonjoy.com/ui';
import {isFullDocSelected, resetDocumentContent} from '../behavior/selectAllGuard';
import {getEditorPlainText} from '../util';
import type {Node as SlateNode} from 'slate';
import type {MuTxtState} from '../state/MuTxtState';

const SELECT_ALL_GUARD_THRESHOLD = 200;

export type PendingAction =
  | {readonly kind: 'delete'}
  | {readonly kind: 'replace-text'; readonly text: string}
  | {readonly kind: 'replace-fragment'; readonly fragment: SlateNode[]};

/**
 * Tracks the "are you sure you want to wipe the document?" prompt that
 * appears when the user triggers Backspace / Delete / typing while the entire
 * document is selected.
 */
export class SelectAllGuardState implements UiLifeCycles {
  public readonly open = rsync.val(false);
  public readonly pending = rsync.val<PendingAction | null>(null);

  constructor(public readonly mutxt: MuTxtState) {}

  public start = (): (() => void) => () => {};

  private readonly guard = (action: PendingAction): boolean => {
    const {mutxt} = this;
    if (mutxt.readOnly.value) return false;
    const editor = mutxt.editor;
    if (!isFullDocSelected(editor)) return false;
    if (getEditorPlainText(editor).length < SELECT_ALL_GUARD_THRESHOLD) return false;
    this.pending.set(action);
    this.open.set(true);
    return true;
  };

  public readonly requestDelete = (): boolean => this.guard({kind: 'delete'});
  public readonly requestReplaceWithText = (text: string): boolean =>
    this.guard({kind: 'replace-text', text});
  public readonly requestReplaceWithFragment = (fragment: SlateNode[]): boolean =>
    this.guard({kind: 'replace-fragment', fragment});

  public readonly confirm = (): void => {
    const action = this.pending.value;
    this.close();
    if (!action) return;
    const {mutxt} = this;
    const {editor} = mutxt;
    if (action.kind === 'delete') {
      resetDocumentContent(editor);
    } else if (action.kind === 'replace-text') {
      resetDocumentContent(editor, action.text);
    } else {
      resetDocumentContent(editor);
      editor.insertFragment(action.fragment);
    }
    mutxt.api.focus();
  };

  public readonly cancel = (): void => {
    this.close();
    this.mutxt.api.focus();
  };

  public readonly close = (): void => {
    if (this.open.value) this.open.set(false);
    if (this.pending.value) this.pending.set(null);
  };
}
