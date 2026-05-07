import {rsync} from '@jsonjoy.com/ui';
import {flushSync} from 'react-dom';
import type {Editor, Path} from 'slate';
import {
  getActiveEmbedEntry,
  insertEmbed,
  normalizeEmbedUrl,
  removeEmbedAtPath,
  updateEmbedAtPath,
} from '../../behavior/embed';
import type {MuTxtState} from '../../state/MuTxtState';

export class EmbedButtonState {
  public readonly open = rsync.val(false);
  public readonly draftUrl = rsync.val('');
  public readonly draftCaption = rsync.val('');
  public readonly editingPath = rsync.val<Path | null>(null);
  /** Snapshot of the bounding rect of the trigger element (button or caret). */
  public readonly anchorRect = rsync.val<DOMRect | null>(null);
  public readonly normalizedDraft = rsync.comp([this.draftUrl], ([draftUrl]) => normalizeEmbedUrl(draftUrl));
  public readonly canOpen: rsync.ReactComputed<boolean>;
  public readonly selected: rsync.ReactComputed<boolean>;

  private readonly editor: Editor;

  constructor(public readonly mutxt: MuTxtState) {
    this.editor = mutxt.editor;
    this.canOpen = rsync.comp([mutxt.readOnly], ([readOnly]) => !readOnly);
    this.selected = rsync.comp(
      [mutxt.readOnly, this.open, mutxt.caretEmbedUrl],
      ([readOnly, open, caretEmbedUrl]) => !readOnly && (open || !!caretEmbedUrl),
    );
  }

  public readonly setDraftUrl = (value: string): void => {
    this.draftUrl.set(value);
  };

  public readonly setDraftCaption = (value: string): void => {
    this.draftCaption.set(value);
  };

  public readonly setAnchorRect = (rect: DOMRect | null): void => {
    this.anchorRect.set(rect);
  };

  public readonly setAnchorEl = (el: HTMLElement | null): void => {
    this.anchorRect.set(el ? el.getBoundingClientRect() : null);
  };

  public readonly setAnchorFromCaret = (): void => {
    const rect = this.mutxt.api.focusRect();
    this.anchorRect.set(rect ?? null);
  };

  private readonly syncDraftFromSelection = (): void => {
    const entry = getActiveEmbedEntry(this.editor);
    this.editingPath.set(entry?.[1] ?? null);
    this.draftUrl.set(entry?.[0].url ?? '');
    this.draftCaption.set(entry?.[0].caption ?? '');
  };

  public readonly toggle = (): void => {
    if (!this.canOpen.value) return;
    const nextOpen = !this.open.value;
    if (nextOpen) {
      this.syncDraftFromSelection();
    } else {
      this.editingPath.set(null);
    }
    this.open.set(nextOpen);
  };

  public readonly close = (): void => {
    this.open.set(false);
    this.editingPath.set(null);
    this.anchorRect.set(null);
    this.mutxt.api.focus();
  };

  public readonly apply = (): void => {
    const normalized = normalizeEmbedUrl(this.draftUrl.value);
    if (!normalized) return;
    const editor = this.editor;
    const editingPath = this.editingPath.value;
    const caption = this.draftCaption.value.trim();
    flushSync(() => this.open.set(false));
    const updated = editingPath
      ? updateEmbedAtPath(editor, editingPath, normalized, caption)
      : !!insertEmbed(editor, normalized, caption);
    if (!updated) {
      this.open.set(true);
      return;
    }
    this.draftUrl.set(normalized);
    this.draftCaption.set(caption);
    this.editingPath.set(null);
    this.anchorRect.set(null);
  };

  public readonly remove = (): void => {
    const editingPath = this.editingPath.value;
    if (!editingPath) return;
    if (!removeEmbedAtPath(this.editor, editingPath)) return;
    this.close();
  };
}
