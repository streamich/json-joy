// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {Sidetip} from 'nice-ui/lib/1-inline/Sidetip';
import {Iconista} from 'nice-ui/lib/icons/Iconista';
import {ValueSyncStore} from '../../../../util/events/sync-store';
import {annotations, secondBrain} from './menus';
import {Code} from 'nice-ui/lib/1-inline/Code';
import {FontStyleButton} from 'nice-ui/lib/2-inline-block/FontStyleButton';
import type {UiLifeCyclesRender} from '../../../dom/types';
import type {PeritextEventDetailMap} from '../../../events/types';
import type {PeritextSurfaceState} from '../../../react';
import type {MenuItem} from '../types';

export class ToolbarState implements UiLifeCyclesRender {
  public lastEvent: PeritextEventDetailMap['change']['ev'] | undefined = void 0;
  public readonly showCaretToolbar = new ValueSyncStore<boolean>(false);

  constructor(public readonly surface: PeritextSurfaceState) {}

  /** -------------------------------------------------- {@link UiLifeCyclesRender} */

  public start() {
    const et = this.surface.events.et;
    const changeUnsubscribe = et.subscribe('change', (ev) => {
      const lastEvent = ev.detail.ev;
      this.lastEvent = lastEvent;
      const lastEventIsCaretPositionChange =
        lastEvent?.type === 'cursor' &&
        typeof (lastEvent?.detail as PeritextEventDetailMap['cursor']).at === 'number';
      if (lastEventIsCaretPositionChange)
        this.showCaretToolbar.next(true);
    });
    return () => {
      changeUnsubscribe();
    };
  }

  // -------------------------------------------------------------------- Menus

  public readonly getFormattingMenu = (): MenuItem => {
    return (
          {
            name: 'Formatting',
            expandChild: 0,
            children: [
              {
                name: 'Common',
                expand: 8,
                children: [
                  {
                    name: 'Bold',
                    icon: () => <Iconista width={15} height={15} set="radix" icon="font-bold" />,
                    // icon: () => <Iconista width={16} height={16} set="lucide" icon="bold" />,
                    right: () => <Sidetip small>⌘ B</Sidetip>,
                    keys: ['⌘', 'b'],
                    onClick: () => {},
                  },
                  {
                    name: 'Italic',
                    // icon: () => <Iconista width={15} height={15} set="radix" icon="font-italic" />,
                    // icon: () => <Iconista width={16} height={16} set="lucide" icon="italic" />,
                    icon: () => <Iconista width={14} height={14} set="lucide" icon="italic" />,
                    right: () => <Sidetip small>⌘ I</Sidetip>,
                    keys: ['⌘', 'i'],
                    onClick: () => {},
                  },
                  {
                    name: 'Underline',
                    icon: () => <Iconista width={16} height={16} set="tabler" icon="underline" />,
                    right: () => <Sidetip small>⌘ U</Sidetip>,
                    keys: ['⌘', 'u'],
                    onClick: () => {},
                  },
                  {
                    name: 'Strikethrough',
                    // icon: () => <Iconista width={15} height={15} set="radix" icon="strikethrough" />,
                    icon: () => <Iconista width={16} height={16} set="tabler" icon="strikethrough" />,
                    onClick: () => {},
                  },
                  {
                    name: 'Overline',
                    icon: () => <Iconista width={16} height={16} set="tabler" icon="overline" />,
                    onClick: () => {},
                  },
                  {
                    name: 'Highlight',
                    icon: () => <Iconista width={16} height={16} set="tabler" icon="highlight" />,
                    onClick: () => {},
                  },
                  {
                    name: 'Classified',
                    icon: () => <Iconista width={16} height={16} set="tabler" icon="lock-password" />,
                    onClick: () => {},
                  },
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
                  {
                    name: 'Code',
                    icon: () => <Iconista width={16} height={16} set="tabler" icon="code" />,
                    onClick: () => {},
                  },
                  {
                    name: 'Math',
                    icon: () => <Iconista width={16} height={16} set="tabler" icon="math-integral-x" />,
                    onClick: () => {},
                  },
                  {
                    name: 'Superscript',
                    icon: () => <Iconista width={16} height={16} set="tabler" icon="superscript" />,
                    onClick: () => {},
                  },
                  {
                    name: 'Subscript',
                    icon: () => <Iconista width={16} height={16} set="tabler" icon="subscript" />,
                    onClick: () => {},
                  },
                  {
                    name: 'Keyboard key',
                    icon: () => <Iconista width={16} height={16} set="lucide" icon="keyboard" />,
                    onClick: () => {},
                  },
                  {
                    name: 'Insertion',
                    icon: () => <Iconista width={16} height={16} set="tabler" icon="pencil-plus" />,
                    onClick: () => {},
                  },
                  {
                    name: 'Deletion',
                    icon: () => <Iconista width={16} height={16} set="tabler" icon="pencil-minus" />,
                    onClick: () => {},
                  },
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
                  {
                    name: 'Color',
                    icon: () => <Iconista width={16} height={16} set="lucide" icon="paintbrush" />,
                    onClick: () => {},
                  },
                  {
                    name: 'Background',
                    icon: () => <Iconista width={16} height={16} set="lucide" icon="paint-bucket" />,
                    onClick: () => {},
                  },
                  {
                    name: 'Border',
                    icon: () => <Iconista width={16} height={16} set="tabler" icon="border-left" />,
                    onClick: () => {},
                  },
                ],
              },
            ],
          }
    );
  };

