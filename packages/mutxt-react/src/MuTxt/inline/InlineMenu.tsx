import * as React from 'react';
import {Range} from 'slate';
import {rsync} from '@jsonjoy.com/ui';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {FontStyleButton} from '@jsonjoy.com/ui/lib/2-inline-block/FontStyleButton';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {formatKeys} from '../util/keys';
import {isMarkActive} from '../behavior';
import type {FontKind, MarkFormat, MenuItem} from '../types';
import type {MuTxtState} from '../state/MuTxtState';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';
import {isLeafFontActive, setLeafFont} from '../behavior/font';

export interface InlineMenuItem extends MenuItem {
  mark: MarkFormat;
}

// Formatting: common
const BoldIcon = makeIcon({set: 'radix', icon: 'font-bold', width: 15, height: 15});
const ItalicIcon = makeIcon({set: 'lucide', icon: 'italic', width: 16, height: 16});
const UnderlineIcon = makeIcon({set: 'tabler', icon: 'underline', width: 16, height: 16});
const OverlineIcon = makeIcon({set: 'tabler', icon: 'overline', width: 16, height: 16});
const StrikethroughIcon = makeIcon({set: 'tabler', icon: 'strikethrough', width: 16, height: 16});
const HighlightIcon = makeIcon({set: 'tabler', icon: 'highlight', width: 16, height: 16});
const SpoilerIcon = makeIcon({set: 'tabler', icon: 'lock-password', width: 16, height: 16});

// Formatting: technical
const CodeIcon = makeIcon({set: 'tabler', icon: 'code', width: 16, height: 16});
const SupIcon = makeIcon({set: 'tabler', icon: 'superscript', width: 16, height: 16});
const SubIcon = makeIcon({set: 'tabler', icon: 'subscript', width: 16, height: 16});
const KeyIcon = makeIcon({set: 'lucide', icon: 'keyboard', width: 16, height: 16});
const InsertionIcon = makeIcon({set: 'tabler', icon: 'pencil-plus', width: 16, height: 16});
const DeletionIcon = makeIcon({set: 'tabler', icon: 'pencil-minus', width: 16, height: 16});

// Annotations
const LinkIcon = makeIcon({set: 'lucide', icon: 'link', width: 15, height: 15});

// Modify
const ClearFormattingIcon = makeIcon({set: 'tabler', icon: 'eraser', width: 16, height: 16});

// Typesetting
const TypographyIcon = makeIcon({set: 'tabler', icon: 'typography', width: 16, height: 16});

export class InlineMenu implements UiLifeCycles {
  constructor(public readonly mutxt: MuTxtState) {}

  public start() {
    return () => {};
  }

  private markActive(mark: MarkFormat) {
    return rsync.comp([this.mutxt.version], () => isMarkActive(this.mutxt.editor, mark));
  }

  public build(): MenuItem {
    const children: MenuItem['children'] = [
      this.menuFmt(),
      {name: 'sep-annon', sep: true},
      this.menuAnnotations({anchorFromSelection: true}),
      {name: 'sep-typesetting', sep: true},
      this.menuTypesetting(),
      {name: 'sep-modify', sep: true},
      this.menuModify(),
    ];
    return {
      name: 'Selection menu',
      maxToolbarItems: 4,
      children,
    };
  }

  public buildToolbarMenu(): MenuItem {
    return {
      name: 'Selection menu',
      maxToolbarItems: 4,
      children: [
        this.menuFmt(),
        {name: 'sep-annon', sep: true},
        this.menuAnnotations(),
        {name: 'sep-typesetting', sep: true},
        this.menuTypesetting(),
        {name: 'sep-modify', sep: true},
        this.menuModify(),
      ],
    };
  }

  public menuFmt(): MenuItem {
    const formatting: MenuItem = {
      name: 'Formatting',
      expandChild: 0,
      // preview: this.recent,
      children: [this.menuFmtCommon(), this.menuFmtTechnical()] as MenuItem[],
      preview: [this.itemBold(), this.itemItalic(), this.itemUnderline(), this.itemCode()] as MenuItem[],
    };
    return formatting;
  }

  public menuFmtCommon(): MenuItem {
    return {
      id: 'fmt-common',
      name: 'Common',
      expand: 8,
      children: [
        this.itemBold(),
        this.itemItalic(),
        this.itemUnderline(),
        this.itemStrikethrough(),
        this.itemOverline(),
        this.itemHighlight(),
        this.itemSpoiler(),
      ],
    };
  }

