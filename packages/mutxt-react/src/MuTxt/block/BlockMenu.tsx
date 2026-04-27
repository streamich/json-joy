import * as React from 'react';
import {rsync} from '@jsonjoy.com/ui';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {ReactEditor} from 'slate-react';
import {formatKeys} from '../util/keys';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {dedentBlock, getActiveIndent, indentBlock, MAX_INDENT} from '../behavior/indentation';
import {isAlignmentActive, setAlignment, toggleBlock} from '../behavior';
import type {BlockFormat, ListElementType, MenuItem, SlateTextAlign} from '../types';
import type {MuTxtState} from '../state/MuTxtState';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';

// Block icons
const ParagraphIcon = makeIcon({set: 'tabler', icon: 'pilcrow', width: 16, height: 16});
const H1Icon = makeIcon({set: 'tabler', icon: 'h-1', width: 16, height: 16});
const H2Icon = makeIcon({set: 'tabler', icon: 'h-2', width: 16, height: 16});
const H3Icon = makeIcon({set: 'tabler', icon: 'h-3', width: 16, height: 16});
const BlockquoteIcon = makeIcon({set: 'lucide', icon: 'quote', width: 16, height: 16});
const CodeBlockIcon = makeIcon({set: 'tabler', icon: 'code', width: 16, height: 16});

// List icons
const ULIcon = makeIcon({set: 'ibm_32', icon: 'list--bulleted', width: 16, height: 16});
const OLIcon = makeIcon({set: 'ibm_32', icon: 'list--numbered', width: 16, height: 16});
const ChecklistIcon = makeIcon({set: 'ibm_32', icon: 'list--checked', width: 16, height: 16});

// Layout icons
const ColumnsIcon = makeIcon({set: 'tabler', icon: 'columns', width: 16, height: 16});

// Alignment icons
const AlignLeftIcon = makeIcon({set: 'lucide', icon: 'align-left', width: 16, height: 16});
const AlignCenterIcon = makeIcon({set: 'lucide', icon: 'align-center', width: 16, height: 16});
const AlignRightIcon = makeIcon({set: 'lucide', icon: 'align-right', width: 16, height: 16});
const AlignJustifyIcon = makeIcon({set: 'lucide', icon: 'align-justify', width: 16, height: 16});

// Indent icons
const IndentIcon = makeIcon({set: 'lucide', icon: 'indent-increase', width: 16, height: 16});
const DedentIcon = makeIcon({set: 'lucide', icon: 'indent-decrease', width: 16, height: 16});

interface ItemConfig {
  name: string;
  icon: () => React.ReactNode;
  keys?: string[];
  sepBefore?: boolean;
}

export class BlockMenu implements UiLifeCycles {
  constructor(public readonly mutxt: MuTxtState) {}

  public start() {
    return () => {};
  }

  public build(): MenuItem {
    const format = this.currentBlockFormat();
    const head = this.headFor(format);
    return {
      name: 'Block options',
      expand: 0,
      children: [
        {
          name: head?.name ?? 'Block',
          icon: head?.icon,
          expand: 0,
          children: [
            ...this.menuBlocks().children!,
            ...this.menuLists().children!,
            ...this.menuLayout().children!,
            ...this.menuAlignment().children!,
            ...this.menuIndent().children!,
          ],
        },
      ],
    };
  }

  // ----------------------------------------------------------------- Sections

  public menuBlocks(): MenuItem {
    return {
      id: 'block-blocks',
      name: 'Blocks',
      expand: 8,
      children: [
        this.itemParagraph(),
        this.itemH1(),
        this.itemH2(),
        this.itemH3(),
        this.itemBlockquote(),
        this.itemCodeBlock(),
      ],
    };
  }

  public menuLists(): MenuItem {
    return {
      id: 'block-lists',
      name: 'Lists',
      expand: 8,
      sepBefore: true,
      children: [
        this.itemUL(),
        this.itemOL(),
        this.itemChecklist(),
      ],
    };
  }

  public menuLayout(): MenuItem {
    return {
      id: 'block-layout',
      name: 'Layout',
      expand: 8,
      sepBefore: true,
      children: [
        this.itemColumns(),
      ],
    };
  }

  public menuAlignment(): MenuItem {
    return {
      id: 'block-alignment',
      name: 'Alignment',
      expand: 8,
      sepBefore: true,
      children: [
        this.itemAlignLeft(),
        this.itemAlignCenter(),
        this.itemAlignRight(),
        this.itemAlignJustify(),
      ],
    };
  }

  public menuIndent(): MenuItem {
    return {
      id: 'block-indent',
      name: 'Indent',
      expand: 8,
      sepBefore: true,
      children: [
        this.itemIndent(),
        this.itemDedent(),
      ],
    };
  }

  // -------------------------------------------------------------- Block items

