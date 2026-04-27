import {rsync, UiLifeCycles} from '@jsonjoy.com/ui';
import {BlockMenu} from './BlockMenu';
import type {AnchorPoint} from '@jsonjoy.com/ui/lib/utils/popup/types';
import type {MuTxtState} from '../state/MuTxtState';
import type {ScrollState} from '@jsonjoy.com/ui/lib/4-card/ScrollArea';
import type {BlockFormat, CustomElement, ListElementType} from '../types';

const TOOLBAR_HEIGHT = 32;

export class BlockState implements UiLifeCycles {
  public readonly menu: BlockMenu;
  public readonly dismissed = rsync.val(false);

  constructor(
    private readonly mutxt: MuTxtState,
    private readonly scrollArea: ScrollState | null,
  ) {
    this.menu = new BlockMenu(mutxt);
  }

  public readonly start = (): (() => void) => {
    const mutxt = this.mutxt;
    const unsubscribeCursor = mutxt.cursor.subscribe(() => {
      if (this.dismissed.value) this.dismissed.next(false);
    });
    return () => {
      unsubscribeCursor();
    };
  };

  /**
   * Format of the block currently containing the caret, or `undefined` when
   * there's no caret, when there's a range selection, or when the block isn't
   * one we recognize.
   * 
   * @todo Rename to `type`?
   */
  public currentBlockFormat(): BlockFormat | undefined {
    const mutxt = this.mutxt;
    const api = mutxt.api;
    const cursor = mutxt.cursor.value;
    const selection = mutxt.selection.value;
    if (!cursor || selection) return;
    const blockEntry = api.blockAbove();
    if (!blockEntry) return;
    const [element, path] = blockEntry;
    if (element.type === 'embed') return;
    if (element.type === 'li') {
      const match = api.listAbove(void 0, path);
      if (match) return (match[0] as CustomElement).type as ListElementType;
      return 'p';
    }
    return element.type as BlockFormat;
  }

  public point(): AnchorPoint | undefined {
    const {mutxt} = this;
    const cursor = mutxt.cursor.value;
    const selection = mutxt.selection.value;
    if (!cursor || selection) return;
    try {
      const x = mutxt.editableBox?.value[0];
      if (!x) return;
      const focusRect = mutxt.api.focusRect();
      if (!focusRect) return;
      return {
        x: x + 12,
        y: focusRect.top + focusRect.height / 2,
        dx: -1,
        dy: 0,
      };
    } catch {
      return;
    }
  }

  public isInViewport(point: AnchorPoint): boolean {
    if (!this.scrollArea?.viewportEl) return true;
    if (typeof window === 'undefined' || typeof document === 'undefined') return true;
    try {
      const viewportRect = this.scrollArea.viewportEl.getBoundingClientRect();
      const halfHeight = TOOLBAR_HEIGHT / 2;
      const top = point.y - halfHeight;
      const bottom = point.y + halfHeight;
      const topOverflow = Math.max(viewportRect.top - top, 0);
      const bottomOverflow = Math.max(bottom - viewportRect.bottom, 0);
      return topOverflow <= 0 && bottomOverflow <= 0;
    } catch {
      return false;
    }
  }
}