  public itemBold(): InlineMenuItem {
    const keys = ['Primary', 'b'];
    return {
      mark: 'bold',
      name: 'Bold',
      text: 'strong heavy thick weight',
      icon: () => <BoldIcon />,
      right: () => <Sidetip small>{formatKeys(keys)}</Sidetip>,
      keys: [formatKeys(keys)],
      active: this.markActive('bold'),
      onSelect: () => {
        this.mutxt.api.toggleMark('bold');
      },
    };
  }
  public itemItalic(): InlineMenuItem {
    const keys = ['Primary', 'i'];
    return {
      mark: 'italic',
      name: 'Italic',
      text: 'em emphasis slant oblique cursive',
      icon: () => <ItalicIcon />,
      right: () => <Sidetip small>{formatKeys(keys)}</Sidetip>,
      keys: [formatKeys(keys)],
      active: this.markActive('italic'),
      onSelect: () => {
        this.mutxt.api.toggleMark('italic');
      },
    };
  }
  public itemUnderline(): InlineMenuItem {
    const keys = ['Primary', 'u'];
    return {
      mark: 'underline',
      name: 'Underline',
      text: 'underscore line under',
      icon: () => <UnderlineIcon />,
      right: () => <Sidetip small>{formatKeys(keys)}</Sidetip>,
      keys: [formatKeys(keys)],
      active: this.markActive('underline'),
      priority: 1,
      onSelect: () => {
        this.mutxt.api.toggleMark('underline');
      },
    };
  }
  public itemStrikethrough(): InlineMenuItem {
    const keys = ['Primary', 'Shift', 'x'];
    return {
      mark: 'strikethrough',
      name: 'Strikethrough',
      text: 'strike crossed line through cross-out',
      icon: () => <StrikethroughIcon />,
      right: () => <Sidetip small>{formatKeys(keys)}</Sidetip>,
      keys: [formatKeys(keys)],
      active: this.markActive('strikethrough'),
      onSelect: () => {
        this.mutxt.api.toggleMark('strikethrough');
      },
    };
  }
  public itemOverline(): InlineMenuItem {
    return {
      mark: 'overline',
      name: 'Overline',
      text: 'line over above top',
      icon: () => <OverlineIcon />,
      active: this.markActive('overline'),
      onSelect: () => {
        this.mutxt.api.toggleMark('overline');
      },
    };
  }
  public itemHighlight(): InlineMenuItem {
    return {
      mark: 'mark',
      name: 'Highlight',
      text: 'mark yellow background marker emphasis',
      icon: () => <HighlightIcon />,
      active: this.markActive('mark'),
      onSelect: () => {
        this.mutxt.api.toggleMark('mark');
      },
    };
  }
  public itemSpoiler(): InlineMenuItem {
    return {
      mark: 'spoiler',
      name: 'Spoiler',
      text: 'hide blur reveal redact secret hidden',
      icon: () => <SpoilerIcon />,
      active: this.markActive('spoiler'),
      onSelect: () => {
        this.mutxt.api.toggleMark('spoiler');
      },
    };
  }

  public menuFmtTechnical(): MenuItem {
    return {
      id: 'fmt-technical',
      name: 'Technical',
      expand: 8,
      sepBefore: true,
      children: [this.itemCode(), this.itemSup(), this.itemSub(), this.itemKey(), this.itemIns(), this.itemDel()],
    };
  }
  public itemCode(): InlineMenuItem {
    const keys = ['Primary', 'e'];
    return {
      mark: 'code',
      name: 'Code',
      text: 'inline monospace snippet variable identifier',
      icon: () => <CodeIcon width={16} height={16} />,
      right: () => <Sidetip small>{formatKeys(keys)}</Sidetip>,
      keys: [formatKeys(keys)],
      active: this.markActive('code'),
      onSelect: () => {
        this.mutxt.api.toggleMark('code');
      },
    };
  }
  public itemSup(): InlineMenuItem {
    return {
      mark: 'sup',
      name: 'Superscript',
      text: 'sup raised exponent power above',
      icon: () => <SupIcon />,
      active: this.markActive('sup'),
      onSelect: () => {
        this.mutxt.api.toggleMark('sup');
      },
    };
  }
  public itemSub(): InlineMenuItem {
    return {
      mark: 'sub',
      name: 'Subscript',
      text: 'sub lowered chemistry below index',
      icon: () => <SubIcon />,
      active: this.markActive('sub'),
      onSelect: () => {
        this.mutxt.api.toggleMark('sub');
      },
    };
  }
  public itemKey(): InlineMenuItem {
    return {
      mark: 'kbd',
      name: 'Keyboard key',
      text: 'kbd shortcut button keystroke key',
      priority: 1,
      icon: () => <KeyIcon />,
      active: this.markActive('kbd'),
      onSelect: () => {
        this.mutxt.api.toggleMark('kbd');
      },
    };
  }
  public itemIns(): InlineMenuItem {
    return {
      mark: 'ins',
      name: 'Insertion',
      text: 'ins added inserted track changes diff',
      icon: () => <InsertionIcon />,
      active: this.markActive('ins'),
      onSelect: () => {
        this.mutxt.api.toggleMark('ins');
      },
    };
  }
  public itemDel(): InlineMenuItem {
    return {
      mark: 'del',
      name: 'Deletion',
      text: 'del removed deleted track changes diff strike',
      icon: () => <DeletionIcon />,
      active: this.markActive('del'),
      onSelect: () => {
        this.mutxt.api.toggleMark('del');
      },
    };
  }

