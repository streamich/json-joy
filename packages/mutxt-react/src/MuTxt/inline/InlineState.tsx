import {rsync, UiLifeCycles} from '@jsonjoy.com/ui';
import {ReactEditor} from 'slate-react';
import {InlineMenu} from './InlineMenu';
import type {AnchorPoint} from '@jsonjoy.com/ui/lib/utils/popup/types';
import type {MuTxtState} from '../state/MuTxtState';
import type {ScrollState} from '@jsonjoy.com/ui/lib/4-card/ScrollArea';

const TOOLBAR_HEIGHT = 36;
const GAP = 8;
const TOOLBAR_VIEWPORT_OVERFLOW_LIMIT = 50;

export class InlineState implements UiLifeCycles {
  public readonly menu: InlineMenu;
  public readonly pointerDownOutsideToolbar = rsync.val(false);

  /** Set when the user dismisses the floater (e.g. presses Escape). Reset
   *  whenever the editor's range selection changes. */
  public readonly dismissed = rsync.val(false);

  constructor(
    private readonly mutxt: MuTxtState,
    private readonly scrollArea: ScrollState | null,
  ) {
    this.menu = new InlineMenu(mutxt);
  }

  public readonly start = (): (() => void) => {
    const unsubscribeSelection = this.mutxt.selection.subscribe(() => {
      if (this.dismissed.value) this.dismissed.next(false);
    });
    return () => {
      unsubscribeSelection();
    };
  };

  /** Returns true when the supplied anchor point is within (or no more than
   *  TOOLBAR_VIEWPORT_OVERFLOW_LIMIT pixels outside of) the ScrollArea
   *  viewport. When no ScrollArea is registered, always returns true. */
  public isToolbarWithinViewport(point: AnchorPoint, toolbarElement: HTMLElement | null): boolean {
    if (!this.scrollArea?.viewportEl) return true;
    if (typeof window === 'undefined' || typeof document === 'undefined') return true;
    try {
      const viewportRect = this.scrollArea.viewportEl.getBoundingClientRect();
      const toolbarHeight = toolbarElement?.getBoundingClientRect().height || TOOLBAR_HEIGHT;
      const top = point.dy < 0 ? point.y - toolbarHeight : point.y;
      const bottom = point.dy < 0 ? point.y : point.y + toolbarHeight;
      const topOverflow = Math.max(viewportRect.top - top, 0);
      const bottomOverflow = Math.max(bottom - viewportRect.bottom, 0);
      return topOverflow <= TOOLBAR_VIEWPORT_OVERFLOW_LIMIT && bottomOverflow <= TOOLBAR_VIEWPORT_OVERFLOW_LIMIT;
    } catch {
      return false;
    }
  }

  public anchorPoint(): AnchorPoint | undefined {
    const mutxt = this.mutxt;
    const selection = mutxt.selection.value;
    if (!selection) return;
    try {
      const domRange = ReactEditor.toDOMRange(mutxt.editor as ReactEditor, selection);
      const selectionRect = domRange.getBoundingClientRect();
      const focusRect = this.getFocusCaretRect() ?? selectionRect;
      const x = focusRect.width > 0 ? focusRect.left + focusRect.width / 2 : focusRect.left;
      if (focusRect.top < TOOLBAR_HEIGHT + GAP)
        return {x, y: focusRect.bottom + GAP, dx: 0, dy: 1};
      return {x, y: focusRect.top - GAP, dx: 0, dy: -1};
    } catch {
      return;
    }
  }

  private getFocusCaretRect(): DOMRect | null {
    const nativeSelection = window.getSelection();
    if (!nativeSelection?.focusNode) return null;
    try {
      const focusRange = document.createRange();
      focusRange.setStart(nativeSelection.focusNode, nativeSelection.focusOffset);
      focusRange.collapse(true);
      const rect = focusRange.getClientRects()[0] ?? focusRange.getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) return rect;
      return null;
    } catch {
      return null;
    }
  }
}
