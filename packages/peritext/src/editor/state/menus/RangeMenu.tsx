import * as React from 'react';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {Code} from '@jsonjoy.com/ui/lib/1-inline/Code';
import {CommonSliceType} from 'json-joy/lib/json-crdt-extensions';
import * as a from '../../inline/tags/a';
import * as col from '../../inline/tags/col';
import * as bg from '../../inline/tags/bg';
import type {MenuItem} from '../../types';
import type {EditorState} from '../EditorState';

const FontBoldIcon = makeIcon({set: 'radix', icon: 'font-bold'});
const LayersIcon = makeIcon({set: 'radix', icon: 'layers'});
const UnderlineIcon = makeIcon({set: 'tabler', icon: 'underline'});
const StrikethroughIcon = makeIcon({set: 'tabler', icon: 'strikethrough'});
const OverlineIcon = makeIcon({set: 'tabler', icon: 'overline'});
const HighlightIcon = makeIcon({set: 'tabler', icon: 'highlight'});
const LockPasswordIcon = makeIcon({set: 'tabler', icon: 'lock-password'});
const CodeIcon = makeIcon({set: 'tabler', icon: 'code'});
const MathIntegralXIcon = makeIcon({set: 'tabler', icon: 'math-integral-x'});
const SuperscriptIcon = makeIcon({set: 'tabler', icon: 'superscript'});
const SubscriptIcon = makeIcon({set: 'tabler', icon: 'subscript'});
const PencilPlusIcon = makeIcon({set: 'tabler', icon: 'pencil-plus'});
const PencilMinusIcon = makeIcon({set: 'tabler', icon: 'pencil-minus'});
const BoxAlignRightIcon = makeIcon({set: 'tabler', icon: 'box-align-right'});
const EraserIcon = makeIcon({set: 'tabler', icon: 'eraser'});
const TrashIcon = makeIcon({set: 'tabler', icon: 'trash'});
const ItalicIcon = makeIcon({set: 'lucide', icon: 'italic'});
const KeyboardIcon = makeIcon({set: 'lucide', icon: 'keyboard'});

export class RangeMenu {
  constructor(
    public readonly state: EditorState,
  ) {}

  public build(): MenuItem {
    return {
      name: 'Selection menu',
      // maxToolbarItems: 8,
      more: true,
      children: [
        this.formattingMenu(),
        this.annotationsMenu(),
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
      ],
    };
  }

  private et() {
    return this.state.surface.events.et;
  }

  public readonly bold: MenuItem = {
    name: 'Bold',
    icon: () => <FontBoldIcon width={15} height={15} />,
    right: () => <Sidetip small>⌘ B</Sidetip>,
    keys: ['⌘', 'b'],
    onSelect: () => {
      this.trackRecent(this.bold);
      this.et().format('tog', CommonSliceType.b);
    },
  };

  public readonly italic: MenuItem = {
    name: 'Italic',
    icon: () => <ItalicIcon width={14} height={14} />,
    right: () => <Sidetip small>⌘ I</Sidetip>,
    keys: ['⌘', 'i'],
    onSelect: () => {
      this.trackRecent(this.italic);
      this.et().format('tog', CommonSliceType.i);
    },
  };

  public readonly underline: MenuItem = {
    name: 'Underline',
    icon: () => <UnderlineIcon width={16} height={16} />,
    right: () => <Sidetip small>⌘ U</Sidetip>,
    keys: ['⌘', 'u'],
    onSelect: () => {
      this.trackRecent(this.underline);
      this.et().format('tog', CommonSliceType.u);
    },
  };

  public readonly inlineCode: MenuItem = {
    name: 'Code',
    icon: () => <CodeIcon width={16} height={16} />,
    right: () => <Sidetip small>⌘ E</Sidetip>,
    keys: ['⌘', 'e'],
    onSelect: () => {
      this.trackRecent(this.inlineCode);
      this.et().format('tog', CommonSliceType.code);
    },
  };

  public recent: MenuItem[] = [this.bold, this.italic, this.underline, this.inlineCode];

