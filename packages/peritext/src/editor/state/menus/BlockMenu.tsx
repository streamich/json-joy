import * as React from 'react';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {type LeafBlock, SliceTypeName} from 'json-joy/lib/json-crdt-extensions';
import {secondBrain} from '../menus';
import type {MenuItem} from '../../types';
import type {EditorState} from '../EditorState';

const CodeIcon = makeIcon({set: 'tabler', icon: 'code'});
const H1Icon = makeIcon({set: 'tabler', icon: 'h-1'});
const H2Icon = makeIcon({set: 'tabler', icon: 'h-2'});
const H3Icon = makeIcon({set: 'tabler', icon: 'h-3'});
const H4Icon = makeIcon({set: 'tabler', icon: 'h-4'});
const H5Icon = makeIcon({set: 'tabler', icon: 'h-5'});
const H6Icon = makeIcon({set: 'tabler', icon: 'h-6'});
const LayoutIcon = makeIcon({set: 'tabler', icon: 'layout'});
const TableIcon = makeIcon({set: 'tabler', icon: 'table'});
const ColumnsIcon = makeIcon({set: 'tabler', icon: 'columns'});
const ImageInPictureIcon = makeIcon({set: 'tabler', icon: 'image-in-picture'});
const PhotoScanIcon = makeIcon({set: 'tabler', icon: 'photo-scan'});
const TablerFileIcon = makeIcon({set: 'tabler', icon: 'file'});
const MathIcon = makeIcon({set: 'tabler', icon: 'math'});
const TypeIcon = makeIcon({set: 'lucide', icon: 'type'});
const QuoteIcon = makeIcon({set: 'lucide', icon: 'quote'});
const PilcrowIcon = makeIcon({set: 'lucide', icon: 'pilcrow'});
const ListBulletedIcon = makeIcon({set: 'ibm_32', icon: 'list--bulleted'});
const ListNumberedIcon = makeIcon({set: 'ibm_32', icon: 'list--numbered'});
const ListCheckedIcon = makeIcon({set: 'ibm_32', icon: 'list--checked'});
const CursorTextIcon = makeIcon({set: 'bootstrap', icon: 'cursor-text'});

export interface LeafBlockMenuCtx {
  block: LeafBlock<string>;
}

export class BlockMenu {
  constructor(
    public readonly state: EditorState,
  ) {}

  public readonly blockTypeMenu = (): MenuItem => {
    const et = this.state.surface.events.et;
    const menu: MenuItem = {
      name: 'Block type',
      expand: 1,
      expandChild: 0,
      children: [
        {
          name: 'Text blocks',
          expand: 3,
          children: [
            {
              name: 'Paragraph',
              icon: () => <PilcrowIcon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', SliceTypeName.p);
              },
            },
            {
              name: 'Code block',
              icon: () => <CodeIcon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', SliceTypeName.codeblock);
              },
            },
            {
              name: 'Blockquote',
              icon: () => <QuoteIcon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', [SliceTypeName.blockquote, SliceTypeName.p]);
              },
            },
            {
              name: 'Math block',
              icon: () => <MathIcon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', SliceTypeName.mathblock);
              },
            },
            {
              name: 'Pre-formatted',
              icon: () => <TypeIcon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', SliceTypeName.pre);
              },
            },
          ],
        },
        {
          name: 'Headings',
          sepBefore: true,
          expand: 3,
          children: [
            {
              name: 'Heading 1',
              icon: () => <H1Icon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', SliceTypeName.h1);
              },
            },
            {
              name: 'Heading 2',
              icon: () => <H2Icon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', SliceTypeName.h2);
              },
            },
            {
              name: 'Heading 3',
              icon: () => <H3Icon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', SliceTypeName.h3);
              },
            },
            {
              name: 'Heading 4',
              icon: () => <H4Icon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', SliceTypeName.h4);
              },
            },
            {
              name: 'Heading 5',
              icon: () => <H5Icon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', SliceTypeName.h5);
              },
            },
            {
              name: 'Heading 6',
              icon: () => <H6Icon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', SliceTypeName.h6);
              },
            },
            {
              sepBefore: true,
              name: 'Title',
              icon: () => <TypeIcon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', SliceTypeName.title);
              },
            },
            {
              name: 'Sub-title',
              icon: () => <TypeIcon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', SliceTypeName.subtitle);
              },
            },
          ],
        },
        {
          sepBefore: true,
          name: 'Lists',
          expand: 3,
          children: [
            {
              name: 'Bullet list',
              icon: () => <ListBulletedIcon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', [SliceTypeName.ul, SliceTypeName.li, SliceTypeName.p]);
              },
            },
            {
              name: 'Numbered list',
              icon: () => <ListNumberedIcon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', [SliceTypeName.ol, SliceTypeName.li, SliceTypeName.p]);
              },
            },
            {
              name: 'Task list',
              icon: () => <ListCheckedIcon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', [SliceTypeName.tl, SliceTypeName.li, SliceTypeName.p]);
              },
            },
          ],
        },
        {
          sepBefore: true,
          name: 'Layouts',
          expand: 0,
          icon: () => <LayoutIcon width={16} height={16} />,
          children: [
            {
              name: 'Table',
              icon: () => <TableIcon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', [SliceTypeName.table, SliceTypeName.tr, SliceTypeName.p]);
              },
            },
            {
              name: 'Columns',
              icon: () => <ColumnsIcon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', [SliceTypeName.column, SliceTypeName.p]);
              },
            },
          ],
        },
        {
          sepBefore: true,
          name: 'Embed',
          expand: 0,
          icon: () => <ImageInPictureIcon width={16} height={16} />,
          children: [
            {
              name: 'Image',
              icon: () => <PhotoScanIcon width={16} height={16} />,
              onSelect: () => {},
            },
            {
              name: 'File',
              icon: () => <TablerFileIcon width={16} height={16} />,
              onSelect: () => {},
            },
          ],
        },
      ],
    };
    return menu;
  };

  public readonly leafBlockSmallMenu = (ctx: LeafBlockMenuCtx): MenuItem => {
    const et = this.state.surface.events.et;
    const block = ctx.block;
    const menu: MenuItem = {
      name: 'Leaf block menu',
      maxToolbarItems: 1,
      more: true,
      minWidth: 280,
      children: [
        {...this.blockTypeMenu(), expand: 1, expandChild: 0},
        {
          sepBefore: true,
          name: 'Cursor actions',
          expand: 4,
          children: [
            {
              name: 'Select block',
              icon: () => <CursorTextIcon width={16} height={16} />,
              onSelect: () => {
                const start = block.start.clone();
                if (!start.isAbsStart()) start.step(1);
                et.cursor({at: [start, block.end]});
              },
            },
            this.state.menu.buffer.clipboardMenu({
              hideStyleActions: true,
              onBeforeAction: (item, action) => {
                const start = block.start.clone();
                if (!start.isAbsStart() && action === 'paste') start.step(1);
                return {
                  at: [start, block.end],
                };
              },
            }),
          ],
        },

        secondBrain(),
      ],
    };
    return menu;
  };
}
