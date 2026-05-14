import {rsync, type UiLifeCycles} from '@jsonjoy.com/ui';
import {Editor, Range, Element as SlateElement, Node as SlateNode} from 'slate';
import {OmniMenu} from './OmniMenu';
import type {AnchorPoint} from '@jsonjoy.com/ui/lib/utils/popup/types';
import type {MuTxtState} from '../state/MuTxtState';

export type OmniMode = 'caret' | 'palette';

export class OmniState implements UiLifeCycles {
  public readonly menu: OmniMenu;
  public readonly open = rsync.val(false);
  public readonly mode = rsync.val<OmniMode>('caret');

  /** Anchor point captured at open time. Frozen so the popup does not jitter
   * if the caret moves while the user navigates the menu. */
  public readonly point = rsync.val<AnchorPoint | undefined>(undefined);

  /** Snapshot of the editor selection at the moment the menu opens. Used to
   * paint an "active selection" decoration while the menu has focus, and to
   * detect that the cursor has moved (which closes the menu). */
  public readonly rangeSnapshot = rsync.val<Range | null>(null);

  constructor(public readonly mutxt: MuTxtState) {
    this.menu = new OmniMenu(mutxt);
  }

  public start = (): (() => void) => () => {};

  public readonly close = (): void => {
    if (!this.open.value) return;
    this.open.set(false);
    this.point.set(undefined);
    this.rangeSnapshot.set(null);
    this.mutxt.api.focus();
  };

  public readonly openAtCaret = (): boolean => {
    const point = this.mutxt.api.focusPoint();
    if (!point) return false;
    this.captureSelection();
    this.mode.set('caret');
    this.point.set(point);
    this.open.set(true);
    return true;
  };

  public readonly openAsPalette = (): boolean => {
    const shellBox = this.mutxt.shellBox.value;
    if (!shellBox) return false;
    const [x, y, width] = shellBox;
    const point: AnchorPoint = {
      x: x + width / 2,
      y: y,
      dx: 0,
      dy: 1,
    };
    this.captureSelection();
    this.mode.set('palette');
    this.point.set(point);
    this.open.set(true);
    return true;
  };

  public readonly openSmart = (): boolean => {
    const {mutxt, open} = this;
    if (mutxt.readOnly.value) return false;
    if (open.value) return false;
    const sel = mutxt.editor.selection;
    if (sel) return this.openAtCaret();
    return this.openAsPalette();
  };

  public readonly handleSpaceKey = (): boolean => {
    const {mutxt, open} = this;
    if (mutxt.readOnly.value) return false;
    if (open.value) return false;
    if (mutxt.selection.value) return this.openSmart();
    if (this.isCaretInEmptyBlock()) return this.openSmart();
    return false;
  };

  // ------------------------------------------------------------------ Helpers

  private captureSelection(): void {
    this.rangeSnapshot.set(this.mutxt.selection.value);
  }

  private isCaretInEmptyBlock(): boolean {
    const editor = this.mutxt.editor;
    const sel = editor.selection;
    if (!sel || !Range.isCollapsed(sel)) return false;
    try {
      const [match] = Editor.nodes(editor, {
        match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
        mode: 'lowest',
      });
      if (!match) return false;
      const [block] = match;
      return SlateNode.string(block as SlateNode) === '';
    } catch {
      return false;
    }
  }
}
