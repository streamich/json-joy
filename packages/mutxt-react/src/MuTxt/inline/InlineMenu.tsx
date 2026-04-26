import * as React from 'react';
import {Iconista, makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import type {MenuItem} from '../types';
import type {MuTxtState} from '../state/MuTxtState';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';
import {formatKeys} from '../util/keys';

export interface InlineMenuItem extends MenuItem {
  mark: string;
}

const BoldIcon = makeIcon({set: 'radix', icon: 'font-bold', width: 15, height: 15});
const ItalicIcon = makeIcon({set: 'lucide', icon: 'italic', width: 16, height: 16});
const UnderlineIcon = makeIcon({set: 'tabler', icon: 'underline', width: 16, height: 16});
const OverlineIcon = makeIcon({set: 'tabler', icon: 'overline', width: 16, height: 16});
const StrikethroughIcon = makeIcon({set: 'tabler', icon: 'strikethrough', width: 16, height: 16});
const HighlightIcon = makeIcon({set: 'tabler', icon: 'highlight', width: 16, height: 16});
const SpoilerIcon = makeIcon({set: 'tabler', icon: 'lock-password', width: 16, height: 16});


const CodeIcon = makeIcon({set: 'tabler', icon: 'code', width: 16, height: 16});



const ClearFormattingIcon = makeIcon({set: 'tabler', icon: 'eraser', width: 16, height: 16});

const LayersIcon = makeIcon({set: 'radix', icon: 'layers'});
const BoxAlignRightIcon = makeIcon({set: 'tabler', icon: 'box-align-right'});
const EraserIcon = makeIcon({set: 'tabler', icon: 'eraser'});
const TrashIcon = makeIcon({set: 'tabler', icon: 'trash'});

export class InlineMenu implements UiLifeCycles {
  constructor(public readonly state: MuTxtState) {}

  public start() {
    return () => {};
  }

  public build(): MenuItem {
    const children: MenuItem['children'] = [
      this.menuFmt(),
      {name: 'sep-annon', sep: true},
      this.menuAnnotations(),
      {name: 'sep-modify', sep: true},
      this.menuModify(),
    ];
    return {
      name: 'Selection menu',
      maxToolbarItems: 4,
      // more: true,
      children,
    };
  }

  public menuFmt(): MenuItem {
    const technical: MenuItem = {
      id: 'fmt-technical',
      name: 'Technical',
      sepBefore: true,
      expand: 8,
      children: [],
    };
    const artistic: MenuItem = {
      id: 'fmt-artistic',
      name: 'Artistic',
      sepBefore: true,
      expand: 8,
      children: [],
    };
    const formatting: MenuItem = {
      name: 'Formatting',
      expandChild: 0,
      // preview: this.recent,
      children: [] as MenuItem[],
    };
    const children = formatting.children!;
    children.push(this.menuFmtCommon());
    technical.sepBefore = false;
    if (technical.children?.length) children.push(technical);
    else artistic.sepBefore = false;
    if (artistic.children?.length) children.push(artistic);
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
        this.itemCode(),
        this.itemHighlight(),
        this.itemSpoiler(),
      ],
    };
  }

  public itemBold(): InlineMenuItem {
    return {
      mark: 'bold',
      name: 'Bold',
      icon: () => <BoldIcon />,
      right: () => <Sidetip small>⌘ B</Sidetip>,
      keys: ['⌘', 'b'],
      onSelect: () => {
        this.state.api.toggleMark('bold');
      },
    };
  }
  public itemItalic(): InlineMenuItem {
    return {
      mark: 'italic',
      name: 'Italic',
      icon: () => <ItalicIcon />,
      right: () => <Sidetip small>⌘ I</Sidetip>,
      keys: ['⌘', 'i'],
      onSelect: () => {
        this.state.api.toggleMark('italic');
      },
    };
  }
  public itemUnderline(): InlineMenuItem {
    return {
      mark: 'underline',
      name: 'Underline',
      icon: () => <UnderlineIcon />,
      right: () => <Sidetip small>⌘ U</Sidetip>,
      keys: ['⌘', 'u'],
      onSelect: () => {
        this.state.api.toggleMark('underline');
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
      keys,
      onSelect: () => {
        this.state.api.toggleMark('strikethrough');
      },
    };
  }
  public itemOverline(): InlineMenuItem {
    return {
      mark: 'overline',
      name: 'Overline',
      icon: () => <OverlineIcon />,
      onSelect: () => {
        this.state.api.toggleMark('overline');
      },
    };
  }
  public itemHighlight(): InlineMenuItem {
    return {
      mark: 'highlight',
      name: 'Highlight',
      icon: () => <HighlightIcon />,
      onSelect: () => {
        this.state.api.toggleMark('mark');
      },
    };
  }
  public itemSpoiler(): InlineMenuItem {
    return {
      mark: 'spoiler',
      name: 'Spoiler',
      icon: () => <SpoilerIcon />,
      onSelect: () => {
        this.state.api.toggleMark('spoiler');
      },
    };
  }


  public itemCode(): InlineMenuItem {
    return {
      mark: 'code',
      name: 'Inline code',
      icon: () => <CodeIcon width={16} height={16} />,
      right: () => <Sidetip small>⌘ E</Sidetip>,
      keys: ['⌘', 'e'],
      onSelect: () => {
        this.state.api.toggleMark('code');
      },
    };
  }

  public menuAnnotations(): MenuItem {
    return {
      name: 'Annotations',
      expand: 3,
      children: [
        this.itemLink(),
      ],
    };
  }

  public itemLink(): MenuItem {
    return {
      name: 'Link',
      // icon: () => <Iconista width={15} height={15} set="lucide" icon="link" />,
      icon: () => <Iconista width={15} height={15} set="radix" icon="link-2" />,
      onSelect: () => {
        console.log('Link');
      },
    };
  }

  public menuModify(): MenuItem {
    return {
      name: 'Modify',
      expand: 3,
      onSelect: () => {},
      children: [
        this.itemClear(),
      ],
    };
  }

  public itemClear(): MenuItem {
    return {
      name: 'Erase formatting',
      danger: true,
      icon: () => <ClearFormattingIcon width={16} height={16} />,
      onSelect: () => {
      },
    };
  }
}