  public itemParagraph(): MenuItem {
    return this.blockItem('p', {name: 'Paragraph', icon: () => <ParagraphIcon />, keys: ['Primary', 'Alt', '0']});
  }
  public itemH1(): MenuItem {
    return this.blockItem('h1', {name: 'Heading 1', icon: () => <H1Icon />, keys: ['Primary', 'Alt', '1']});
  }
  public itemH2(): MenuItem {
    return this.blockItem('h2', {name: 'Heading 2', icon: () => <H2Icon />, keys: ['Primary', 'Alt', '2']});
  }
  public itemH3(): MenuItem {
    return this.blockItem('h3', {name: 'Heading 3', icon: () => <H3Icon />, keys: ['Primary', 'Alt', '3']});
  }
  public itemBlockquote(): MenuItem {
    return this.blockItem('blockquote', {name: 'Blockquote', icon: () => <BlockquoteIcon />, keys: ['Primary', 'Shift', 'q']});
  }
  public itemCodeBlock(): MenuItem {
    return this.blockItem('code-block', {name: 'Code block', icon: () => <CodeBlockIcon />, keys: ['Primary', 'Shift', 'c']});
  }

  // --------------------------------------------------------------- List items

  public itemUL(): MenuItem {
    return this.blockItem('ul', {name: 'Bulleted list', icon: () => <ULIcon />, keys: ['Primary', 'Alt', '8'], sepBefore: true});
  }
  public itemOL(): MenuItem {
    return this.blockItem('ol', {name: 'Numbered list', icon: () => <OLIcon />, keys: ['Primary', 'Alt', '7']});
  }
  public itemChecklist(): MenuItem {
    return this.blockItem('checklist', {name: 'Checklist', icon: () => <ChecklistIcon />});
  }

  // ------------------------------------------------------------- Layout items

  public itemColumns(): MenuItem {
    return this.blockItem('columns', {name: 'Two columns', icon: () => <ColumnsIcon />, sepBefore: true});
  }

  // ---------------------------------------------------------------- Alignment

  public itemAlignLeft(): MenuItem {
    return this.alignmentItem('left', {name: 'Align left', icon: () => <AlignLeftIcon />, keys: ['Primary', 'Shift', 'l'], sepBefore: true});
  }
  public itemAlignCenter(): MenuItem {
    return this.alignmentItem('center', {name: 'Align center', icon: () => <AlignCenterIcon />, keys: ['Primary', 'Shift', 'e']});
  }
  public itemAlignRight(): MenuItem {
    return this.alignmentItem('right', {name: 'Align right', icon: () => <AlignRightIcon />, keys: ['Primary', 'Shift', 'r']});
  }
  public itemAlignJustify(): MenuItem {
    return this.alignmentItem('justify', {name: 'Justify', icon: () => <AlignJustifyIcon />, keys: ['Primary', 'Shift', 'j']});
  }

  // -------------------------------------------------------------- Indentation

  public itemIndent(): MenuItem {
    const mutxt = this.mutxt;
    const keys = ['Primary', ']'];
    return {
      name: 'Increase indent',
      icon: () => <IndentIcon />,
      right: () => <Sidetip small>{formatKeys(keys)}</Sidetip>,
      keys,
      sepBefore: true,
      disabled: rsync.comp([mutxt.version], () => getActiveIndent(mutxt.editor) >= MAX_INDENT),
      onSelect: this.exec(() => indentBlock(mutxt.editor)),
    };
  }
  public itemDedent(): MenuItem {
    const mutxt = this.mutxt;
    const keys = ['Primary', '['];
    return {
      name: 'Decrease indent',
      icon: () => <DedentIcon />,
      right: () => <Sidetip small>{formatKeys(keys)}</Sidetip>,
      keys,
      disabled: rsync.comp([mutxt.version], () => getActiveIndent(mutxt.editor) <= 0),
      onSelect: this.exec(() => dedentBlock(mutxt.editor)),
    };
  }

  // ------------------------------------------------------------------ Helpers

  private blockItem(format: BlockFormat | ListElementType, config: ItemConfig): MenuItem {
    const mutxt = this.mutxt;
    return {
      name: config.name,
      icon: config.icon,
      keys: config.keys,
      sepBefore: config.sepBefore,
      active: rsync.comp([mutxt.version], () => this.currentBlockFormat() === format),
      onSelect: this.exec(() => toggleBlock(mutxt.editor, format)),
    };
  }

  private alignmentItem(alignment: SlateTextAlign, config: ItemConfig): MenuItem {
    const mutxt = this.mutxt;
    return {
      name: config.name,
      icon: config.icon,
      keys: config.keys,
      sepBefore: config.sepBefore,
      active: rsync.comp([mutxt.version], () => isAlignmentActive(mutxt.editor, alignment)),
      onSelect: this.exec(() => setAlignment(mutxt.editor, alignment)),
    };
  }

  private readonly exec = (fn: () => void) => (event: React.MouseEvent | React.TouchEvent): void => {
    event.preventDefault();
    fn();
    ReactEditor.focus(this.mutxt.editor as ReactEditor);
    this.mutxt.setFocused(true);
    this.mutxt.sync(false);
  };

  private currentBlockFormat(): BlockFormat | undefined {
    return this.mutxt.block.currentBlockFormat();
  }

  private headFor(format: BlockFormat | undefined): {name: string; icon?: () => React.ReactNode} | null {
    switch (format) {
      case 'p': return this.itemParagraph();
      case 'h1': return this.itemH1();
      case 'h2': return this.itemH2();
      case 'h3': return this.itemH3();
      case 'blockquote': return this.itemBlockquote();
      case 'code-block': return this.itemCodeBlock();
      case 'ul': return this.itemUL();
      case 'ol': return this.itemOL();
      case 'checklist': return this.itemChecklist();
      case 'columns': return this.itemColumns();
      default: return null;
    }
  }
}
