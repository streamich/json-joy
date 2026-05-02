import * as React from 'react';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import type {MenuItem} from '../types';
import type {MuTxtState} from '../state/MuTxtState';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';

const InsertIcon = makeIcon({set: 'tabler', icon: 'plus', width: 16, height: 16});
const TurnIntoIcon = makeIcon({set: 'tabler', icon: 'transform', width: 16, height: 16});
const FormatIcon = makeIcon({set: 'tabler', icon: 'typography', width: 16, height: 16});
const DocumentIcon = makeIcon({set: 'tabler', icon: 'file-text', width: 16, height: 16});

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
    return {
      name: 'Quick actions',
      minWidth: 320,
      children: [
        voidMenu.itemFile({anchorFromCaret: true}),
        voidMenu.itemEmbed({anchorFromCaret: true}),
        voidMenu.itemHr(),
        {name: 'sep-turn', sep: true},
        {
          name: 'Turn into',
          icon: () => <TurnIntoIcon />,
          children: [
            blockMenu.menuBlocks(),
            blockMenu.menuHeadings(),
            blockMenu.menuLists(),
            blockMenu.menuLayout(),
          ],
        },
        {
          name: 'Format',
          icon: () => <FormatIcon />,
          children: [
            inlineMenu.menuFmtCommon(),
            inlineMenu.menuFmtTechnical(),
          ],
        },
        {name: 'sep-doc', sep: true},
        {
          name: 'Document',
          icon: () => <DocumentIcon />,
          children: [
            {
              name: 'No settings yet',
              icon: () => <InsertIcon />,
              onSelect: () => {},
            },
          ],
        },
      ],
    };
  }
}
