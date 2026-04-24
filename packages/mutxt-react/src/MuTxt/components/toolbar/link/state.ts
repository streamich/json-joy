import {rsync} from '@jsonjoy.com/ui';
import {flushSync} from 'react-dom';
import type {Editor} from 'slate';
import {
  getActiveLink,
  hasRangeSelection,
  normalizeLinkHref,
  removeLink,
  type ActiveLink,
  upsertLink,
} from '../../../behavior/link';
import {MuTxtState} from '../../../controllers/MuTxtState';

export class LinkButtonState {
  public readonly hasSelection = rsync.val(false);
  public readonly activeLink = rsync.val<ActiveLink | null>(null);
  public readonly open = rsync.val(false);
  public readonly draft = rsync.val('');
  public readonly canOpen: rsync.ReactComputed<boolean>;
  public readonly selected: rsync.ReactComputed<boolean>;
  public readonly normalizedDraft = rsync.comp([this.draft], ([draft]) => normalizeLinkHref(draft));
  public readonly popupTitle = rsync.comp([this.activeLink], ([activeLink]) => (activeLink ? 'Edit link' : 'Add link'));
  public readonly popupSubtitle = rsync.comp([this.activeLink], ([activeLink]) =>
    activeLink
      ? 'Update the current link target, copy it, open it, or remove it.'
      : 'Enter a URL to wrap the current selection.',
  );
  private onVisualChange?: () => void;

  private readonly editor: Editor;
  constructor(
    public readonly state: MuTxtState,
  ) {
    this.editor = state.editor;
    this.canOpen = rsync.comp(
      [state.readOnly, this.hasSelection, this.activeLink],
      ([readOnly, hasSelection, activeLink]) => !readOnly && (hasSelection || !!activeLink),
    );
    this.selected = rsync.comp(
      [state.readOnly, this.open, this.activeLink],
      ([readOnly, open, activeLink]) => !readOnly && (open || !!activeLink),
    );
  }

  public readonly setOnVisualChange = (onVisualChange?: () => void): void => {
    this.onVisualChange = onVisualChange;
  };

  public readonly setDraft = (value: string): void => {
    this.draft.set(value);
  };

  public readonly toggle = (): void => {
    if (!this.canOpen.value) return;

    const nextOpen = !this.open.value;
    if (nextOpen) this.draft.set(this.activeLink.value?.href ?? '');
    this.open.set(nextOpen);
  };

  public readonly close = (): void => {
    this.open.set(false);
  };

  public readonly apply = (): void => {
    const currentDraft = this.draft.value;
    const normalizedDraft = normalizeLinkHref(currentDraft);
    if (!normalizedDraft) return;

    flushSync(() => this.open.set(false));
    const link = upsertLink(this.editor, currentDraft);
    if (!link) {
      this.draft.set(currentDraft);
      return;
    }

    this.draft.set(link.href);
    this.activeLink.set(link);
    this.hasSelection.set(hasRangeSelection(this.editor));
    this.onVisualChange?.();
  };

  public readonly remove = (): void => {
    if (!removeLink(this.editor)) return;

    this.activeLink.set(getActiveLink(this.editor));
    this.hasSelection.set(hasRangeSelection(this.editor));
    this.close();
    this.onVisualChange?.();
  };

  public readonly dispose = (): void => {};
}
