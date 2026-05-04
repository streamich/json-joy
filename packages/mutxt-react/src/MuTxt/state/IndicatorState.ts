import {rsync, type UiLifeCycles} from '@jsonjoy.com/ui';
import {ReactEditor} from 'slate-react';
import type * as React from 'react';
import type {AnchorPoint} from '@jsonjoy.com/ui/lib/utils/popup/types';
import type {MuTxtState} from './MuTxtState';

const GAP = 4;

export interface IndicatorContent {
  /** Inline content rendered inside the indicator pill. */
  content: React.ReactNode;
}

/**
 * State for the autoformat/caret indicator: a small, unobtrusive pill anchored
 * near the caret used to surface what an autoformat rule is about to do.
 */
export class IndicatorState implements UiLifeCycles {
  /** What is currently being shown, or `null` when hidden. */
  public readonly shown = rsync.val<IndicatorContent | null>(null);

  constructor(public readonly mutxt: MuTxtState) {}

  public start(): () => void {
    return () => {
      this.shown.next(null);
    };
  }

  /**
   * Show the indicator near the current caret. Returns a dismiss function
   * scoped to this specific call: calling it after a different `show()`
   * has run is a no-op.
   */
  public readonly show = (content: IndicatorContent): (() => void) => {
    this.shown.next(content);
    return () => {
      if (this.shown.value === content) this.shown.next(null);
    };
  };

  /** Force-hide whatever is currently showing. */
  public readonly dismiss = (): void => {
    this.shown.next(null);
  };

  public anchorPoint(): AnchorPoint | undefined {
    const mutxt = this.mutxt;
    const sel = mutxt.editor.selection;
    if (!sel) return;
    try {
      const domRange = ReactEditor.toDOMRange(mutxt.editor as ReactEditor, sel);
      const caretRect = this.getFocusCaretRect() ?? domRange.getBoundingClientRect();
      if (!caretRect.width && !caretRect.height && !caretRect.top && !caretRect.left) return;
      const x = caretRect.left;
      const spaceAbove = caretRect.top;
      if (spaceAbove >= 28) return {x, y: caretRect.top - GAP, dx: 1, dy: -1};
      return {x, y: caretRect.bottom + GAP, dx: 1, dy: 1};
    } catch {
      return;
    }
  }

  private getFocusCaretRect(): DOMRect | null {
    const sel = typeof window !== 'undefined' ? window.getSelection() : null;
    if (!sel?.focusNode) return null;
    try {
      const range = document.createRange();
      range.setStart(sel.focusNode, sel.focusOffset);
      range.collapse(true);
      const rect = range.getClientRects()[0] ?? range.getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) return rect;
      return null;
    } catch {
      return null;
    }
  }
}