  private trackRecent(item: MenuItem): void {
    const recent = this.recent;
    const idx = recent.findIndex((r) => r.name === item.name);
    if (idx !== -1) recent.splice(idx, 1);
    recent.unshift(item);
    if (recent.length > 4) recent.length = 4;
  }

  public formattingMenu(): MenuItem {
    const et = this.state.et;
    const track = (item: MenuItem): MenuItem => {
      const orig = item.onSelect;
      return orig
        ? {...item, onSelect: (e) => { this.trackRecent(item); orig(e); }}
        : item;
    };
    return {
      name: 'Formatting',
      expandChild: 0,
      preview: this.recent,
      children: [
        {
          name: 'Common',
          expand: 8,
          children: [
            this.bold,
            this.italic,
            this.underline,
            track({
              name: 'Strikethrough',
              icon: () => <StrikethroughIcon width={16} height={16} />,
              onSelect: () => {
                et.format('tog', CommonSliceType.s);
              },
            }),
            track({
              name: 'Overline',
              icon: () => <OverlineIcon width={16} height={16} />,
              onSelect: () => {
                et.format('tog', CommonSliceType.overline);
              },
            }),
            track({
              name: 'Highlight',
              icon: () => <HighlightIcon width={16} height={16} />,
              onSelect: () => {
                et.format('tog', CommonSliceType.mark);
              },
            }),
            track({
              name: 'Spoiler',
              icon: () => <LockPasswordIcon width={16} height={16} />,
              onSelect: () => {
                et.format('tog', CommonSliceType.spoiler);
              },
            }),
          ],
        },
        {
          name: 'Technical separator',
          sep: true,
        },
        {
          name: 'Technical',
          expand: 8,
          children: [
            this.inlineCode,
            track({
              name: 'Math',
              icon: () => <MathIntegralXIcon width={16} height={16} />,
              onSelect: () => {
                et.format({
                  action: 'tog',
                  type: CommonSliceType.math,
                  stack: 'atomic',
                  padded: true,
                });
              },
            }),
            track({
              name: 'Superscript',
              icon: () => <SuperscriptIcon width={16} height={16} />,
              onSelect: () => {
                et.format('tog', CommonSliceType.sup);
              },
            }),
            track({
              name: 'Subscript',
              icon: () => <SubscriptIcon width={16} height={16} />,
              onSelect: () => {
                et.format('tog', CommonSliceType.sub);
              },
            }),
            track({
              name: 'Keyboard key',
              icon: () => <KeyboardIcon width={16} height={16} />,
              onSelect: () => {
                et.format('tog', CommonSliceType.kbd);
              },
            }),
            track({
              name: 'Insertion',
              icon: () => <PencilPlusIcon width={16} height={16} />,
              onSelect: () => {
                et.format('tog', CommonSliceType.ins);
              },
            }),
            track({
              name: 'Deletion',
              icon: () => <PencilMinusIcon width={16} height={16} />,
              onSelect: () => {
                et.format('tog', CommonSliceType.del);
              },
            }),
          ],
        },
        {
          name: 'Artistic separator',
          sep: true,
        },
        {
          name: 'Artistic',
          expand: 8,
          children: [
            track(this.colorMenuItem()),
            track(this.bgMenuItem()),
            // {
            //   name: 'Border',
            //   icon: () => <BorderLeftIcon width={16} height={16} />,
            //   onSelect: () => {},
            // },
          ],
        },
      ],
    };
  }

  public readonly colorMenuItem = (): MenuItem => {
    const colorItem: MenuItem = {
      ...col.behavior.menu,
      onSelect: () => {
        this.state.startSliceConfig(CommonSliceType.col, colorItem);
      },
    };
    return colorItem;
  };

  public readonly bgMenuItem = (): MenuItem => {
    const bgItem: MenuItem = {
      ...bg.behavior.menu,
      onSelect: () => {
        this.state.startSliceConfig(CommonSliceType.bg, bgItem);
      },
    };
    return bgItem;
  };

  public readonly linkMenuItem = (): MenuItem => {
    const linkAction: MenuItem = {
      ...a.behavior.menu,
      onSelect: () => {
        this.state.startSliceConfig(CommonSliceType.a, linkAction);
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
