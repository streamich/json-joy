import * as React from 'react';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {Code} from '@jsonjoy.com/ui/lib/1-inline/Code';
import {FontStyleButton} from '@jsonjoy.com/ui/lib/2-inline-block/FontStyleButton';
import type {MenuItem} from '../types';
import SecondBrainIcon__svg from 'iconista/lib/react/tabler/brain';
import MakeShorterIcon__svg from 'iconista/lib/react/tabler/viewport-short';
import MakeLongerIcon__svg from 'iconista/lib/react/tabler/viewport-tall';
import TypographyIcon__svg from 'iconista/lib/react/tabler/typography';
import FontStyleIcon__svg from 'iconista/lib/react/radix/font-style';
import FontFamilyIcon__svg from 'iconista/lib/react/radix/font-family';
import FontSizeIcon__svg from 'iconista/lib/react/radix/font-size';
import LetterSpacingIcon__svg from 'iconista/lib/react/radix/letter-spacing';
import LetterCaseUppercaseIcon__svg from 'iconista/lib/react/radix/letter-case-uppercase';
import LetterCaseLowercaseIcon__svg from 'iconista/lib/react/radix/letter-case-lowercase';
import LayersIcon__svg from 'iconista/lib/react/radix/layers';
import EraserIcon__svg from 'iconista/lib/react/tabler/eraser';
import TrashIcon__svg from 'iconista/lib/react/tabler/trash';
import CopyIcon__svg from 'iconista/lib/react/lucide/copy';
import ClipboardCopyIcon__svg from 'iconista/lib/react/radix/clipboard-copy';
import MarkdownIcon__svg from 'iconista/lib/react/simple/markdown';
import Html5Icon__svg from 'iconista/lib/react/simple/html5';
import ScissorsIcon__svg from 'iconista/lib/react/tabler/scissors';
import ClipboardIcon__svg from 'iconista/lib/react/radix/clipboard';
import BetweenVerticalEndIcon__svg from 'iconista/lib/react/lucide/between-vertical-end';
import ButtonIcon__svg from 'iconista/lib/react/radix/button';
import CalendarIcon__svg from 'iconista/lib/react/radix/calendar';
import WalletIcon__svg from 'iconista/lib/react/tabler/wallet';
import DropdownMenuIcon__svg from 'iconista/lib/react/radix/dropdown-menu';
import PlusIcon__svg from 'iconista/lib/react/radix/plus';
import LinkIcon__svg from 'iconista/lib/react/radix/link-2';
import SewingPinIcon__svg from 'iconista/lib/react/radix/sewing-pin';
import FileIcon__svg from 'iconista/lib/react/radix/file';
import TemplateIcon__svg from 'iconista/lib/react/tabler/template';
import RadixKeyboardIcon__svg from 'iconista/lib/react/radix/keyboard';
import SmilePlusIcon__svg from 'iconista/lib/react/lucide/smile-plus';
import OmegaIcon__svg from 'iconista/lib/react/lucide/omega';
import VariableIcon__svg from 'iconista/lib/react/lucide/variable';
import SquareChevronRightIcon__svg from 'iconista/lib/react/lucide/square-chevron-right';

// Second brain icons
const SecondBrainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SecondBrainIcon__svg {...props} />;
const MakeShorterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <MakeShorterIcon__svg {...props} />;
const MakeLongerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <MakeLongerIcon__svg {...props} />;

// Typesetting icons
const TypographyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <TypographyIcon__svg {...props} />;
const FontStyleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FontStyleIcon__svg {...props} />;
const FontFamilyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FontFamilyIcon__svg {...props} />;
const FontSizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FontSizeIcon__svg {...props} />;
const LetterSpacingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <LetterSpacingIcon__svg {...props} />;
const LetterCaseUppercaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <LetterCaseUppercaseIcon__svg {...props} />;
const LetterCaseLowercaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <LetterCaseLowercaseIcon__svg {...props} />;

// Modify icons
const LayersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <LayersIcon__svg {...props} />;
const EraserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <EraserIcon__svg {...props} />;
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <TrashIcon__svg {...props} />;

// Clipboard icons
const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <CopyIcon__svg {...props} />;
const ClipboardCopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ClipboardCopyIcon__svg {...props} />;
const MarkdownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <MarkdownIcon__svg {...props} />;
const Html5Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Html5Icon__svg {...props} />;
const ScissorsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ScissorsIcon__svg {...props} />;
const ClipboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ClipboardIcon__svg {...props} />;

// Insert icons
const BetweenVerticalEndIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <BetweenVerticalEndIcon__svg {...props} />;
const ButtonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ButtonIcon__svg {...props} />;
const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <CalendarIcon__svg {...props} />;
const WalletIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <WalletIcon__svg {...props} />;
const DropdownMenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <DropdownMenuIcon__svg {...props} />;
const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlusIcon__svg {...props} />;
const LinkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <LinkIcon__svg {...props} />;
const SewingPinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SewingPinIcon__svg {...props} />;
const FileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FileIcon__svg {...props} />;
const TemplateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <TemplateIcon__svg {...props} />;
const RadixKeyboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <RadixKeyboardIcon__svg {...props} />;
const SmilePlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SmilePlusIcon__svg {...props} />;
const OmegaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <OmegaIcon__svg {...props} />;
const VariableIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <VariableIcon__svg {...props} />;
const SquareChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SquareChevronRightIcon__svg {...props} />;

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
      name: 'Copy, cut & paste',
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
