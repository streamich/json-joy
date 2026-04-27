import {rsync} from '@jsonjoy.com/ui';
import {flushSync} from 'react-dom';
import type {Editor} from 'slate';
import {
  getActiveLink,
  normalizeLinkHref,
  removeLink,
  type ActiveLink,
  upsertLink,
} from '../../../behavior/link';
import {MuTxtState} from '../../../state/MuTxtState';

export class LinkButtonState {
  public readonly activeLink: rsync.ReactComputed<ActiveLink | null>;
  public readonly open = rsync.val(false);
  public readonly draft = rsync.val('');
  public readonly canOpen: rsync.ReactComputed<boolean>;
  public readonly selected: rsync.ReactComputed<boolean>;
  public readonly normalizedDraft = rsync.comp([this.draft], ([draft]) => normalizeLinkHref(draft));
  /** Snapshot of the bounding rect of the trigger element at the moment
   *  `toggle()` was called. We snapshot the rect (not the element) because
   *  the inline floater that holds the trigger can unmount when the link
   *  popup opens — by then the element would be detached and its
   *  `getBoundingClientRect()` would return zeros. */
  public readonly anchorRect = rsync.val<DOMRect | null>(null);

  private readonly editor: Editor;
  constructor(
    public readonly state: MuTxtState,
  ) {
    const editor = this.editor = state.editor;
    this.activeLink = rsync.comp([state.cursor], () => getActiveLink(editor));
    this.canOpen = rsync.comp(
      [state.readOnly, state.selection, this.activeLink],
      ([readOnly, selection, activeLink]) => !readOnly && (!!selection || !!activeLink),
    );
    this.selected = rsync.comp(
      [state.readOnly, this.open, this.activeLink],
      ([readOnly, open, activeLink]) => !readOnly && (open || !!activeLink),
    );
  }

  public readonly setDraft = (value: string): void => {
    this.draft.set(value);
  };

  public readonly setAnchorRect = (rect: DOMRect | null): void => {
    this.anchorRect.set(rect);
  };

  /** Capture the trigger element's current bounding rect. Convenience wrapper
   *  around `setAnchorRect` for callers that have the element in hand. */
  public readonly setAnchorEl = (el: HTMLElement | null): void => {
    this.anchorRect.set(el ? el.getBoundingClientRect() : null);
  };

  public readonly toggle = (): void => {
    if (!this.canOpen.value) return;
    const nextOpen = !this.open.value;
    if (nextOpen) this.draft.set(this.activeLink.value?.href ?? '');
    this.open.set(nextOpen);
  };

  public readonly close = (): void => {
    this.open.set(false);
    this.anchorRect.set(null);
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
  };

  public readonly remove = (): void => {
    if (!removeLink(this.editor)) return;
    this.close();
  };
}
