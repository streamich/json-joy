import {rsync} from '@jsonjoy.com/ui';
import {flushSync} from 'react-dom';
import {ReactEditor} from 'slate-react';
import {Transforms, type Editor, type Range} from 'slate';
import {getActiveLink, normalizeLinkHref, removeLink, type ActiveLink, upsertLink} from '../../behavior/link';
import type {MuTxtState} from '../../state/MuTxtState';

export class LinkButtonState {
  public readonly activeLink: rsync.ReactComputed<ActiveLink | null>;
  public readonly open = rsync.val(false);
  public readonly draft = rsync.val('');
  public readonly canOpen: rsync.ReactComputed<boolean>;
  public readonly selected: rsync.ReactComputed<boolean>;
  public readonly normalizedDraft = rsync.comp([this.draft], ([draft]) => normalizeLinkHref(draft));
  /** Snapshot of the bounding rect of the trigger element at the moment `toggle()` was called. */
  public readonly anchorRect = rsync.val<DOMRect | null>(null);
  /** Snapshot of the editor selection when the popup opens. */
  public readonly rangeSnapshot = rsync.val<Range | null>(null);

  private readonly editor: Editor;
  constructor(public readonly mutxt: MuTxtState) {
    const editor = (this.editor = mutxt.editor);
    this.activeLink = rsync.comp([mutxt.cursor], () => getActiveLink(editor));
    this.canOpen = rsync.comp(
      [mutxt.readOnly, mutxt.selection, this.activeLink],
      ([readOnly, selection, activeLink]) => !readOnly && (!!selection || !!activeLink),
    );
    this.selected = rsync.comp(
      [mutxt.readOnly, this.open, this.activeLink],
      ([readOnly, open, activeLink]) => !readOnly && (open || !!activeLink),
    );
  }

  public readonly setDraft = (value: string): void => {
    this.draft.set(value);
  };

  public readonly setAnchorRect = (rect: DOMRect | null): void => {
    this.anchorRect.set(rect);
  };

  public readonly setAnchorEl = (el: HTMLElement | null): void => {
    this.anchorRect.set(el ? el.getBoundingClientRect() : null);
  };

  public readonly setAnchorFromSelection = (): void => {
    try {
      const editor = this.editor as ReactEditor;
      const sel = editor.selection;
      if (!sel) {
        this.anchorRect.set(null);
        return;
      }
      const domRange = ReactEditor.toDOMRange(editor, sel);
      this.anchorRect.set(domRange.getBoundingClientRect());
    } catch {
      this.anchorRect.set(null);
    }
  };

  public readonly toggle = (): void => {
    if (!this.canOpen.value) return;
    const nextOpen = !this.open.value;
    if (nextOpen) {
      const active = this.activeLink.value;
      this.draft.set(active?.href ?? '');
      this.rangeSnapshot.set(active?.range ?? this.editor.selection ?? null);
    } else {
      this.rangeSnapshot.set(null);
    }
    this.open.set(nextOpen);
  };

  public readonly close = (): void => {
    const editor = this.editor;
    const range = this.rangeSnapshot.value;
    this.open.set(false);
    this.anchorRect.set(null);
    this.rangeSnapshot.set(null);
    if (range && typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => {
        try {
          window.getSelection()?.removeAllRanges();
        } catch {}
        try {
          Transforms.select(editor, range);
        } catch {}
      });
    }
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
    const editor = this.editor;
    const range = this.rangeSnapshot.value;
    if (range) {
      try {
        Transforms.select(editor, range);
      } catch {}
    }
    if (!removeLink(editor, range ?? undefined)) return;
    this.close();
  };
}
