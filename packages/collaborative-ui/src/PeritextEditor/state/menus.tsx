import * as React from 'react';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {Code} from '@jsonjoy.com/ui/lib/1-inline/Code';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {FontStyleButton} from '@jsonjoy.com/ui/lib/2-inline-block/FontStyleButton';
import type {MenuItem} from '../types';

// Second brain icons
const SecondBrainIcon = makeIcon({set: "tabler", icon: "brain"});
const MakeShorterIcon = makeIcon({set: "tabler", icon: "viewport-short"});
const MakeLongerIcon = makeIcon({set: "tabler", icon: "viewport-tall"});

// Typesetting icons
const TypographyIcon = makeIcon({set: "tabler", icon: "typography"});
const FontStyleIcon = makeIcon({set: "radix", icon: "font-style"});
const FontFamilyIcon = makeIcon({set: "radix", icon: "font-family"});
const FontSizeIcon = makeIcon({set: "radix", icon: "font-size"});
const LetterSpacingIcon = makeIcon({set: "radix", icon: "letter-spacing"});
const LetterCaseUppercaseIcon = makeIcon({set: "radix", icon: "letter-case-uppercase"});
const LetterCaseLowercaseIcon = makeIcon({set: "radix", icon: "letter-case-lowercase"});

// Modify icons
const LayersIcon = makeIcon({set: "radix", icon: "layers"});
const EraserIcon = makeIcon({set: "tabler", icon: "eraser"});
const TrashIcon = makeIcon({set: "tabler", icon: "trash"});

// Clipboard icons
const CopyIcon = makeIcon({set: "lucide", icon: "copy"});
const ClipboardCopyIcon = makeIcon({set: "radix", icon: "clipboard-copy"});
const MarkdownIcon = makeIcon({set: "simple", icon: "markdown"});
const Html5Icon = makeIcon({set: "simple", icon: "html5"});
const ScissorsIcon = makeIcon({set: "tabler", icon: "scissors"});
const ClipboardIcon = makeIcon({set: "radix", icon: "clipboard"});

// Insert icons
const BetweenVerticalEndIcon = makeIcon({set: "lucide", icon: "between-vertical-end"});
const ButtonIcon = makeIcon({set: "radix", icon: "button"});
const CalendarIcon = makeIcon({set: "radix", icon: "calendar"});
const WalletIcon = makeIcon({set: "tabler", icon: "wallet"});
const DropdownMenuIcon = makeIcon({set: "radix", icon: "dropdown-menu"});
const PlusIcon = makeIcon({set: "radix", icon: "plus"});
const LinkIcon = makeIcon({set: "radix", icon: "link-2"});
const SewingPinIcon = makeIcon({set: "radix", icon: "sewing-pin"});
const FileIcon = makeIcon({set: "radix", icon: "file"});
const TemplateIcon = makeIcon({set: "tabler", icon: "template"});
const RadixKeyboardIcon = makeIcon({set: "radix", icon: "keyboard"});
const SmilePlusIcon = makeIcon({set: "lucide", icon: "smile-plus"});
const OmegaIcon = makeIcon({set: "lucide", icon: "omega"});
const VariableIcon = makeIcon({set: "lucide", icon: "variable"});
const SquareChevronRightIcon = makeIcon({set: "lucide", icon: "square-chevron-right"});

export const secondBrain = (): MenuItem => {
  return {
    sepBefore: true,
    name: 'Second brain',
    display: () => (
      <>
        <span style={{color: 'purple'}}>Second brain</span>
        {/* &nbsp;
        <span style={{opacity: .3}}>AI</span> */}
      </>
    ),
    right: () => <Sidetip small>{'AI'}</Sidetip>,
    icon: () => <SecondBrainIcon style={{color: 'purple'}} width={16} height={16} />,
    children: [
      {
        name: 'Ask question',
      },
      {
        name: 'Action',
        children: [
          {
            name: 'Make shorter',
            icon: () => <MakeShorterIcon width={16} height={16} />,
            onSelect: () => {},
          },
          {
            name: 'Make longer',
            icon: () => <MakeLongerIcon width={16} height={16} />,
            onSelect: () => {},
          },
          {name: 'Add humor'},
          {name: 'Make more professional'},
          {name: 'Make it: ...'},
        ],
      },
      {
        name: 'Translate',
        children: [
          {
            name: 'Afrikaans',
            onSelect: () => {},
          },
          {
            name: 'Arabic',
            onSelect: () => {},
          },
          {
            name: 'Bengali',
            onSelect: () => {},
          },
          {
            name: 'Bulgarian',
            onSelect: () => {},
          },
          {
            name: 'Catalan',
            onSelect: () => {},
          },
          {
            name: 'Cantonese',
            onSelect: () => {},
          },
          {
            name: 'Croatian',
            onSelect: () => {},
          },
          {
            name: 'Czech',
            onSelect: () => {},
          },
          {
            name: 'Danish',
            onSelect: () => {},
          },
          {
            name: 'Dutch',
            onSelect: () => {},
          },
          {
            name: 'Lithuanian',
            onSelect: () => {},
          },
          {
            name: 'Malay',
            onSelect: () => {},
          },
          {
            name: 'Malayalam',
            onSelect: () => {},
          },
          {
            name: 'Panjabi',
            onSelect: () => {},
          },
          {
            name: 'Tamil',
            onSelect: () => {},
          },
          {
            name: 'English',
            onSelect: () => {},
          },
          {
            name: 'Finnish',
            onSelect: () => {},
          },
          {
            name: 'French',
            onSelect: () => {},
          },
          {
            name: 'German',
            onSelect: () => {},
          },
          {
            name: 'Greek',
            onSelect: () => {},
          },
          {
            name: 'Hebrew',
            onSelect: () => {},
          },
          {
            name: 'Hindi',
            onSelect: () => {},
          },
          {
            name: 'Hungarian',
            onSelect: () => {},
          },
          {
            name: 'Indonesian',
            onSelect: () => {},
          },
          {
            name: 'Italian',
            onSelect: () => {},
          },
          {
            name: 'Japanese',
            onSelect: () => {},
          },
          {
            name: 'Javanese',
            onSelect: () => {},
          },
          {
            name: 'Korean',
            onSelect: () => {},
          },
          {
            name: 'Norwegian',
            onSelect: () => {},
          },
          {
            name: 'Polish',
            onSelect: () => {},
          },
          {
            name: 'Portuguese',
            onSelect: () => {},
          },
          {
            name: 'Romanian',
            onSelect: () => {},
          },
          {
            name: 'Russian',
            onSelect: () => {},
          },
          {
            name: 'Serbian',
            onSelect: () => {},
          },
          {
            name: 'Slovak',
            onSelect: () => {},
          },
          {
            name: 'Slovene',
            onSelect: () => {},
          },
          {
            name: 'Spanish',
            onSelect: () => {},
          },
          {
            name: 'Swedish',
            onSelect: () => {},
          },
          {
            name: 'Thai',
            onSelect: () => {},
          },
          {
            name: 'Turkish',
            onSelect: () => {},
          },
          {
            name: 'Ukrainian',
            onSelect: () => {},
          },
          {
            name: 'Vietnamese',
            onSelect: () => {},
          },
        ],
      },
    ],
  };
};

