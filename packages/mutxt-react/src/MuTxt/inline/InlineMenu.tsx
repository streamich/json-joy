import * as React from 'react';
import {rsync} from '@jsonjoy.com/ui';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {formatKeys} from '../util/keys';
import {isMarkActive} from '../behavior';
import type {MarkFormat, MenuItem} from '../types';
import type {MuTxtState} from '../state/MuTxtState';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';

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
      children: [this.menuFmt(), {name: 'sep-annon', sep: true}, this.menuAnnotations()],
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
    const keys = ['⌘', 'b'];
    return {
      mark: 'bold',
      name: 'Bold',
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
    const keys = ['⌘', 'i'];
    return {
      mark: 'italic',
      name: 'Italic',
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
    const keys = ['⌘', 'u'];
    return {
      mark: 'underline',
      name: 'Underline',
      icon: () => <UnderlineIcon />,
      right: () => <Sidetip small>{formatKeys(keys)}</Sidetip>,
      keys: [formatKeys(keys)],
      active: this.markActive('underline'),
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
    const keys = ['⌘', 'e'];
    return {
      mark: 'code',
      name: 'Code',
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

  public menuModify(): MenuItem {
    return {
      name: 'Modify',
      expand: 3,
      onSelect: () => {},
      children: [this.itemClear()],
    };
  }
  public itemClear(): MenuItem {
    return {
      name: 'Erase formatting',
      danger: true,
      icon: () => <ClearFormattingIcon width={16} height={16} />,
      onSelect: () => {
        this.mutxt.api.eraseMarks();
      },
    };
  }
}
