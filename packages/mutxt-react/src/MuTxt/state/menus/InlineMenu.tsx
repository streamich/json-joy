import * as React from 'react';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {Code} from '@jsonjoy.com/ui/lib/1-inline/Code';
import {CommonSliceType, SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import type {MenuItem} from '../../types';
import type {MuTxtState} from '../MuTxtState';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';

export interface InlineMenuItem extends MenuItem {
  mark: string;
}

const BoldIcon = makeIcon({set: 'radix', icon: 'font-bold', width: 15, height: 15});

const LayersIcon = makeIcon({set: 'radix', icon: 'layers'});
const BoxAlignRightIcon = makeIcon({set: 'tabler', icon: 'box-align-right'});
const EraserIcon = makeIcon({set: 'tabler', icon: 'eraser'});
const TrashIcon = makeIcon({set: 'tabler', icon: 'trash'});

export class InlineMenu implements UiLifeCycles {
  public recent: MenuItem[] = [];

  constructor(public readonly state: MuTxtState) {}

  public start() {
    const {state, recent} = this;
    // recent.push(
    //   ...([
    //     state.spanMap[SliceTypeCon.b]?.getMenu(state),
    //     state.spanMap[SliceTypeCon.i]?.getMenu(state),
    //     state.spanMap[SliceTypeCon.u]?.getMenu(state),
    //     state.spanMap[SliceTypeCon.code]?.getMenu(state),
    //   ].filter(Boolean) as any),
    // );
    return () => {};
  }

  public build(): MenuItem {
    const children: MenuItem['children'] = [
      this.menuFormatting(),
      this.annotationsMenu(),
      // this.typesettingMenu(),
      // this.modifyMenu(),
      // this.state.menu.buffer.clipboardMenu(),
      /*
        secondBrain(),
        {
          name: 'Annotations separator',
          sep: true,
        },
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
        */
    ];
    return {
      name: 'Selection menu',
      maxToolbarItems: 4,
      more: true,
      children,
    };
  }

  // private et() {
  //   return this.state.surface.events.et;
  // };

  private trackRecent(item: MenuItem): void {
    const recent = this.recent;
    const idx = recent.findIndex((r) => r.name === item.name);
    if (idx !== -1) recent.splice(idx, 1);
    recent.unshift(item);
    if (recent.length > 4) recent.length = 4;
  }

  private buildFmtGroup(group: MenuItem): void {
    const {id, children = []} = group;
    const state = this.state;
    // const {spans} = state;
    // const spanLength = spans.length;
    // for (let i = 0; i < spanLength; i++) {
    //   const span = spans[i];
    //   if (span.menuId === id) {
    //     const item = span.getMenu(state);
    //     if (item) {
    //       this.trackFmt(item);
    //       children.push(item);
    //     }
    //   }
    // }
    if (children.length) children.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  // {key: 'bold', title: 'Bold', iconSet: 'radix', icon: 'font-bold', shortcut: 'Cmd+B', format: 'bold'},
  // {key: 'italic', title: 'Italic', iconSet: 'lucide', icon: 'italic', shortcut: 'Cmd+I', format: 'italic'},
  // {key: 'underline', title: 'Underline', iconSet: 'tabler', icon: 'underline', shortcut: 'Cmd+U', format: 'underline'},
  // {key: 'code', title: 'Inline code', iconSet: 'tabler', icon: 'code', shortcut: 'Cmd+E', format: 'code'},

  public itemBold(): InlineMenuItem {
    return {
      mark: 'bold',
      name: 'Bold',
      icon: () => <BoldIcon />,
      right: () => <Sidetip small>⌘ B</Sidetip>,
      keys: ['⌘', 'b'],
      onSelect: () => {
        this.state.api.toggleMark('bold');
      },
    };
  }

  public menuFormatting(): MenuItem {
    const common: MenuItem = {
      id: 'fmt-common',
      name: 'Common',
      expand: 8,
      children: [
        this.itemBold(),
      ],
    };
    const technical: MenuItem = {
      id: 'fmt-technical',
      name: 'Technical',
      sepBefore: true,
      expand: 8,
      children: [],
    };
    const artistic: MenuItem = {
      id: 'fmt-artistic',
      name: 'Artistic',
      sepBefore: true,
      expand: 8,
      children: [],
    };
    const formatting: MenuItem = {
      name: 'Formatting',
      expandChild: 0,
      preview: this.recent,
      children: [] as MenuItem[],
    };
    const children = formatting.children!;
    if (common.children?.length) children.push(common);
    else technical.sepBefore = false;
    if (technical.children?.length) children.push(technical);
    else artistic.sepBefore = false;
    if (artistic.children?.length) children.push(artistic);
    return formatting;
  }

  // public readonly colorMenuItem = (): MenuItem => {
  //   const colorItem: MenuItem = {
  //     ...col.behavior.menu,
  //     onSelect: () => {
  //       this.state.startSliceConfig(CommonSliceType.col, colorItem);
  //     },
  //   };
  //   return colorItem;
  // };

  // public readonly bgMenuItem = (): MenuItem => {
  //   const bgItem: MenuItem = {
  //     ...bg.behavior.menu,
  //     onSelect: () => {
  //       this.state.startSliceConfig(CommonSliceType.bg, bgItem);
  //     },
  //   };
  //   return bgItem;
  // };

  // public readonly linkMenuItem = (): MenuItem => {
  //   const linkAction: MenuItem = {
  //     ...a.behavior.menu,
  //     onSelect: () => {
  //       this.state.selection.showNewSlicePopup(CommonSliceType.a);
  //     },
  //   };
  //   return linkAction;
  // };

  public annotationsMenu(): MenuItem {
    return {
      name: 'Annotations',
      expand: 2,
      sepBefore: true,
      children: [
        // this.linkMenuItem(),
        {
          name: 'Comment',
          icon: () => <LayersIcon width={16} height={16} />,
          onSelect: () => {},
        },
        // {
        //   name: 'Bookmark',
        //   icon: () => <FlagIcon width={16} height={16} />,
        //   onSelect: () => {},
        // },
        // {
        //   name: 'Footnote',
        //   icon: () => <FootprintsIcon width={16} height={16} />,
        //   onSelect: () => {},
        // },
        // {
        //   name: 'Aside',
        //   icon: () => <BoxAlignRightIcon width={16} height={16} />,
        //   onSelect: () => {},
        // },
      ],
    };
  }
}
