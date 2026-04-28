import * as React from 'react';
import {rsync} from '@jsonjoy.com/ui';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {ReactEditor} from 'slate-react';
import {formatKeys} from '../util/keys';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {dedentBlock, getActiveIndent, indentBlock, MAX_INDENT} from '../behavior/indentation';
import {isAlignmentActive, setAlignment, toggleBlock} from '../behavior';
import {getActiveOlType, getActiveUlType, isOlTypeActive, isUlTypeActive, setOlType, setUlType} from '../behavior/lists';
import type {BlockFormat, ListElementType, MenuItem, OlType, SlateTextAlign} from '../types';
import type {MuTxtState} from '../state/MuTxtState';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';

// Block icons
const ParagraphIcon = makeIcon({set: 'tabler', icon: 'pilcrow', width: 16, height: 16});
const BlockquoteIcon = makeIcon({set: 'tabler', icon: 'quote', width: 16, height: 16});
const CodeBlockIcon = makeIcon({set: 'tabler', icon: 'code', width: 16, height: 16});
const PreIcon = makeIcon({set: 'lucide', icon: 'wrap-text', width: 16, height: 16});
// const CalloutIcon = makeIcon({set: 'lucide', icon: 'message-square-warning', width: 16, height: 16});
// const CalloutIcon = makeIcon({set: 'vscode', icon: 'note', width: 16, height: 16});
const CalloutIcon = makeIcon({set: 'tabler', icon: 'message-2-exclamation', width: 16, height: 16});
const ColumnsIcon = makeIcon({set: 'tabler', icon: 'columns', width: 16, height: 16});

// Heading icons
// const H1Icon = makeIcon({set: 'tabler', icon: 'h-1', width: 16, height: 16});
// const H2Icon = makeIcon({set: 'tabler', icon: 'h-2', width: 16, height: 16});
// const H3Icon = makeIcon({set: 'tabler', icon: 'h-3', width: 16, height: 16});
// const H4Icon = makeIcon({set: 'tabler', icon: 'h-4', width: 16, height: 16});
// const H5Icon = makeIcon({set: 'tabler', icon: 'h-5', width: 16, height: 16});
// const H6Icon = makeIcon({set: 'tabler', icon: 'h-6', width: 16, height: 16});
const H1Icon = makeIcon({set: 'lucide', icon: 'heading-1', width: 16, height: 16});
const H2Icon = makeIcon({set: 'lucide', icon: 'heading-2', width: 16, height: 16});
const H3Icon = makeIcon({set: 'lucide', icon: 'heading-3', width: 16, height: 16});
const H4Icon = makeIcon({set: 'lucide', icon: 'heading-4', width: 16, height: 16});
const H5Icon = makeIcon({set: 'lucide', icon: 'heading-5', width: 16, height: 16});
const H6Icon = makeIcon({set: 'lucide', icon: 'heading-6', width: 16, height: 16});
const TitleIcon = makeIcon({set: 'lucide', icon: 'type', width: 16, height: 16});

// List icons
// const ULIcon = makeIcon({set: 'ibm_32', icon: 'list--bulleted', width: 16, height: 16});
const ULIcon = makeIcon({set: 'lucide_v1', icon: 'list', width: 16, height: 16});
// const OLIcon = makeIcon({set: 'ibm_32', icon: 'list--numbered', width: 16, height: 16});
const OLIcon = makeIcon({set: 'lucide_v1', icon: 'list-ordered', width: 16, height: 16});
// const ChecklistIcon = makeIcon({set: 'ibm_32', icon: 'list--checked', width: 16, height: 16});
// const ChecklistIcon = makeIcon({set: 'vscode', icon: 'checklist', width: 16, height: 16});
const ChecklistIcon = makeIcon({set: 'lucide_v1', icon: 'list-todo', width: 16, height: 16});

