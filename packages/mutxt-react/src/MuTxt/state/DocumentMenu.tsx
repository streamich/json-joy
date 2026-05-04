import * as React from 'react';
import {rsync} from '@jsonjoy.com/ui';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {formatKeys} from '../util/keys';
import type {DisplayMode, MenuItem} from '../types';
import type {MuTxtState} from './MuTxtState';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';

const DocumentIcon = makeIcon({set: 'tabler', icon: 'file-text', width: 16, height: 16});
const KeyboardIcon = makeIcon({set: 'tabler', icon: 'keyboard', width: 16, height: 16});
const MaximizeIcon = makeIcon({set: 'tabler', icon: 'maximize', width: 16, height: 16});
const MinimizeIcon = makeIcon({set: 'tabler', icon: 'minimize', width: 16, height: 16});
const FullscreenIcon = makeIcon({set: 'tabler', icon: 'arrows-maximize', width: 16, height: 16});

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
      children: [this.itemDisplayMode(), this.itemKeyboardShortcuts()],
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

  public itemDisplayMode(): MenuItem {
    return {
      name: 'Display',
      icon: () => <MaximizeIcon />,
      children: [
        this.itemDisplayModeOption('inline', 'Inline', () => <MinimizeIcon />),
        this.itemDisplayModeOption('fullwindow', 'Maximized', () => <MaximizeIcon />),
        this.itemDisplayModeOption('fullscreen', 'Fullscreen', () => <FullscreenIcon />),
      ],
    };
  }

  private itemDisplayModeOption(mode: DisplayMode, name: string, icon: () => React.ReactNode): MenuItem {
    const mutxt = this.mutxt;
    return {
      name,
      icon,
      active: rsync.comp([mutxt.displayMode], ([m]) => m === mode),
      onSelect: () => {
        mutxt.omni.close();
        mutxt.setDisplayMode(mode);
      },
    };
  }

  public buildHeaderToolbar(): MenuItem {
    const mutxt = this.mutxt;
    const toggleKeys = ['Primary', 'Shift', 'm'];
    const activeFor = (mode: DisplayMode) => rsync.comp([mutxt.displayMode], ([m]) => m === mode);
    const option = (
      mode: DisplayMode,
      name: string,
      icon: () => React.ReactNode,
      keys?: string[],
    ): MenuItem => ({
      name,
      icon,
      keys: [formatKeys(toggleKeys)],
      right: keys ? () => <Sidetip small>{formatKeys(keys)}</Sidetip> : void 0,
      active: activeFor(mode),
      disabled: activeFor(mode),
      onSelect: () => {
        mutxt.omni.close();
        mutxt.setDisplayMode(mode);
      },
    });
    return {
      name: 'Display toolbar',
      maxToolbarItems: 1,
      children: [
        {
          name: mutxt.displayMode.value === 'inline' ? 'Maximized' : 'Inline',
          split: 'Display',
          keys: [formatKeys(toggleKeys)],
          icon: () => mutxt.displayMode.value === 'inline' ? <MaximizeIcon /> : <MinimizeIcon />,
          onSelect: () => {
            mutxt.omni.close();
            mutxt.setDisplayMode(mutxt.displayMode.value === 'inline' ? 'fullwindow' : 'inline');
          },
          noHeader: true,
          children: [
            option('inline', 'Inline', () => <MinimizeIcon />, toggleKeys),
            option('fullwindow', 'Maximized', () => <MaximizeIcon />, toggleKeys),
            option('fullscreen', 'Fullscreen', () => <FullscreenIcon />),
          ],
        },
      ],
    };
  }
}
