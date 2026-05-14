import * as React from 'react';
import type {LeafBlock} from 'json-joy/lib/json-crdt-extensions';
import type {MenuItem} from '../../types';
import type {EditorState} from '../EditorState';
import _LayoutIcon__svg from 'iconista/lib/react/tabler/layout';
import _TableIcon__svg from 'iconista/lib/react/tabler/table';
import _ColumnsIcon__svg from 'iconista/lib/react/tabler/columns';
import ImageInPictureIcon__svg from 'iconista/lib/react/tabler/image-in-picture';
import PhotoScanIcon__svg from 'iconista/lib/react/tabler/photo-scan';
import TablerFileIcon__svg from 'iconista/lib/react/tabler/file';
import _ListBulletedIcon__svg from 'iconista/lib/react/ibm_32/list--bulleted';
import _ListNumberedIcon__svg from 'iconista/lib/react/ibm_32/list--numbered';
import _ListCheckedIcon__svg from 'iconista/lib/react/ibm_32/list--checked';
import CursorTextIcon__svg from 'iconista/lib/react/bootstrap/cursor-text';

const _LayoutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_LayoutIcon__svg {...props} />;
const _TableIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_TableIcon__svg {...props} />;
const _ColumnsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_ColumnsIcon__svg {...props} />;
const ImageInPictureIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ImageInPictureIcon__svg {...props} />;
const PhotoScanIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PhotoScanIcon__svg {...props} />;
const TablerFileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <TablerFileIcon__svg {...props} />;
const _ListBulletedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_ListBulletedIcon__svg {...props} />;
const _ListNumberedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_ListNumberedIcon__svg {...props} />;
const _ListCheckedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_ListCheckedIcon__svg {...props} />;
const CursorTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <CursorTextIcon__svg {...props} />;

export interface LeafBlockMenuCtx {
  leaf: LeafBlock;
}

export class BlockMenu {
  constructor(public readonly state: EditorState) {}

  private buildBlockGroup(group: MenuItem): void {
    const {id, children = []} = group;
    const state = this.state;
    const {blocks} = state;
    const spanLength = blocks.length;
    for (let i = 0; i < spanLength; i++) {
      const span = blocks[i];
      if (span.menuId === id) {
        const item = span.getMenu(state);
        if (item) children.push(item);
      }
    }
    if (children.length) children.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  private blockTypeChildren(): MenuItem[] {
    const _et = this.state.et;

    const text: MenuItem = {
      id: 'block-text',
      name: 'Text blocks',
      expand: 3,
      children: [],
    };
    const headings: MenuItem = {
      id: 'block-h',
      name: 'Headings',
      expand: 3,
      children: [],
    };
    this.buildBlockGroup(text);
    this.buildBlockGroup(headings);

    const children: MenuItem[] = [];
    if (text.children!.length) children.push(text);
    if (headings.children!.length) {
      if (text.children!.length) headings.sepBefore = true;
      children.push(headings);
    }

    children.push(
      // {
      //   sepBefore: true,
      //   name: 'Lists',
      //   expand: 3,
      //   children: [
      //     {
      //       name: 'Bullet list',
      //       icon: () => <ListBulletedIcon width={16} height={16} />,
      //       onSelect: () => {
      //         et.marker('upd', [SliceTypeName.ul, SliceTypeName.li, SliceTypeName.p]);
      //       },
      //     },
      //     {
      //       name: 'Numbered list',
      //       icon: () => <ListNumberedIcon width={16} height={16} />,
      //       onSelect: () => {
      //         et.marker('upd', [SliceTypeName.ol, SliceTypeName.li, SliceTypeName.p]);
      //       },
      //     },
      //     {
      //       name: 'Task list',
      //       icon: () => <ListCheckedIcon width={16} height={16} />,
      //       onSelect: () => {
      //         et.marker('upd', [SliceTypeName.tl, SliceTypeName.li, SliceTypeName.p]);
      //       },
      //     },
      //   ],
      // },
      // {
      //   sepBefore: true,
      //   name: 'Layouts',
      //   expand: 0,
      //   icon: () => <LayoutIcon width={16} height={16} />,
      //   children: [
      //     {
      //       name: 'Table',
      //       icon: () => <TableIcon width={16} height={16} />,
      //       onSelect: () => {
      //         et.marker('upd', [SliceTypeName.table, SliceTypeName.tr, SliceTypeName.p]);
      //       },
      //     },
      //     {
      //       name: 'Columns',
      //       icon: () => <ColumnsIcon width={16} height={16} />,
      //       onSelect: () => {
      //         et.marker('upd', [SliceTypeName.column, SliceTypeName.p]);
      //       },
      //     },
      //   ],
      // },
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
    );
    return children;
  }

  private blockTypeMenu(leaf: LeafBlock): MenuItem {
    const state = this.state;
    const tag = leaf.marker?.marker.nestedType().tag().name() ?? 0;
    const behavior = tag !== void 0 ? state.blockMap[tag] : void 0;
    const originalMenu = behavior?.getMenu(state);
    const menu: MenuItem = {
      name: 'Block type',
      // name: behavior?.name ?? 'Active block type',
      icon: originalMenu?.icon,
      children: this.blockTypeChildren(),
    };
    return menu;
  }

  public buildLeafMenu({leaf}: LeafBlockMenuCtx): MenuItem {
    const et = this.state.et;

    const menu: MenuItem = {
      name: 'Block menu',
      maxToolbarItems: 1,
      more: true,
      // minWidth: 280,
      children: [
        this.blockTypeMenu(leaf),
        {
          sepBefore: true,
          name: 'Cursor actions',
          expand: 4,
          children: [
            {
              name: 'Select block',
              icon: () => <CursorTextIcon width={16} height={16} />,
              onSelect: () => {
                const start = leaf.start.clone();
                if (!start.isAbsStart()) start.step(1);
                et.cursor({at: [start, leaf.end]});
              },
            },
            this.state.menu.buffer.clipboardMenu({
              hideStyleActions: true,
              onBeforeAction: (item, action) => {
                const start = leaf.start.clone();
                if (!start.isAbsStart() && action === 'paste') start.step(1);
                return {
                  at: [start, leaf.end],
                };
              },
            }),
          ],
        },

        // secondBrain(),
      ],
    };
    if (!leaf) menu.children = [];
    return menu;
  }
}
