import * as React from 'react';
import {rsync} from '@jsonjoy.com/ui';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {ReactEditor} from 'slate-react';
import {insertHr} from '../behavior/hr';
import type {MenuItem} from '../types';
import type {MuTxtState} from '../state/MuTxtState';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';

// const EmbedIcon = makeIcon({set: 'lucide', icon: 'link-2', width: 16, height: 16});
const EmbedIcon = makeIcon({set: 'tabler', icon: 'box', width: 16, height: 16});
const HrIcon = makeIcon({set: 'tabler', icon: 'separator', width: 16, height: 16});
const FileIcon = makeIcon({set: 'tabler', icon: 'file-upload', width: 16, height: 16});

export class VoidMenu implements UiLifeCycles {
  constructor(public readonly mutxt: MuTxtState) {}

  public start() {
    return () => {};
  }

  public build(): MenuItem {
    return {
      name: 'Insert menu',
      children: [this.itemEmbed({anchorFromCaret: true}), this.itemFile({anchorFromCaret: true}), this.itemHr()],
    };
  }

  public buildToolbarMenu(): MenuItem {
    return {
      name: 'Void menu',
      children: [
        {
          name: 'Insert menu',
          expand: 2,
          children: [this.itemEmbed(), this.itemFile(), this.itemHr()],
        },
      ],
    };
  }

  public itemHr(): MenuItem {
    const mutxt = this.mutxt;
    return {
      name: 'Separator',
      icon: () => <HrIcon />,
      disabled: rsync.comp([mutxt.readOnly], ([readOnly]) => !!readOnly),
      onSelect: (event) => {
        event.preventDefault();
        if (mutxt.readOnly.value) return;
        mutxt.voids.open.set(false);
        insertHr(mutxt.editor);
        ReactEditor.focus(mutxt.editor as ReactEditor);
        mutxt.setFocused(true);
        mutxt.sync(true);
      },
    };
  }

  public itemFile(opts: {anchorFromCaret?: boolean} = {}): MenuItem {
    const mutxt = this.mutxt;
    const file = mutxt.voids.file;
    return {
      name: 'File',
      icon: () => <FileIcon />,
      disabled: rsync.comp([file.canOpen], ([canOpen]) => !canOpen),
      onSelect: (event) => {
        event.preventDefault();
        if (opts.anchorFromCaret) {
          file.setAnchorFromCaret();
        } else {
          const trigger = event.currentTarget as HTMLElement | null;
          if (trigger) file.setAnchorEl(trigger);
        }
        mutxt.voids.open.set(false);
        file.toggle();
      },
    };
  }

  public itemEmbed(opts: {anchorFromCaret?: boolean} = {}): MenuItem {
    const mutxt = this.mutxt;
    const embed = mutxt.voids.embed;
    return {
      name: 'Embed',
      icon: () => <EmbedIcon />,
      disabled: rsync.comp([embed.canOpen], ([canOpen]) => !canOpen),
      active: rsync.comp([mutxt.caretEmbedUrl], ([url]) => !!url),
      onSelect: (event) => {
        event.preventDefault();
        if (opts.anchorFromCaret) {
          embed.setAnchorFromCaret();
        } else {
          const trigger = event.currentTarget as HTMLElement | null;
          if (trigger) embed.setAnchorEl(trigger);
        }
        mutxt.voids.open.set(false);
        embed.toggle();
      },
    };
  }
}
