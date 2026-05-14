import * as React from 'react';
// import {ValueSyncStore} from 'json-joy/lib/util/events/sync-store';
import {secondBrain} from '../menus';
import {FontStyleButton} from '@jsonjoy.com/ui/lib/2-inline-block/FontStyleButton';
// import {type LeafBlock, type Peritext} from 'json-joy/lib/json-crdt-extensions';
// import {BehaviorSubject} from 'rxjs';
// import {compare, type ITimestampStruct} from 'json-joy/lib/json-crdt-patch';
// import {SliceTypeName} from 'json-joy/lib/json-crdt-extensions/peritext/slice/constants';
// import {NewFormatting} from './formattings';
// import {inlines} from '../inline/tags';
// import {BufferMenu} from './menus/BufferMenu';
// import {RangeMenu} from './menus/RangeMenu';
// import type {PeritextSurfaceState} from '../../web/state';
import type {MenuItem} from '../../types';
// import type {ToolbarPluginOpts} from '../ToolbarPlugin';
// import type {
//   BufferDetail,
//   PeritextCursorEvent,
//   PeritextEventDetailMap,
// } from 'json-joy/lib/json-crdt-extensions/peritext/events';
import type {EditorState} from '../EditorState';
import DropdownMenuIcon__svg from 'iconista/lib/react/radix/dropdown-menu';
import LetterSpacingIcon__svg from 'iconista/lib/react/radix/letter-spacing';
import FontStyleIcon__svg from 'iconista/lib/react/radix/font-style';
import FontFamilyIcon__svg from 'iconista/lib/react/radix/font-family';
import FontSizeIcon__svg from 'iconista/lib/react/radix/font-size';
import LetterCaseUppercaseIcon__svg from 'iconista/lib/react/radix/letter-case-uppercase';
import LetterCaseLowercaseIcon__svg from 'iconista/lib/react/radix/letter-case-lowercase';
import RadixKeyboardIcon__svg from 'iconista/lib/react/radix/keyboard';
import RadixFileIcon__svg from 'iconista/lib/react/radix/file';
import CalendarIcon__svg from 'iconista/lib/react/radix/calendar';
import ButtonIcon__svg from 'iconista/lib/react/radix/button';
import SewingPinIcon__svg from 'iconista/lib/react/radix/sewing-pin';
import PlusIcon__svg from 'iconista/lib/react/radix/plus';
import LinkRadixIcon__svg from 'iconista/lib/react/radix/link-2';
import _CodeIcon__svg from 'iconista/lib/react/tabler/code';
import TypographyIcon__svg from 'iconista/lib/react/tabler/typography';
import TemplateIcon__svg from 'iconista/lib/react/tabler/template';
import WalletIcon__svg from 'iconista/lib/react/tabler/wallet';
import BrainIcon__svg from 'iconista/lib/react/tabler/brain';
import _H1Icon__svg from 'iconista/lib/react/tabler/h-1';
import _H2Icon__svg from 'iconista/lib/react/tabler/h-2';
import _H3Icon__svg from 'iconista/lib/react/tabler/h-3';
import _H4Icon__svg from 'iconista/lib/react/tabler/h-4';
import _H5Icon__svg from 'iconista/lib/react/tabler/h-5';
import _H6Icon__svg from 'iconista/lib/react/tabler/h-6';
import _LayoutIcon__svg from 'iconista/lib/react/tabler/layout';
import _TableIcon__svg from 'iconista/lib/react/tabler/table';
import _ColumnsIcon__svg from 'iconista/lib/react/tabler/columns';
import _ImageInPictureIcon__svg from 'iconista/lib/react/tabler/image-in-picture';
import _PhotoScanIcon__svg from 'iconista/lib/react/tabler/photo-scan';
import _TablerFileIcon__svg from 'iconista/lib/react/tabler/file';
import _MathIcon__svg from 'iconista/lib/react/tabler/math';
import _TypeIcon__svg from 'iconista/lib/react/lucide/type';
import VariableIcon__svg from 'iconista/lib/react/lucide/variable';
import SquareChevronRightIcon__svg from 'iconista/lib/react/lucide/square-chevron-right';
import SmilePlusIcon__svg from 'iconista/lib/react/lucide/smile-plus';
import OmegaIcon__svg from 'iconista/lib/react/lucide/omega';
import BetweenVerticalEndIcon__svg from 'iconista/lib/react/lucide/between-vertical-end';
import _UndoIcon__svg from 'iconista/lib/react/lucide/undo';
import _RedoIcon__svg from 'iconista/lib/react/lucide/redo';
import _QuoteIcon__svg from 'iconista/lib/react/lucide/quote';
import _PilcrowIcon__svg from 'iconista/lib/react/lucide/pilcrow';
import _ListBulletedIcon__svg from 'iconista/lib/react/ibm_32/list--bulleted';
import _ListNumberedIcon__svg from 'iconista/lib/react/ibm_32/list--numbered';
import _ListCheckedIcon__svg from 'iconista/lib/react/ibm_32/list--checked';
import _CursorTextIcon__svg from 'iconista/lib/react/bootstrap/cursor-text';

const DropdownMenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <DropdownMenuIcon__svg {...props} />;
const LetterSpacingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <LetterSpacingIcon__svg {...props} />;
const FontStyleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FontStyleIcon__svg {...props} />;
const FontFamilyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FontFamilyIcon__svg {...props} />;
const FontSizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FontSizeIcon__svg {...props} />;
const LetterCaseUppercaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <LetterCaseUppercaseIcon__svg {...props} />;
const LetterCaseLowercaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <LetterCaseLowercaseIcon__svg {...props} />;
const RadixKeyboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <RadixKeyboardIcon__svg {...props} />;
const RadixFileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <RadixFileIcon__svg {...props} />;
const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <CalendarIcon__svg {...props} />;
const ButtonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ButtonIcon__svg {...props} />;
const SewingPinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SewingPinIcon__svg {...props} />;
const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlusIcon__svg {...props} />;
const LinkRadixIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <LinkRadixIcon__svg {...props} />;
const _CodeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_CodeIcon__svg {...props} />;
const TypographyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <TypographyIcon__svg {...props} />;
const TemplateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <TemplateIcon__svg {...props} />;
const WalletIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <WalletIcon__svg {...props} />;
const BrainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <BrainIcon__svg {...props} />;
const _H1Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_H1Icon__svg {...props} />;
const _H2Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_H2Icon__svg {...props} />;
const _H3Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_H3Icon__svg {...props} />;
const _H4Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_H4Icon__svg {...props} />;
const _H5Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_H5Icon__svg {...props} />;
const _H6Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_H6Icon__svg {...props} />;
const _LayoutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_LayoutIcon__svg {...props} />;
const _TableIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_TableIcon__svg {...props} />;
const _ColumnsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_ColumnsIcon__svg {...props} />;
const _ImageInPictureIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_ImageInPictureIcon__svg {...props} />;
const _PhotoScanIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_PhotoScanIcon__svg {...props} />;
const _TablerFileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_TablerFileIcon__svg {...props} />;
const _MathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_MathIcon__svg {...props} />;
const _TypeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_TypeIcon__svg {...props} />;
const VariableIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <VariableIcon__svg {...props} />;
const SquareChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SquareChevronRightIcon__svg {...props} />;
const SmilePlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SmilePlusIcon__svg {...props} />;
const OmegaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <OmegaIcon__svg {...props} />;
const BetweenVerticalEndIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <BetweenVerticalEndIcon__svg {...props} />;
const _UndoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_UndoIcon__svg {...props} />;
const _RedoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_RedoIcon__svg {...props} />;
const _QuoteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_QuoteIcon__svg {...props} />;
const _PilcrowIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_PilcrowIcon__svg {...props} />;
const _ListBulletedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_ListBulletedIcon__svg {...props} />;
const _ListNumberedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_ListNumberedIcon__svg {...props} />;
const _ListCheckedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_ListCheckedIcon__svg {...props} />;
const _CursorTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_CursorTextIcon__svg {...props} />;

export class CaretMenu {
  constructor(public readonly state: EditorState) {}

