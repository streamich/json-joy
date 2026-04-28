import * as React from 'react';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import type {MenuItem} from '../types';
import type {MuTxtState} from '../state/MuTxtState';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';

const EmbedIcon = makeIcon({set: 'lucide', icon: 'link-2', width: 16, height: 16});

export class VoidMenu implements UiLifeCycles {
  constructor(public readonly mutxt: MuTxtState) {}

  public start() {
    return () => {};
  }

  public build(): MenuItem {
    return {
      name: 'Insert menu',
      maxToolbarItems: 4,
      children: [
        this.itemEmbed(),
      ],
    };
  }

  public itemEmbed(): MenuItem {
    const {mutxt} = this;
    return {
      name: 'Embed',
      icon: () => <EmbedIcon />,
      onSelect: (event: React.MouseEvent) => {
        event.preventDefault();
        mutxt.voids.open.set(false);
        mutxt.requestEmbedMenu?.();
      },
    };
  }
}