// Layout icons
const AlignLeftIcon = makeIcon({set: 'lucide', icon: 'align-left', width: 16, height: 16});
const AlignCenterIcon = makeIcon({set: 'lucide', icon: 'align-center', width: 16, height: 16});
const AlignRightIcon = makeIcon({set: 'lucide', icon: 'align-right', width: 16, height: 16});
const AlignJustifyIcon = makeIcon({set: 'lucide', icon: 'align-justify', width: 16, height: 16});
const IndentIcon = makeIcon({set: 'lucide', icon: 'indent-increase', width: 16, height: 16});
const DedentIcon = makeIcon({set: 'lucide', icon: 'indent-decrease', width: 16, height: 16});

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
      minWidth: 300,
      children: [
        {
          name: (head?.name ?? 'Block'),
          icon: head?.icon,
          minWidth: 269,
          expand: 0,
          children: [
            this.menuBlocks(),
            this.menuHeadings(),
            this.menuLists(),
            this.menuLayout(),
          ],
        },
      ],
    };
  }

  public buildToolbarMenu(): MenuItem {
    return {
      name: 'Block menu',
      maxToolbarItems: 4,
      children: [
        this.menuBlocks(),
        this.menuHeadings(),
        this.menuLists(),
        this.menuLayout(),
      ],
    };
  }

  // ----------------------------------------------------------------- Sections

  public menuBlocks(): MenuItem {
    return {
      id: 'block-blocks',
      name: 'Blocks',
      expand: 3,
      children: [
        this.itemParagraph(),
        this.itemBlockquote(),
        this.itemCodeBlock(),
        this.itemPre(),
        this.itemCallout(),
        this.itemColumns(),
      ],
    };
  }

  public menuHeadings(): MenuItem {
    return {
      id: 'block-headings',
      name: 'Headings',
      sepBefore: true,
      expand: 3,
      children: [
        this.itemH1(),
        this.itemH2(),
        this.itemH3(),
        this.itemH4(),
        this.itemH5(),
        this.itemH6(),
        {name: 'sep-title', sep: true},
        this.itemTitle(),
        this.itemSubtitle(),
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
      expand: 3,
      sepBefore: true,
      children: [
        this.itemAlignLeft(),
        this.itemAlignCenter(),
        this.itemAlignRight(),
        this.itemAlignJustify(),
        {name: 'sep-indent', sep: true},
        this.itemIndent(),
        this.itemDedent(),
      ],
    };
  }

  // -------------------------------------------------------------- Block items

  public itemParagraph(): MenuItem {
    return this.blockItem('p', {name: 'Paragraph', icon: () => <ParagraphIcon />, keys: ['Primary', 'Alt', '0']});
  }
  public itemBlockquote(): MenuItem {
    return this.blockItem('blockquote', {name: 'Blockquote', icon: () => <BlockquoteIcon />, keys: ['Primary', 'Alt', '9']});
  }
  public itemCodeBlock(): MenuItem {
    return this.blockItem('code-block', {name: 'Code block', icon: () => <CodeBlockIcon />, keys: ['Primary', 'Shift', 'c']});
  }
  public itemPre(): MenuItem {
    return this.blockItem('pre', {name: 'Pre-formatted', icon: () => <PreIcon />});
  }
  public itemCallout(): MenuItem {
    return this.blockItem('callout', {name: 'Callout', icon: () => <CalloutIcon />});
  }
  public itemColumns(): MenuItem {
    return this.blockItem('columns', {name: 'Two columns', icon: () => <ColumnsIcon />});
  }

  // ------------------------------------------------------------ Heading items

  public itemH1(): MenuItem {
    return this.blockItem('h1', {name: 'Heading 1', icon: () => <H1Icon />, keys: ['Primary', 'Alt', '1']});
  }
  public itemH2(): MenuItem {
    return this.blockItem('h2', {name: 'Heading 2', icon: () => <H2Icon />, keys: ['Primary', 'Alt', '2']});
  }
  public itemH3(): MenuItem {
    return this.blockItem('h3', {name: 'Heading 3', icon: () => <H3Icon />, keys: ['Primary', 'Alt', '3']});
  }
  public itemH4(): MenuItem {
    return this.blockItem('h4', {name: 'Heading 4', icon: () => <H4Icon />, keys: ['Primary', 'Alt', '4']});
  }
  public itemH5(): MenuItem {
    return this.blockItem('h5', {name: 'Heading 5', icon: () => <H5Icon />, keys: ['Primary', 'Alt', '5']});
  }
  public itemH6(): MenuItem {
    return this.blockItem('h6', {name: 'Heading 6', icon: () => <H6Icon />, keys: ['Primary', 'Alt', '6']});
  }
  public itemTitle(): MenuItem {
    return this.blockItem('title', {name: 'Title', display: () => <span style={{fontWeight: 'bold'}}>{'Title'}</span>, icon: () => <TitleIcon />});
  }
  public itemSubtitle(): MenuItem {
    return this.blockItem('subtitle', {name: 'Subtitle', display: () => <span style={{opacity: .7}}>{'Subtitle'}</span>, icon: () => <TitleIcon />});
  }

  // --------------------------------------------------------------- List items

  public itemUL(): MenuItem {
    const mutxt = this.mutxt;
    const applyUlType = (ulType: 'disc' | 'circle' | 'square') => {
      if (getActiveUlType(mutxt.editor) === null) toggleBlock(mutxt.editor, 'ul');
      setUlType(mutxt.editor, ulType);
    };
    return this.blockItem('ul', {name: 'Bulleted list', icon: () => <ULIcon />, keys: ['Primary', 'Alt', '8'], children: [
      {
        name: 'Disc bullets',
        icon: () => (
          <div style={{width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{width: 8, height: 8, borderRadius: '50%', backgroundColor: 'currentColor'}} />
          </div>
        ),
        active: rsync.comp([mutxt.version], () => isUlTypeActive(mutxt.editor, 'disc')),
        onSelect: this.exec(() => applyUlType('disc')),
      },
      {
        name: 'Circle bullets',
        icon: () => (
          <div style={{width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{width: 6, height: 6, borderRadius: '50%', border: '1px solid currentColor'}} />
          </div>
        ),
        active: rsync.comp([mutxt.version], () => isUlTypeActive(mutxt.editor, 'circle')),
        onSelect: this.exec(() => applyUlType('circle')),
      },
      {
        name: 'Square bullets',
        icon: () => (
          <div style={{width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{width: 6, height: 6, backgroundColor: 'currentColor'}} />
          </div>
        ),
        active: rsync.comp([mutxt.version], () => isUlTypeActive(mutxt.editor, 'square')),
        onSelect: this.exec(() => applyUlType('square')),
      },
    ]});
  }
  public itemOL(): MenuItem {
    const mutxt = this.mutxt;
    const applyOlType = (olType: OlType) => {
      if (getActiveOlType(mutxt.editor) === null) toggleBlock(mutxt.editor, 'ol');
      setOlType(mutxt.editor, olType);
    };
    const olItem = (name: string, olType: OlType, example?: string): MenuItem => ({
      name,
      right: example ? () => <Sidetip small>{example}</Sidetip> : undefined,
      active: rsync.comp([mutxt.version], () => isOlTypeActive(mutxt.editor, olType)),
      onSelect: this.exec(() => applyOlType(olType)),
    });
    return this.blockItem('ol', {name: 'Numbered list', icon: () => <OLIcon />, keys: ['Primary', 'Alt', '7'], children: [
      olItem('Decimal', 'decimal', '1, 2, 3'),
      olItem('Decimal w/ zero', 'decimal-leading-zero', '01, 02, 03'),
      olItem('Lower Roman', 'lower-roman', 'i, ii, iii'),
      olItem('Upper Roman', 'upper-roman', 'I, II, III'),
      olItem('Lower alpha', 'lower-alpha', 'a, b, c'),
      olItem('Upper alpha', 'upper-alpha', 'A, B, C'),
      olItem('Lower Greek', 'lower-greek', 'α, β, γ'),
      {
        name: 'More styles',
        sepBefore: true,
        more: true,
        children: [
          olItem('Hiragana', 'hiragana', 'あ, い, う'),
          olItem('Katakana', 'katakana', 'ア, イ, ウ'),
          olItem('CJK ideographic', 'cjk-ideographic', '一, 二, 三'),
          olItem('Hebrew', 'hebrew'),
          olItem('Armenian', 'armenian'),
        ],
      },
    ]});
  }
  public itemChecklist(): MenuItem {
    return this.blockItem('checklist', {name: 'Checklist', icon: () => <ChecklistIcon />});
  }

  // ------------------------------------------------------------------- Layout

  public itemAlignLeft(): MenuItem {
    return this.layoutItem('left', {name: 'Align left', keys: ['Primary', 'Shift', 'l'], icon: () => <AlignLeftIcon />});
  }
  public itemAlignCenter(): MenuItem {
    return this.layoutItem('center', {name: 'Align center', keys: ['Primary', 'Shift', 'e'], icon: () => <AlignCenterIcon />});
  }
  public itemAlignRight(): MenuItem {
    return this.layoutItem('right', {name: 'Align right', keys: ['Primary', 'Shift', 'r'], icon: () => <AlignRightIcon />});
  }
  public itemAlignJustify(): MenuItem {
    return this.layoutItem('justify', {name: 'Justify', keys: ['Primary', 'Shift', 'j'], icon: () => <AlignJustifyIcon />});
  }

  // -------------------------------------------------------------- Indentation

  public itemIndent(): MenuItem {
    const mutxt = this.mutxt;
    const keys = ['Primary', ']'];
    const formattedKeys = formatKeys(keys);
    return {
      name: 'Increase indent',
      icon: () => <IndentIcon />,
      right: () => <Sidetip small>{formattedKeys}</Sidetip>,
      keys: [formattedKeys],
      disabled: rsync.comp([mutxt.version], () => getActiveIndent(mutxt.editor) >= MAX_INDENT),
      onSelect: this.exec(() => indentBlock(mutxt.editor)),
    };
  }
  public itemDedent(): MenuItem {
    const mutxt = this.mutxt;
    const keys = ['Primary', '['];
    const formattedKeys = formatKeys(keys);
    return {
      name: 'Decrease indent',
      icon: () => <DedentIcon />,
      right: () => <Sidetip small>{formattedKeys}</Sidetip>,
      keys: [formattedKeys],
      disabled: rsync.comp([mutxt.version], () => getActiveIndent(mutxt.editor) <= 0),
      onSelect: this.exec(() => dedentBlock(mutxt.editor)),
    };
  }

  // ------------------------------------------------------------------ Helpers

  private blockItem(format: BlockFormat | ListElementType, config: MenuItem): MenuItem {
    const mutxt = this.mutxt;
    const keys = config.keys;
    const formattedKeys = keys ? formatKeys(keys) : undefined;
    return {
      ...config,
      keys: formattedKeys ? [formattedKeys] : undefined,
      right: keys ? () => <Sidetip small>{formattedKeys}</Sidetip> : undefined,
      active: rsync.comp([mutxt.version], () => this.currentBlockFormat() === format),
      onSelect: this.exec(() => toggleBlock(mutxt.editor, format)),
    };
  }

  private layoutItem(alignment: SlateTextAlign, config: MenuItem): MenuItem {
    const mutxt = this.mutxt;
    const keys = config.keys;
    const formattedKeys = keys ? formatKeys(keys) : undefined;
    return {
      ...config,
      keys: formattedKeys ? [formattedKeys] : undefined,
      right: keys ? () => <Sidetip small>{formattedKeys}</Sidetip> : undefined,
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
      case 'h4': return this.itemH4();
      case 'h5': return this.itemH5();
      case 'h6': return this.itemH6();
      case 'title': return this.itemTitle();
      case 'subtitle': return this.itemSubtitle();
      case 'blockquote': return this.itemBlockquote();
      case 'callout': return this.itemCallout();
      case 'code-block': return this.itemCodeBlock();
      case 'pre': return this.itemPre();
      case 'ul': return this.itemUL();
      case 'ol': return this.itemOL();
      case 'checklist': return this.itemChecklist();
      case 'columns': return this.itemColumns();
      default: return null;
    }
  }
}
