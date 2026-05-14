import * as React from 'react';
import {Code} from '@jsonjoy.com/ui/lib/1-inline/Code';
import {CommonSliceType, SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import * as a from '../../inline/spans/a';
import type {MenuItem} from '../../types';
import type {EditorState} from '../EditorState';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';
import LayersIcon__svg from 'iconista/lib/react/radix/layers';
import BoxAlignRightIcon__svg from 'iconista/lib/react/tabler/box-align-right';
import EraserIcon__svg from 'iconista/lib/react/tabler/eraser';
import TrashIcon__svg from 'iconista/lib/react/tabler/trash';

const LayersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <LayersIcon__svg {...props} />;
const BoxAlignRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <BoxAlignRightIcon__svg {...props} />;
const EraserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <EraserIcon__svg {...props} />;
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <TrashIcon__svg {...props} />;

export class RangeMenu implements UiLifeCycles {
  public recent: MenuItem[] = [];

  constructor(public readonly state: EditorState) {}

  public start() {
    const {state, recent} = this;
    recent.push(
      ...([
        state.spanMap[SliceTypeCon.b]?.getMenu(state),
        state.spanMap[SliceTypeCon.i]?.getMenu(state),
        state.spanMap[SliceTypeCon.u]?.getMenu(state),
        state.spanMap[SliceTypeCon.code]?.getMenu(state),
      ].filter(Boolean) as any),
    );
    return () => {};
  }

  public build(): MenuItem {
    const children: MenuItem['children'] = [
      this.formattingMenu(),
      this.annotationsMenu(),
      // this.typesettingMenu(),
      this.modifyMenu(),
      this.state.menu.buffer.clipboardMenu(),
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
    const commands = this.state.cmd?.buildRangeMenu();
    if (commands) children.push(commands);
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

  private trackFmt(item: MenuItem): void {
    const orig = item.onSelect;
    const onSelect = (e: any) => {
      this.trackRecent(item);
      orig?.(e);
    };
    item.onSelect = onSelect;
  }

  private buildFmtGroup(group: MenuItem): void {
    const {id, children = []} = group;
    const state = this.state;
    const {spans} = state;
    const spanLength = spans.length;
    for (let i = 0; i < spanLength; i++) {
      const span = spans[i];
      if (span.menuId === id) {
        const item = span.getMenu(state);
        if (item) {
          this.trackFmt(item);
          children.push(item);
        }
      }
    }
    if (children.length) children.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  public formattingMenu(): MenuItem {
    const common: MenuItem = {
      id: 'fmt-common',
      name: 'Common',
      expand: 8,
      children: [],
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
    this.buildFmtGroup(common);
    this.buildFmtGroup(technical);
    this.buildFmtGroup(artistic);
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

  public readonly linkMenuItem = (): MenuItem => {
    const linkAction: MenuItem = {
      ...a.behavior.menu,
      onSelect: () => {
        this.state.selection.showNewSlicePopup(CommonSliceType.a);
      },
    };
    return linkAction;
  };

  public annotationsMenu(): MenuItem {
    return {
      name: 'Annotations',
      expand: 2,
      sepBefore: true,
      children: [
        this.linkMenuItem(),
        // {
        //   name: 'Comment',
        //   icon: () => <CommentTextIcon width={16} height={16} />,
        //   onSelect: () => {},
        // },
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
        {
          name: 'Aside',
          icon: () => <BoxAlignRightIcon width={16} height={16} />,
          onSelect: () => {},
        },
      ],
    };
  }

  public readonly modifyMenu = (): MenuItem => {
    const et = this.state.surface.events.et;
    return {
      name: 'Modify',
      expand: 3,
      sepBefore: true,
      children: [
        {
          name: 'Pick layer',
          right: () => (
            <Code size={-1} gray>
              9+
            </Code>
          ),
          more: true,
          icon: () => <LayersIcon width={15} height={15} />,
          onSelect: () => {},
        },
        {
          name: 'Erase formatting',
          danger: true,
          icon: () => <EraserIcon width={16} height={16} />,
          onSelect: () => {
            et.format({action: 'erase'});
          },
        },
        {
          name: 'Delete all in range',
          danger: true,
          more: true,
          icon: () => <TrashIcon width={16} height={16} />,
          onSelect: () => {
            et.format({action: 'del'});
          },
        },
      ],
    };
  };
}