  public readonly getCaretMenu = (): MenuItem => {
    return {
      name: 'Inline text',
      maxToolbarItems: 4,
      children: [
        this.getFormattingMenu(),
        secondBrain(),
        {
          name: 'Annotations separator',
          sep: true,
        },
        annotations(),
        {
          name: 'Style separator',
          sep: true,
        },
        {
          name: 'Typesetting',
          expand: 4,
          openOnTitleHov: true,
          icon: () => <Iconista width={16} height={16} set="tabler" icon="typography" />,
          onClick: () => {},
          children: [
            {
              name: 'Sans-serif',
              iconBig: () => <FontStyleButton kind={'sans'} />,
              onClick: () => {},
            },
            {
              name: 'Serif',
              iconBig: () => <FontStyleButton kind={'serif'} />,
              onClick: () => {},
            },
            {
              name: 'Slab',
              icon: () => <FontStyleButton kind={'slab'} size={16} />,
              iconBig: () => <FontStyleButton kind={'slab'} />,
              onClick: () => {},
            },
            {
              name: 'Monospace',
              iconBig: () => <FontStyleButton kind={'mono'} />,
              onClick: () => {},
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
                  onClick: () => {},
                },
                {
                  name: 'Text size',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="font-size" />,
                  onClick: () => {},
                },
                {
                  name: 'Letter spacing',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="letter-spacing" />,
                  onClick: () => {},
                },
                {
                  name: 'Word spacing',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="letter-spacing" />,
                  onClick: () => {},
                },
                {
                  name: 'Caps separator',
                  sep: true,
                },
                {
                  name: 'Large caps',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="letter-case-uppercase" />,
                  onClick: () => {},
                },
                {
                  name: 'Small caps',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="letter-case-lowercase" />,
                  onClick: () => {},
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
          onClick: () => {},
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
              onClick: () => {},
            },
            {
              name: 'Erase formatting',
              danger: true,
              icon: () => <Iconista width={16} height={16} set="tabler" icon="eraser" />,
              onClick: () => {},
            },
            {
              name: 'Delete all in range',
              danger: true,
              more: true,
              icon: () => <Iconista width={16} height={16} set="tabler" icon="trash" />,
              onClick: () => {},
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
                  onClick: () => {},
                },
                {
                  name: 'Copy text only',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
                  onClick: () => {},
                },
                {
                  name: 'Copy as Markdown',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
                  right: () => <Iconista width={16} height={16} set="simple" icon="markdown" style={{opacity: 0.5}} />,
                  onClick: () => {},
                },
                {
                  name: 'Copy as HTML',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
                  right: () => <Iconista width={14} height={14} set="simple" icon="html5" style={{opacity: 0.5}} />,
                  onClick: () => {},
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
                  onClick: () => {},
                },
                {
                  name: 'Cut text only',
                  danger: true,
                  icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
                  onClick: () => {},
                },
                {
                  name: 'Cut as Markdown',
                  danger: true,
                  icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
                  right: () => <Iconista width={16} height={16} set="simple" icon="markdown" style={{opacity: 0.5}} />,
                  onClick: () => {},
                },
                {
                  name: 'Cut as HTML',
                  danger: true,
                  icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
                  right: () => <Iconista width={14} height={14} set="simple" icon="html5" style={{opacity: 0.5}} />,
                  onClick: () => {},
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
                  onClick: () => {},
                },
                {
                  name: 'Paste text only',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard" />,
                  onClick: () => {},
                },
                {
                  name: 'Paste formatting',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard" />,
                  onClick: () => {},
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
                  onClick: () => {},
                },
                {
                  name: 'AI chip',
                  icon: () => <Iconista style={{color: 'purple'}} width={16} height={16} set="tabler" icon="brain" />,
                  onClick: () => {},
                },
                {
                  name: 'Solana wallet',
                  icon: () => <Iconista width={16} height={16} set="tabler" icon="wallet" />,
                  onClick: () => {},
                },
                {
                  name: 'Dropdown',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
                  children: [
                    {
                      name: 'Create new',
                      icon: () => <Iconista width={15} height={15} set="radix" icon="plus" />,
                      onClick: () => {},
                    },
                    {
                      name: 'Document dropdowns separator',
                      sep: true,
                    },
                    {
                      name: 'Document dropdowns',
                      expand: 8,
                      onClick: () => {},
                      children: [
                        {
                          name: 'Configuration 1',
                          icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
                          onClick: () => {},
                        },
                        {
                          name: 'Configuration 2',
                          icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
                          onClick: () => {},
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
                      onClick: () => {},
                      children: [
                        {
                          name: 'Project status',
                          icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
                          onClick: () => {},
                        },
                        {
                          name: 'Review status',
                          icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
                          onClick: () => {},
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
              onClick: () => {},
            },
            {
              name: 'Reference',
              icon: () => <Iconista width={15} height={15} set="radix" icon="sewing-pin" />,
              onClick: () => {},
            },
            {
              name: 'File',
              icon: () => <Iconista width={15} height={15} set="radix" icon="file" />,
              onClick: () => {},
            },
            {
              name: 'Template',
              text: 'building blocks',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="template" />,
              children: [
                {
                  name: 'Meeting notes',
                  onClick: () => {},
                },
                {
                  name: 'Email draft (created by AI)',
                  onClick: () => {},
                },
                {
                  name: 'Product roadmap',
                  onClick: () => {},
                },
                {
                  name: 'Review tracker',
                  onClick: () => {},
                },
                {
                  name: 'Project assets',
                  onClick: () => {},
                },
                {
                  name: 'Content launch tracker',
                  onClick: () => {},
                },
              ],
            },
            {
              name: 'On-screen keyboard',
              icon: () => <Iconista width={15} height={15} set="radix" icon="keyboard" />,
              onClick: () => {},
            },
            {
              name: 'Emoji',
              icon: () => <Iconista width={16} height={16} set="lucide" icon="smile-plus" />,
              onClick: () => {},
            },
            {
              name: 'Special characters',
              icon: () => <Iconista width={16} height={16} set="lucide" icon="omega" />,
              onClick: () => {},
            },
            {
              name: 'Variable',
              icon: () => <Iconista width={16} height={16} set="lucide" icon="variable" />,
              onClick: () => {},
            },
          ],
        },
        {
          name: 'Developer tools',
          danger: true,
          icon: () => <Iconista width={16} height={16} set="lucide" icon="square-chevron-right" />,
          onClick: () => {},
        },
      ],
    };
  };

  public readonly getSelectionMenu = (): MenuItem => {
    return {
      name: 'Inline text',
      maxToolbarItems: 4,
      children: [
        this.getFormattingMenu(),
        secondBrain(),
        {
          name: 'Annotations separator',
          sep: true,
        },
        annotations(),
        {
          name: 'Style separator',
          sep: true,
        },
        {
          name: 'Typesetting',
          expand: 4,
          openOnTitleHov: true,
          icon: () => <Iconista width={16} height={16} set="tabler" icon="typography" />,
          onClick: () => {},
          children: [
            {
              name: 'Sans-serif',
              iconBig: () => <FontStyleButton kind={'sans'} />,
              onClick: () => {},
            },
            {
              name: 'Serif',
              iconBig: () => <FontStyleButton kind={'serif'} />,
              onClick: () => {},
            },
            {
              name: 'Slab',
              icon: () => <FontStyleButton kind={'slab'} size={16} />,
              iconBig: () => <FontStyleButton kind={'slab'} />,
              onClick: () => {},
            },
            {
              name: 'Monospace',
              iconBig: () => <FontStyleButton kind={'mono'} />,
              onClick: () => {},
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
                  onClick: () => {},
                },
                {
                  name: 'Text size',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="font-size" />,
                  onClick: () => {},
                },
                {
                  name: 'Letter spacing',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="letter-spacing" />,
                  onClick: () => {},
                },
                {
                  name: 'Word spacing',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="letter-spacing" />,
                  onClick: () => {},
                },
                {
                  name: 'Caps separator',
                  sep: true,
                },
                {
                  name: 'Large caps',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="letter-case-uppercase" />,
                  onClick: () => {},
                },
                {
                  name: 'Small caps',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="letter-case-lowercase" />,
                  onClick: () => {},
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
          onClick: () => {},
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
              onClick: () => {},
            },
            {
              name: 'Erase formatting',
              danger: true,
              icon: () => <Iconista width={16} height={16} set="tabler" icon="eraser" />,
              onClick: () => {},
            },
            {
              name: 'Delete all in range',
              danger: true,
              more: true,
              icon: () => <Iconista width={16} height={16} set="tabler" icon="trash" />,
              onClick: () => {},
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
                  onClick: () => {},
                },
                {
                  name: 'Copy text only',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
                  onClick: () => {},
                },
                {
                  name: 'Copy as Markdown',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
                  right: () => <Iconista width={16} height={16} set="simple" icon="markdown" style={{opacity: 0.5}} />,
                  onClick: () => {},
                },
                {
                  name: 'Copy as HTML',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
                  right: () => <Iconista width={14} height={14} set="simple" icon="html5" style={{opacity: 0.5}} />,
                  onClick: () => {},
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
                  onClick: () => {},
                },
                {
                  name: 'Cut text only',
                  danger: true,
                  icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
                  onClick: () => {},
                },
                {
                  name: 'Cut as Markdown',
                  danger: true,
                  icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
                  right: () => <Iconista width={16} height={16} set="simple" icon="markdown" style={{opacity: 0.5}} />,
                  onClick: () => {},
                },
                {
                  name: 'Cut as HTML',
                  danger: true,
                  icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
                  right: () => <Iconista width={14} height={14} set="simple" icon="html5" style={{opacity: 0.5}} />,
                  onClick: () => {},
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
                  onClick: () => {},
                },
                {
                  name: 'Paste text only',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard" />,
                  onClick: () => {},
                },
                {
                  name: 'Paste formatting',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard" />,
                  onClick: () => {},
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
                  onClick: () => {},
                },
                {
                  name: 'AI chip',
                  icon: () => <Iconista style={{color: 'purple'}} width={16} height={16} set="tabler" icon="brain" />,
                  onClick: () => {},
                },
                {
                  name: 'Solana wallet',
                  icon: () => <Iconista width={16} height={16} set="tabler" icon="wallet" />,
                  onClick: () => {},
                },
                {
                  name: 'Dropdown',
                  icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
                  children: [
                    {
                      name: 'Create new',
                      icon: () => <Iconista width={15} height={15} set="radix" icon="plus" />,
                      onClick: () => {},
                    },
                    {
                      name: 'Document dropdowns separator',
                      sep: true,
                    },
                    {
                      name: 'Document dropdowns',
                      expand: 8,
                      onClick: () => {},
                      children: [
                        {
                          name: 'Configuration 1',
                          icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
                          onClick: () => {},
                        },
                        {
                          name: 'Configuration 2',
                          icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
                          onClick: () => {},
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
                      onClick: () => {},
                      children: [
                        {
                          name: 'Project status',
                          icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
                          onClick: () => {},
                        },
                        {
                          name: 'Review status',
                          icon: () => <Iconista width={15} height={15} set="radix" icon="dropdown-menu" />,
                          onClick: () => {},
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
              onClick: () => {},
            },
            {
              name: 'Reference',
              icon: () => <Iconista width={15} height={15} set="radix" icon="sewing-pin" />,
              onClick: () => {},
            },
            {
              name: 'File',
              icon: () => <Iconista width={15} height={15} set="radix" icon="file" />,
              onClick: () => {},
            },
            {
              name: 'Template',
              text: 'building blocks',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="template" />,
              children: [
                {
                  name: 'Meeting notes',
                  onClick: () => {},
                },
                {
                  name: 'Email draft (created by AI)',
                  onClick: () => {},
                },
                {
                  name: 'Product roadmap',
                  onClick: () => {},
                },
                {
                  name: 'Review tracker',
                  onClick: () => {},
                },
                {
                  name: 'Project assets',
                  onClick: () => {},
                },
                {
                  name: 'Content launch tracker',
                  onClick: () => {},
                },
              ],
            },
            {
              name: 'On-screen keyboard',
              icon: () => <Iconista width={15} height={15} set="radix" icon="keyboard" />,
              onClick: () => {},
            },
            {
              name: 'Emoji',
              icon: () => <Iconista width={16} height={16} set="lucide" icon="smile-plus" />,
              onClick: () => {},
            },
            {
              name: 'Special characters',
              icon: () => <Iconista width={16} height={16} set="lucide" icon="omega" />,
              onClick: () => {},
            },
            {
              name: 'Variable',
              icon: () => <Iconista width={16} height={16} set="lucide" icon="variable" />,
              onClick: () => {},
            },
          ],
        },
        {
          name: 'Developer tools',
          danger: true,
          icon: () => <Iconista width={16} height={16} set="lucide" icon="square-chevron-right" />,
          onClick: () => {},
        },
      ],
    };
  };
}
