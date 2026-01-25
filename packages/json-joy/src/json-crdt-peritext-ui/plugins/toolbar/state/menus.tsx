import * as React from 'react';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {Code} from '@jsonjoy.com/ui/lib/1-inline/Code';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {FontStyleButton} from '@jsonjoy.com/ui/lib/2-inline-block/FontStyleButton';
import type {MenuItem} from '../types';

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
    icon: () => <Iconista style={{color: 'purple'}} width={16} height={16} set="tabler" icon="brain" />,
    children: [
      {
        name: 'Ask question',
      },
      {
        name: 'Action',
        children: [
          {
            name: 'Make shorter',
            icon: () => <Iconista width={16} height={16} set="tabler" icon="viewport-short" />,
            onSelect: () => {},
          },
          {
            name: 'Make longer',
            icon: () => <Iconista width={16} height={16} set="tabler" icon="viewport-tall" />,
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
      icon: () => <Iconista width={16} height={16} set="tabler" icon="typography" />,
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
          icon: () => <Iconista width={15} height={15} set="radix" icon="font-style" />,
          children: [
            {
              name: 'Typeface',
              // icon: () => <Iconista width={15} height={15} set="radix" icon="font-style" />,
              icon: () => <Iconista width={15} height={15} set="radix" icon="font-family" />,
              onSelect: () => {},
            },
            {
              name: 'Text size',
              icon: () => <Iconista width={15} height={15} set="radix" icon="font-size" />,
              onSelect: () => {},
            },
            {
              name: 'Letter spacing',
              icon: () => <Iconista width={15} height={15} set="radix" icon="letter-spacing" />,
              onSelect: () => {},
            },
            {
              name: 'Word spacing',
              icon: () => <Iconista width={15} height={15} set="radix" icon="letter-spacing" />,
              onSelect: () => {},
            },
            {
              name: 'Caps separator',
              sep: true,
            },
            {
              name: 'Large caps',
              icon: () => <Iconista width={15} height={15} set="radix" icon="letter-case-uppercase" />,
              onSelect: () => {},
            },
            {
              name: 'Small caps',
              icon: () => <Iconista width={15} height={15} set="radix" icon="letter-case-lowercase" />,
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
          icon: () => <Iconista width={15} height={15} set="radix" icon="layers" />,
          onSelect: () => {},
        },
        {
          name: 'Erase formatting',
          danger: true,
          icon: () => <Iconista width={16} height={16} set="tabler" icon="eraser" />,
          onSelect: () => {},
        },
        {
          name: 'Delete all in range',
          danger: true,
          more: true,
          icon: () => <Iconista width={16} height={16} set="tabler" icon="trash" />,
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
      // icon: () => <Iconista width={15} height={15} set="radix" icon="copy" />,
      icon: () => <Iconista width={16} height={16} set="lucide" icon="copy" />,
      expand: 0,
      children: [
        {
          id: 'copy-menu',
          name: 'Copy',
          // icon: () => <Iconista width={15} height={15} set="radix" icon="copy" />,
          icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
          expand: 5,
          children: [
            {
              name: 'Copy',
              icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
              onSelect: () => {},
            },
            {
              name: 'Copy text only',
              icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
              onSelect: () => {},
            },
            {
              name: 'Copy as Markdown',
              icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
              right: () => <Iconista width={16} height={16} set="simple" icon="markdown" style={{opacity: 0.5}} />,
              onSelect: () => {},
            },
            {
              name: 'Copy as HTML',
              icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
              right: () => <Iconista width={14} height={14} set="simple" icon="html5" style={{opacity: 0.5}} />,
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
          // icon: () => <Iconista width={15} height={15} set="radix" icon="copy" />,
          icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
          expand: 5,
          children: [
            {
              name: 'Cut',
              danger: true,
              icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
              onSelect: () => {},
            },
            {
              name: 'Cut text only',
              danger: true,
              icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
              onSelect: () => {},
            },
            {
              name: 'Cut as Markdown',
              danger: true,
              icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
              right: () => <Iconista width={16} height={16} set="simple" icon="markdown" style={{opacity: 0.5}} />,
              onSelect: () => {},
            },
            {
              name: 'Cut as HTML',
              danger: true,
              icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
              right: () => <Iconista width={14} height={14} set="simple" icon="html5" style={{opacity: 0.5}} />,
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
          icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard" />,
          expand: 5,
          children: [
            {
              name: 'Paste',
              icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard" />,
              onSelect: () => {},
            },
            {
              name: 'Paste text only',
              icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard" />,
              onSelect: () => {},
            },
            {
              name: 'Paste formatting',
              icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard" />,
              onSelect: () => {},
            },
          ],
        },
      ],
    },
    {
      name: 'Insert',
      icon: () => <Iconista width={16} height={16} set="lucide" icon="between-vertical-end" />,
      children: [
        {
          name: 'Smart chip',
          icon: () => <Iconista width={15} height={15} set="radix" icon="button" />,
          children: [
            {
              name: 'Date',
              icon: () => <Iconista width={15} height={15} set="radix" icon="calendar" />,
              onSelect: () => {},
            },
            {
              name: 'AI chip',
              icon: () => <Iconista style={{color: 'purple'}} width={16} height={16} set="tabler" icon="brain" />,
              onSelect: () => {},
            },
            {
              name: 'Solana wallet',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="wallet" />,
              onSelect: () => {},
            },
            {
              name: 'Dropdown',
              icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
              children: [
                {
                  name: 'Create new',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="plus" />,
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
                      icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
                      onSelect: () => {},
                    },
                    {
                      name: 'Configuration 2',
                      icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
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
                      icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
                      onSelect: () => {},
                    },
                    {
                      name: 'Review status',
                      icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
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
          // icon: () => <Iconista width={15} height={15} set="lucide" icon="link" />,
          icon: () => <Iconista width={15} height={15} set="radix" icon="link-2" />,
          onSelect: () => {},
        },
        {
          name: 'Reference',
          icon: () => <Iconista width={15} height={15} set="radix" icon="sewing-pin" />,
          onSelect: () => {},
        },
        {
          name: 'File',
          icon: () => <Iconista width={15} height={15} set="radix" icon="file" />,
          onSelect: () => {},
        },
        {
          name: 'Template',
          text: 'building blocks',
          icon: () => <Iconista width={16} height={16} set="tabler" icon="template" />,
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
          icon: () => <Iconista width={15} height={15} set="radix" icon="keyboard" />,
          onSelect: () => {},
        },
        {
          name: 'Emoji',
          icon: () => <Iconista width={16} height={16} set="lucide" icon="smile-plus" />,
          onSelect: () => {},
        },
        {
          name: 'Special characters',
          icon: () => <Iconista width={16} height={16} set="lucide" icon="omega" />,
          onSelect: () => {},
        },
        {
          name: 'Variable',
          icon: () => <Iconista width={16} height={16} set="lucide" icon="variable" />,
          onSelect: () => {},
        },
      ],
    },
    {
      name: 'Developer tools',
      danger: true,
      icon: () => <Iconista width={16} height={16} set="lucide" icon="square-chevron-right" />,
      onSelect: () => {},
    },
  ],
};
