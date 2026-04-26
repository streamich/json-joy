import * as React from 'react';
import {rsync} from '@jsonjoy.com/ui';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {ReactEditor} from 'slate-react';
import {
  ALIGNMENT_BUTTONS,
  BLOCK_BUTTONS,
  LAYOUT_BUTTONS,
  LIST_BUTTONS,
  isAlignmentActive,
  setAlignment,
  toggleBlock,
} from '../../../behavior';
import type {AnchorPoint} from '@jsonjoy.com/ui/lib/utils/popup/types';
import type {MenuItem} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';
import type {MuTxtState} from '../../../state/MuTxtState';
import type {
  BlockFormat,
  CustomElement,
  ListElementType,
  ToolbarButtonDefinition,
} from '../../../types';
import type {ScrollState} from '@jsonjoy.com/ui/lib/4-card/ScrollArea';

const TOOLBAR_HEIGHT = 32;

const BLOCK_HANDLE_BUTTONS: Array<ToolbarButtonDefinition<BlockFormat>> = [
  ...BLOCK_BUTTONS,
  ...LAYOUT_BUTTONS,
  ...LIST_BUTTONS,
];
const BLOCK_HANDLE_META = new Map(BLOCK_HANDLE_BUTTONS.map((button) => [button.format!, button]));

export class FloatingBlockToolbarState {
  private readonly editor = this.mutxt.editor;

  constructor(
    private readonly mutxt: MuTxtState,
    private readonly scrollArea: ScrollState | null,
  ) {}

  public blockMeta(): ToolbarButtonDefinition | undefined {
    const currentFormat = this.blockFormat();
    if (!currentFormat) return;
    const button = BLOCK_HANDLE_META.get(currentFormat);
    return button;
  }

  public blockFormat(): BlockFormat | undefined {
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
    };
    return element.type as BlockFormat;
  }

  public point(): AnchorPoint | undefined {
    const cursor = this.mutxt.cursor.value;
    const selection = this.mutxt.selection.value;
    if (!cursor || selection) return;
    try {
      const x = this.mutxt.editableBox?.value[0];
      if (!x) return;
      const focusRect = this.mutxt.api.focusRect();
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
      const halfHeight = (TOOLBAR_HEIGHT) / 2;
      const top = point.y - halfHeight;
      const bottom = point.y + halfHeight;
      const topOverflow = Math.max(viewportRect.top - top, 0);
      const bottomOverflow = Math.max(bottom - viewportRect.bottom, 0);
      return topOverflow <= 0 && bottomOverflow <= 0;
    } catch {
      return false;
    }
  }

  // --------------------------------------------------------------------- Menu

    public menu(currentBlock: ToolbarButtonDefinition): MenuItem | null {
    return {
      name: 'Block options',
      expand: 0,
      children: [
        {
          name: currentBlock.title,
          icon: () => <Iconista set={currentBlock.iconSet as any} icon={currentBlock.icon as any} width={16} height={16} />,
          expand: 0,
          children: [
            ...this.createBlockItems(),
            ...this.createListItems(),
            ...this.createLayoutItems(),
            ...this.createAlignmentItems(),
          ],
        }
      ],
    };
  }

  private createBlockItems(): MenuItem[] {
    return BLOCK_BUTTONS.map((button) => this.createBlockMenuItem(button));
  }

  private createListItems(): MenuItem[] {
    return LIST_BUTTONS.map((button, index) => this.createBlockMenuItem(button, index === 0));
  }

  private createLayoutItems(): MenuItem[] {
    return LAYOUT_BUTTONS.map((button, index) => this.createBlockMenuItem(button, index === 0));
  }

  private createAlignmentItems(): MenuItem[] {
    return ALIGNMENT_BUTTONS.map((button, index) => ({
      name: button.title,
      sepBefore: index === 0,
      keys: button.shortcut ? [button.shortcut] : undefined,
      icon: () => <Iconista set={button.iconSet as any} icon={button.icon as any} width={16} height={16} />,
      active: rsync.comp([this.mutxt.version], () => isAlignmentActive(this.editor, button.format!)),
      onSelect: this.exec(() => setAlignment(this.editor, button.format!)),
    }));
  }

  private createBlockMenuItem(
    button: ToolbarButtonDefinition<BlockFormat | ListElementType>,
    sepBefore = false,
  ): MenuItem {
    return {
      name: button.title,
      sepBefore,
      keys: button.shortcut ? [button.shortcut] : undefined,
      icon: () => <Iconista set={button.iconSet as any} icon={button.icon as any} width={16} height={16} />,
      active: rsync.comp([this.mutxt.version], () => this.isBlockFormatActive(button.format!)),
      onSelect: this.exec(() => toggleBlock(this.editor, button.format!)),
    };
  }

  private readonly exec = (fn: () => void) => (event: React.MouseEvent): void => {
    event.preventDefault();
    fn();
    ReactEditor.focus(this.editor as ReactEditor);
    this.mutxt.setFocused(true);
    this.mutxt.sync(false);
  };

  private isBlockFormatActive(format: BlockFormat | ListElementType): boolean {
    return this.blockFormat() === format;
  }
}