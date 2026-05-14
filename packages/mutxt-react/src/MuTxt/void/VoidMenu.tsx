import * as React from 'react';
import {rsync} from '@jsonjoy.com/ui';
import {ReactEditor} from 'slate-react';
import {insertHr} from '../behavior/hr';
import {insertToc} from '../behavior/toc';
import {insertEmptyMathBlock} from '../behavior/math';
import type {MenuItem} from '../types';
import type {MuTxtState} from '../state/MuTxtState';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';
import EmbedIcon__svg from 'iconista/lib/react/tabler/box';
import HrIcon__svg from 'iconista/lib/react/tabler/separator';
import FileIcon__svg from 'iconista/lib/react/tabler/file-upload';
import TocIcon__svg from 'iconista/lib/react/lucide/list-tree';
import MathIcon__svg from 'iconista/lib/react/tabler/math-function';

// const EmbedIcon = makeIcon({set: 'lucide', icon: 'link-2', width: 16, height: 16});
const EmbedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <EmbedIcon__svg width={16} height={16} {...props} />
);
const HrIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <HrIcon__svg width={16} height={16} {...props} />;
const FileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <FileIcon__svg width={16} height={16} {...props} />
);
// const TocIcon = makeIcon({set: 'bootstrap', icon: 'list-columns-reverse', width: 16, height: 16});
const TocIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <TocIcon__svg width={16} height={16} {...props} />;
const MathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <MathIcon__svg width={16} height={16} {...props} />
);

export class VoidMenu implements UiLifeCycles {
  constructor(public readonly mutxt: MuTxtState) {}

  public start() {
    return () => {};
  }

  public build(): MenuItem {
    return {
      name: 'Insert menu',
      children: [
        this.itemEmbed({anchorFromCaret: true}),
        this.itemFile({anchorFromCaret: true}),
        this.itemMath({anchorFromCaret: true}),
        this.itemHr(),
        this.itemToc(),
      ],
    };
  }

  public buildToolbarMenu(): MenuItem {
    return {
      name: 'Void menu',
      children: [
        {
          name: 'Insert menu',
          expand: 2,
          children: [this.itemEmbed(), this.itemFile(), this.itemMath(), this.itemHr(), this.itemToc()],
        },
      ],
    };
  }

  public itemHr(): MenuItem {
    const mutxt = this.mutxt;
    return {
      name: 'Separator',
      text: 'hr horizontal rule line divider break thematic',
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

  public itemToc(): MenuItem {
    const mutxt = this.mutxt;
    return {
      name: 'Table of contents',
      text: 'toc index outline navigation headings summary contents',
      icon: () => <TocIcon />,
      disabled: rsync.comp([mutxt.readOnly], ([readOnly]) => !!readOnly),
      onSelect: (event) => {
        event.preventDefault();
        if (mutxt.readOnly.value) return;
        mutxt.voids.open.set(false);
        insertToc(mutxt.editor);
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
      text: 'attachment upload image picture photo video audio media document pdf',
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
      text: 'iframe url media youtube tweet bookmark link preview',
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

  public itemMath(_opts: {anchorFromCaret?: boolean} = {}): MenuItem {
    const mutxt = this.mutxt;
    return {
      name: 'Equation',
      text: 'math equation formula latex mathlive tex displaystyle',
      icon: () => <MathIcon />,
      disabled: rsync.comp([mutxt.readOnly], ([readOnly]) => !!readOnly),
      onSelect: (event) => {
        event.preventDefault();
        if (mutxt.readOnly.value) return;
        mutxt.voids.open.set(false);
        insertEmptyMathBlock(mutxt);
        ReactEditor.focus(mutxt.editor as ReactEditor);
        mutxt.setFocused(true);
        mutxt.sync(true);
      },
    };
  }
}