  public menuAnnotations(opts: {anchorFromSelection?: boolean} = {}): MenuItem {
    return {
      name: 'Annotations',
      expand: 3,
      children: [this.itemLink(opts)],
    };
  }
  public itemLink(opts: {anchorFromSelection?: boolean} = {}): MenuItem {
    const mutxt = this.mutxt;
    const link = mutxt.inline.link;
    return {
      name: 'Link',
      text: 'url href hyperlink anchor web address a',
      icon: () => <LinkIcon />,
      disabled: rsync.comp([link.canOpen], ([canOpen]) => !canOpen),
      active: rsync.comp([mutxt.caretLinkHref], ([href]) => !!href),
      onSelect: (event) => {
        if (opts.anchorFromSelection) {
          link.setAnchorFromSelection();
        } else {
          const trigger = event.currentTarget as HTMLElement | null;
          if (trigger) link.setAnchorEl(trigger);
        }
        mutxt.inline.dismissed.next(true);
        link.toggle();
      },
    };
  }

  public menuTypesetting(): MenuItem {
    return {
      id: 'inline-typesetting',
      name: 'Typesetting',
      text: 'font face family typography typeface',
      icon: () => <TypographyIcon />,
      expand: 4,
      openOnTitleHov: true,
      children: [
        this.itemLeafFont('sans', 'Sans-serif', 'sans gothic grotesque modern'),
        this.itemLeafFont('serif', 'Serif', 'serif traditional roman'),
        this.itemLeafFont('slab', 'Slab', 'slab egyptian thick serif'),
        this.itemLeafFont('mono', 'Monospace', 'mono fixed code typewriter courier'),
      ],
    };
  }

  private itemLeafFont(kind: FontKind, name: string, text?: string): MenuItem {
    const mutxt = this.mutxt;
    const onSelect = (event: React.MouseEvent | React.TouchEvent) => {
      event.preventDefault();
      setLeafFont(mutxt.editor, kind);
      mutxt.sync(false);
    };
    const Option: React.FC<{size?: number}> = ({size}) => {
      mutxt.version.use();
      const active = isLeafFontActive(mutxt.editor, kind);
      return <FontStyleButton kind={kind} size={size} active={active} onMouseDown={onSelect} />;
    };
    return {
      name,
      text,
      icon: () => <Option size={16} />,
      iconBig: () => <Option />,
      active: rsync.comp([mutxt.version], () => isLeafFontActive(mutxt.editor, kind)),
      onSelect,
    };
  }

  public menuModify(): MenuItem {
    return {
      name: 'Modify',
      expand: 3,
      onSelect: () => {},
      children: [this.itemClear()],
    };
  }
  public itemClear(): MenuItem {
    const {mutxt} = this;
    return {
      name: 'Erase formatting',
      text: 'clear remove reset plain unformat strip styles marks',
      danger: true,
      icon: () => <ClearFormattingIcon width={16} height={16} />,
      disabled: rsync.comp([mutxt.version], () => {
        const sel = mutxt.editor.selection;
        return !sel || Range.isCollapsed(sel);
      }),
      onSelect: () => {
        mutxt.api.eraseMarks();
      },
    };
  }
}