export const inlineText: MenuItem = {
  name: 'Inline text',
  maxToolbarItems: 4,
  children: [
    secondBrain(),
    {
      name: 'Annotations separator',
      sep: true,
    },
    // annotations(),
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
    {
      name: 'Modify',
      expand: 3,
      onSelect: () => {},
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
          onSelect: () => {},
        },
        {
          name: 'Delete all in range',
          danger: true,
          more: true,
          icon: () => <TrashIcon width={16} height={16} />,
          onSelect: () => {},
        },
      ],
    },
    {
      name: 'Clipboard separator',
      sep: true,
    },
    {
      name: 'Copy, cut, and paste',
      // icon: () => <ClipboardCopyIcon width={15} height={15} />,
      icon: () => <CopyIcon width={16} height={16} />,
      expand: 0,
      children: [
        {
          id: 'copy-menu',
          name: 'Copy',
          // icon: () => <ClipboardCopyIcon width={15} height={15} />,
          icon: () => <ClipboardCopyIcon width={15} height={15} />,
          expand: 5,
          children: [
            {
              name: 'Copy',
              icon: () => <ClipboardCopyIcon width={15} height={15} />,
              onSelect: () => {},
            },
            {
              name: 'Copy text only',
              icon: () => <ClipboardCopyIcon width={15} height={15} />,
              onSelect: () => {},
            },
            {
              name: 'Copy as Markdown',
              icon: () => <ClipboardCopyIcon width={15} height={15} />,
              right: () => <MarkdownIcon width={16} height={16} style={{opacity: 0.5}} />,
              onSelect: () => {},
            },
            {
              name: 'Copy as HTML',
              icon: () => <ClipboardCopyIcon width={15} height={15} />,
              right: () => <Html5Icon width={14} height={14} style={{opacity: 0.5}} />,
              onSelect: () => {},
            },
          ],
        },
        {
          name: 'Cut separator',
          sep: true,
        },
        {
          id: 'cut-menu',
          name: 'Cut',
          // icon: () => <ClipboardCopyIcon width={15} height={15} />,
          icon: () => <ScissorsIcon width={16} height={16} />,
          expand: 5,
          children: [
            {
              name: 'Cut',
              danger: true,
              icon: () => <ScissorsIcon width={16} height={16} />,
              onSelect: () => {},
            },
            {
              name: 'Cut text only',
              danger: true,
              icon: () => <ScissorsIcon width={16} height={16} />,
              onSelect: () => {},
            },
            {
              name: 'Cut as Markdown',
              danger: true,
              icon: () => <ScissorsIcon width={16} height={16} />,
              right: () => <MarkdownIcon width={16} height={16} style={{opacity: 0.5}} />,
              onSelect: () => {},
            },
            {
              name: 'Cut as HTML',
              danger: true,
              icon: () => <ScissorsIcon width={16} height={16} />,
              right: () => <Html5Icon width={14} height={14} style={{opacity: 0.5}} />,
              onSelect: () => {},
            },
          ],
        },
        {
          name: 'Paste separator',
          sep: true,
        },
        {
          id: 'paste-menu',
          name: 'Paste',
          icon: () => <ClipboardIcon width={15} height={15} />,
          expand: 5,
          children: [
            {
              name: 'Paste',
              icon: () => <ClipboardIcon width={15} height={15} />,
              onSelect: () => {},
            },
            {
              name: 'Paste text only',
              icon: () => <ClipboardIcon width={15} height={15} />,
              onSelect: () => {},
            },
            {
              name: 'Paste formatting',
              icon: () => <ClipboardIcon width={15} height={15} />,
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
              icon: () => <SecondBrainIcon style={{color: 'purple'}} width={16} height={16} />,
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
          icon: () => <LinkIcon width={15} height={15} />,
          onSelect: () => {},
        },
        {
          name: 'Reference',
          icon: () => <SewingPinIcon width={15} height={15} />,
          onSelect: () => {},
        },
        {
          name: 'File',
          icon: () => <FileIcon width={15} height={15} />,
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