  public readonly build = (): MenuItem => {
    return {
      name: 'Inline text',
      maxToolbarItems: 4,
      children: [
        this.state.menu.range.formattingMenu(),
        secondBrain(),
        {
          name: 'Annotations separator',
          sep: true,
        },
        this.state.menu.range.annotationsMenu(),
        {
          name: 'Style separator',
          sep: true,
        },
        {
          name: 'Typesetting',
          expand: 4,
          openOnTitleHov: true,
          icon: () => <TypographyIcon width={16} height={16} />,
          onSelect: () => {},
          children: [
            {
              name: 'Sans-serif',
              iconBig: () => <FontStyleButton kind={'sans'} />,
              onSelect: () => {},
            },
            {
              name: 'Serif',
              iconBig: () => <FontStyleButton kind={'serif'} />,
              onSelect: () => {},
            },
            {
              name: 'Slab',
              icon: () => <FontStyleButton kind={'slab'} size={16} />,
              iconBig: () => <FontStyleButton kind={'slab'} />,
              onSelect: () => {},
            },
            {
              name: 'Monospace',
              iconBig: () => <FontStyleButton kind={'mono'} />,
              onSelect: () => {},
            },
            // {
            //   name: 'Custom typeface separator',
            //   sep: true,
            // },
            {
              name: 'Custom typeface',
              expand: 10,
              icon: () => <FontStyleIcon width={15} height={15} />,
              children: [
                {
                  name: 'Typeface',
                  // icon: () => <FontStyleIcon width={15} height={15} />,
                  icon: () => <FontFamilyIcon width={15} height={15} />,
                  onSelect: () => {},
                },
                {
                  name: 'Text size',
                  icon: () => <FontSizeIcon width={15} height={15} />,
                  onSelect: () => {},
                },
                {
                  name: 'Letter spacing',
                  icon: () => <LetterSpacingIcon width={15} height={15} />,
                  onSelect: () => {},
                },
                {
                  name: 'Word spacing',
                  icon: () => <LetterSpacingIcon width={15} height={15} />,
                  onSelect: () => {},
                },
                {
                  name: 'Caps separator',
                  sep: true,
                },
                {
                  name: 'Large caps',
                  icon: () => <LetterCaseUppercaseIcon width={15} height={15} />,
                  onSelect: () => {},
                },
                {
                  name: 'Small caps',
                  icon: () => <LetterCaseLowercaseIcon width={15} height={15} />,
                  onSelect: () => {},
                },
              ],
            },
          ],
        },
        {
          name: 'Modify separator',
          sep: true,
        },
        this.state.menu.range.modifyMenu(),
        this.state.menu.buffer.clipboardMenu(),
        {
          name: 'Insert',
          icon: () => <BetweenVerticalEndIcon width={16} height={16} />,
          children: [
            {
              name: 'Smart chip',
              icon: () => <ButtonIcon width={15} height={15} />,
              children: [
                {
                  name: 'Date',
                  icon: () => <CalendarIcon width={15} height={15} />,
                  onSelect: () => {},
                },
                {
                  name: 'AI chip',
                  icon: () => <BrainIcon style={{color: 'purple'}} width={16} height={16} />,
                  onSelect: () => {},
                },
                {
                  name: 'Solana wallet',
                  icon: () => <WalletIcon width={16} height={16} />,
                  onSelect: () => {},
                },
                {
                  name: 'Dropdown',
                  icon: () => <DropdownMenuIcon width={15} height={15} />,
                  children: [
                    {
                      name: 'Create new',
                      icon: () => <PlusIcon width={15} height={15} />,
                      onSelect: () => {},
                    },
                    {
                      name: 'Document dropdowns separator',
                      sep: true,
                    },
                    {
                      name: 'Document dropdowns',
                      expand: 8,
                      onSelect: () => {},
                      children: [
                        {
                          name: 'Configuration 1',
                          icon: () => <DropdownMenuIcon width={15} height={15} />,
                          onSelect: () => {},
                        },
                        {
                          name: 'Configuration 2',
                          icon: () => <DropdownMenuIcon width={15} height={15} />,
                          onSelect: () => {},
                        },
                      ],
                    },
                    {
                      name: 'Presets dropdowns separator',
                      sep: true,
                    },
                    {
                      name: 'Presets dropdowns',
                      expand: 8,
                      onSelect: () => {},
                      children: [
                        {
                          name: 'Project status',
                          icon: () => <DropdownMenuIcon width={15} height={15} />,
                          onSelect: () => {},
                        },
                        {
                          name: 'Review status',
                          icon: () => <DropdownMenuIcon width={15} height={15} />,
                          onSelect: () => {},
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'Link',
              // icon: () => <LinkIcon width={15} height={15} />,
              icon: () => <LinkRadixIcon width={15} height={15} />,
              onSelect: () => {},
            },
            {
              name: 'Reference',
              icon: () => <SewingPinIcon width={15} height={15} />,
              onSelect: () => {},
            },
            {
              name: 'File',
              icon: () => <RadixFileIcon width={15} height={15} />,
              onSelect: () => {},
            },
            {
              name: 'Template',
              text: 'building blocks',
              icon: () => <TemplateIcon width={16} height={16} />,
              children: [
                {
                  name: 'Meeting notes',
                  onSelect: () => {},
                },
                {
                  name: 'Email draft (created by AI)',
                  onSelect: () => {},
                },
                {
                  name: 'Product roadmap',
                  onSelect: () => {},
                },
                {
                  name: 'Review tracker',
                  onSelect: () => {},
                },
                {
                  name: 'Project assets',
                  onSelect: () => {},
                },
                {
                  name: 'Content launch tracker',
                  onSelect: () => {},
                },
              ],
            },
            {
              name: 'On-screen keyboard',
              icon: () => <RadixKeyboardIcon width={15} height={15} />,
              onSelect: () => {},
            },
            {
              name: 'Emoji',
              icon: () => <SmilePlusIcon width={16} height={16} />,
              onSelect: () => {},
            },
            {
              name: 'Special characters',
              icon: () => <OmegaIcon width={16} height={16} />,
              onSelect: () => {},
            },
            {
              name: 'Variable',
              icon: () => <VariableIcon width={16} height={16} />,
              onSelect: () => {},
            },
          ],
        },
        {
          name: 'Developer tools',
          danger: true,
          icon: () => <SquareChevronRightIcon width={16} height={16} />,
          onSelect: () => {},
        },
      ],
    };
  };

  // public readonly getSelectionMenu = (): MenuItem => {
  //   return this.menu.range.build();
  // };

  // public readonly blockTypeMenu = (): MenuItem => {
  //   const et = this.surface.events.et;
  //   const menu: MenuItem = {
  //     name: 'Block type',
  //     expand: 1,
  //     expandChild: 0,
  //     children: [
  //       {
  //         name: 'Text blocks',
  //         expand: 3,
  //         children: [
  //           {
  //             name: 'Paragraph',
  //             icon: () => <PilcrowIcon width={16} height={16} />,
  //             onSelect: () => {
  //               et.marker('upd', SliceTypeName.p);
  //             },
  //           },
  //           {
  //             name: 'Code block',
  //             icon: () => <CodeIcon width={16} height={16} />,
  //             onSelect: () => {
  //               et.marker('upd', SliceTypeName.codeblock);
  //             },
  //           },
  //           {
  //             name: 'Blockquote',
  //             icon: () => <QuoteIcon width={16} height={16} />,
  //             onSelect: () => {
  //               et.marker('upd', [SliceTypeName.blockquote, SliceTypeName.p]);
  //             },
  //           },
  //           {
  //             name: 'Math block',
  //             icon: () => <MathIcon width={16} height={16} />,
  //             onSelect: () => {
  //               et.marker('upd', SliceTypeName.mathblock);
  //             },
  //           },
  //           {
  //             name: 'Pre-formatted',
  //             icon: () => <TypeIcon width={16} height={16} />,
  //             onSelect: () => {
  //               et.marker('upd', SliceTypeName.pre);
  //             },
  //           },
  //         ],
  //       },
  //       {
  //         name: 'Headings',
  //         sepBefore: true,
  //         expand: 3,
  //         children: [
  //           {
  //             name: 'Heading 1',
  //             icon: () => <H1Icon width={16} height={16} />,
  //             onSelect: () => {
  //               et.marker('upd', SliceTypeName.h1);
  //             },
  //           },
  //           {
  //             name: 'Heading 2',
  //             icon: () => <H2Icon width={16} height={16} />,
  //             onSelect: () => {
  //               et.marker('upd', SliceTypeName.h2);
  //             },
  //           },
  //           {
  //             name: 'Heading 3',
  //             icon: () => <H3Icon width={16} height={16} />,
  //             onSelect: () => {
  //               et.marker('upd', SliceTypeName.h3);
  //             },
  //           },
  //           {
  //             name: 'Heading 4',
  //             icon: () => <H4Icon width={16} height={16} />,
  //             onSelect: () => {
  //               et.marker('upd', SliceTypeName.h4);
  //             },
  //           },
  //           {
  //             name: 'Heading 5',
  //             icon: () => <H5Icon width={16} height={16} />,
  //             onSelect: () => {
  //               et.marker('upd', SliceTypeName.h5);
  //             },
  //           },
  //           {
  //             name: 'Heading 6',
  //             icon: () => <H6Icon width={16} height={16} />,
  //             onSelect: () => {
  //               et.marker('upd', SliceTypeName.h6);
  //             },
  //           },
  //           {
  //             sepBefore: true,
  //             name: 'Title',
  //             icon: () => <TypeIcon width={16} height={16} />,
  //             onSelect: () => {
  //               et.marker('upd', SliceTypeName.title);
  //             },
  //           },
  //           {
  //             name: 'Sub-title',
  //             icon: () => <TypeIcon width={16} height={16} />,
  //             onSelect: () => {
  //               et.marker('upd', SliceTypeName.subtitle);
  //             },
  //           },
  //         ],
  //       },
  //       {
  //         sepBefore: true,
  //         name: 'Lists',
  //         expand: 3,
  //         children: [
  //           {
  //             name: 'Bullet list',
  //             icon: () => <ListBulletedIcon width={16} height={16} />,
  //             onSelect: () => {
  //               et.marker('upd', [SliceTypeName.ul, SliceTypeName.li, SliceTypeName.p]);
  //             },
  //           },
  //           {
  //             name: 'Numbered list',
  //             icon: () => <ListNumberedIcon width={16} height={16} />,
  //             onSelect: () => {
  //               et.marker('upd', [SliceTypeName.ol, SliceTypeName.li, SliceTypeName.p]);
  //             },
  //           },
  //           {
  //             name: 'Task list',
  //             icon: () => <ListCheckedIcon width={16} height={16} />,
  //             onSelect: () => {
  //               et.marker('upd', [SliceTypeName.tl, SliceTypeName.li, SliceTypeName.p]);
  //             },
  //           },
  //         ],
  //       },
  //       {
  //         sepBefore: true,
  //         name: 'Layouts',
  //         expand: 0,
  //         icon: () => <LayoutIcon width={16} height={16} />,
  //         children: [
  //           {
  //             name: 'Table',
  //             icon: () => <TableIcon width={16} height={16} />,
  //             onSelect: () => {
  //               et.marker('upd', [SliceTypeName.table, SliceTypeName.tr, SliceTypeName.p]);
  //             },
  //           },
  //           {
  //             name: 'Columns',
  //             icon: () => <ColumnsIcon width={16} height={16} />,
  //             onSelect: () => {
  //               et.marker('upd', [SliceTypeName.column, SliceTypeName.p]);
  //             },
  //           },
  //         ],
  //       },
  //       {
  //         sepBefore: true,
  //         name: 'Embed',
  //         expand: 0,
  //         icon: () => <ImageInPictureIcon width={16} height={16} />,
  //         children: [
  //           {
  //             name: 'Image',
  //             icon: () => <PhotoScanIcon width={16} height={16} />,
  //             onSelect: () => {},
  //           },
  //           {
  //             name: 'File',
  //             icon: () => <TablerFileIcon width={16} height={16} />,
  //             onSelect: () => {},
  //           },
  //         ],
  //       },
  //     ],
  //   };
  //   return menu;
  // };

  // public readonly leafBlockSmallMenu = (ctx: LeafBlockMenuCtx): MenuItem => {
  //   const et = this.surface.events.et;
  //   const block = ctx.block;
  //   const menu: MenuItem = {
  //     name: 'Leaf block menu',
  //     maxToolbarItems: 1,
  //     more: true,
  //     minWidth: 280,
  //     children: [
  //       {...this.blockTypeMenu(), expand: 1, expandChild: 0},
  //       {
  //         sepBefore: true,
  //         name: 'Cursor actions',
  //         expand: 4,
  //         children: [
  //           {
  //             name: 'Select block',
  //             icon: () => <CursorTextIcon width={16} height={16} />,
  //             onSelect: () => {
  //               const start = block.start.clone();
  //               if (!start.isAbsStart()) start.step(1);
  //               et.cursor({at: [start, block.end]});
  //             },
  //           },
  //           this.menu.buffer.clipboardMenu({
  //             hideStyleActions: true,
  //             onBeforeAction: (item, action) => {
  //               const start = block.start.clone();
  //               if (!start.isAbsStart() && action === 'paste') start.step(1);
  //               return {
  //                 at: [start, block.end],
  //               };
  //             },
  //           }),
  //         ],
  //       },

  //       secondBrain(),
  //     ],
  //   };
  //   return menu;
  // };

  // public readonly documentMenu = (): MenuItem => {
  //   const _et = this.surface.events.et;
  //   const menu: MenuItem = {
  //     name: 'Document menu',
  //     maxToolbarItems: 1,
  //     more: true,
  //     minWidth: 280,
  //     children: [
  //       {
  //         name: 'History',
  //         expand: 2,
  //         children: [
  //           {
  //             name: 'Undo',
  //             icon: () => <UndoIcon width={16} height={16} />,
  //             onSelect: () => {},
  //           },
  //           {
  //             name: 'Redo',
  //             icon: () => <RedoIcon width={16} height={16} />,
  //             onSelect: () => {},
  //           },
  //         ],
  //       },
  //     ],
  //   };
  //   return menu;
  // };
}

// export interface LeafBlockMenuCtx {
//   block: LeafBlock<string>;
// }

// export interface ClipboardMenuCtx {
//   hideStyleActions?: boolean;
//   onBeforeAction?: (item: MenuItem, action: 'cut' | 'copy' | 'paste') => void | Partial<BufferDetail>;
// }
