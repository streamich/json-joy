import * as React from 'react';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import type {MenuItem} from '../types';
import type {MuTxtState} from '../state/MuTxtState';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';

const TurnIntoIcon = makeIcon({set: 'tabler', icon: 'transform', width: 16, height: 16});
const FormatIcon = makeIcon({set: 'tabler', icon: 'typography', width: 16, height: 16});

export class OmniMenu implements UiLifeCycles {
  constructor(public readonly mutxt: MuTxtState) {}

  public start() {
    return () => {};
  }

  public build(): MenuItem {
    const mutxt = this.mutxt;
    const voidMenu = mutxt.voids.menu;
    const blockMenu = mutxt.block.menu;
    const inlineMenu = mutxt.inline.menu;
    const hasSelection = mutxt.api.hasSelection();
    const formatChildren: MenuItem[] = [inlineMenu.menuFmtCommon(), inlineMenu.menuFmtTechnical()];
    if (hasSelection) {
      formatChildren.push(inlineMenu.menuAnnotations({anchorFromSelection: true}), inlineMenu.menuModify());
    }
    return {
      name: 'Quick actions',
      minWidth: 320,
      children: [
        voidMenu.itemFile({anchorFromCaret: true}),
        voidMenu.itemEmbed({anchorFromCaret: true}),
        voidMenu.itemHr(),
        voidMenu.itemToc(),
        {name: 'sep-turn', sep: true},
        {
          name: 'Turn into',
          text: 'transform convert change block format type',
          icon: () => <TurnIntoIcon />,
          children: [blockMenu.menuBlocks(), blockMenu.menuHeadings(), blockMenu.menuLists(), blockMenu.menuLayout()],
        },
        {
          name: 'Format',
          text: 'style mark inline formatting',
          icon: () => <FormatIcon />,
          children: formatChildren,
        },
        {name: 'sep-doc', sep: true},
        mutxt.docMenu.build(),
      ],
    };
  }
}
