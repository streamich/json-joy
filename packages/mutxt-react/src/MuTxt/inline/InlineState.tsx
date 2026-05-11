import {rsync, type UiLifeCycles} from '@jsonjoy.com/ui';
import {ReactEditor} from 'slate-react';
import {InlineMenu} from './InlineMenu';
import {LinkButtonState} from './link/LinkButtonState';
import type {AnchorPoint} from '@jsonjoy.com/ui/lib/utils/popup/types';
import type {MuTxtState} from '../state/MuTxtState';
import type {ScrollState} from '@jsonjoy.com/ui/lib/4-card/ScrollArea';

const TOOLBAR_HEIGHT = 36;
const GAP = 8;
const TOOLBAR_VIEWPORT_OVERFLOW_LIMIT = 50;

export class InlineState implements UiLifeCycles {
  public readonly menu: InlineMenu;
  public readonly pointerDownOutsideToolbar = rsync.val(false);

  public readonly dismissed = rsync.val(false);
  public isFocusInToolbar: (() => boolean) | null = null;
  public readonly link: LinkButtonState;

  public readonly popupOpen = rsync.val(false);

  public readonly setPopupOpen = (open: boolean): void => {
    this.popupOpen.set(open);
  };
  
  public readonly recentColors = rsync.val<string[]>([]);

  public readonly pushRecentColor = (color: string): void => {
    if (!color) return;
    const list = this.recentColors.value.filter((c) => c !== color);
    list.unshift(color);
    if (list.length > 10) list.length = 10;
    this.recentColors.next(list);
  };

  constructor(
    private readonly mutxt: MuTxtState,
    private readonly scrollArea: ScrollState | null,
  ) {
    this.menu = new InlineMenu(mutxt);
    this.link = new LinkButtonState(mutxt);
  }

  public readonly start = (): (() => void) => {
    const mutxt = this.mutxt;
    const unsubscribeSelection = mutxt.selection.subscribe(() => {
      if (mutxt.selection.value) this.dismissed.next(false);
    });
    // Editor-blur dismiss has to be deferred to a microtask. Slate's onBlur
    // fires synchronously inside the mousedown that's currently shifting
    // focus to whatever the user clicked — at that moment, the focusin event
    // for the new target hasn't yet updated our `isFocusInToolbar` check, so
    // a synchronous dismiss would unmount the toolbar before the click on its
    // own button can register. Deferring lets the focusin handler run first.
    const unsubscribeFocused = mutxt.focused.subscribe(() => {
      if (mutxt.focused.value) return;
      queueMicrotask(() => {
        if (mutxt.focused.value) return;
        if (this.isFocusInToolbar?.()) return;
        if (this.popupOpen.value) return;
        this.dismissed.next(true);
      });
    });
    return () => {
      unsubscribeSelection();
      unsubscribeFocused();
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
      // Reject degenerate rects. They appear briefly while a mark is being
      // applied (e.g. Bold wraps the affected text in a `<strong>` element):
      // for one render the DOM range references nodes that are being
      // re-mounted, so getBoundingClientRect() returns 0,0,0,0. Returning
      // undefined here lets the caller fall back to the cached point instead
      // of placing the toolbar at the page origin and triggering the
      // viewport-overflow check.
      if (!focusRect.width && !focusRect.height && !focusRect.top && !focusRect.left) return;
      const x = focusRect.width > 0 ? focusRect.left + focusRect.width / 2 : focusRect.left;
      if (focusRect.top < TOOLBAR_HEIGHT + GAP) return {x, y: focusRect.bottom + GAP, dx: 0, dy: 1};
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
