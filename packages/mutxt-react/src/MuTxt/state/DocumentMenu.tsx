import * as React from 'react';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {formatKeys} from '../util/keys';
import type {MenuItem} from '../types';
import type {MuTxtState} from './MuTxtState';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';

const DocumentIcon = makeIcon({set: 'tabler', icon: 'file-text', width: 16, height: 16});
const KeyboardIcon = makeIcon({set: 'tabler', icon: 'keyboard', width: 16, height: 16});

export class DocumentMenu implements UiLifeCycles {
  constructor(public readonly mutxt: MuTxtState) {}

  public start() {
    return () => {};
  }

  public build(): MenuItem {
    return {
      name: 'Document',
      minWidth: 288,
      icon: () => <DocumentIcon />,
      children: [this.itemKeyboardShortcuts()],
    };
  }

  public itemKeyboardShortcuts(): MenuItem {
    const formatted = formatKeys(['Primary', '/']);
    return {
      name: 'Keyboard shortcuts',
      icon: () => <KeyboardIcon />,
      right: () => <Sidetip small>{formatted}</Sidetip>,
      keys: [formatted],
      onSelect: () => {
        this.mutxt.omni.close();
        this.mutxt.shortcutsOpen.set(true);
      },
    };
  }
}
