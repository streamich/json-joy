import * as React from 'react';
import {Sidetip} from 'nice-ui/lib/1-inline/Sidetip';
import {Iconista} from 'nice-ui/lib/icons/Iconista';
import {ValueSyncStore} from '../../../../util/events/sync-store';
import {secondBrain} from './menus';
import {Code} from 'nice-ui/lib/1-inline/Code';
import {FontStyleButton} from 'nice-ui/lib/2-inline-block/FontStyleButton';
import {CommonSliceType} from '../../../../json-crdt-extensions';
import {BehaviorSubject} from 'rxjs';
import {compare, type ITimestampStruct} from '../../../../json-crdt-patch';
import type {UiLifeCycles} from '../../../web/types';
import type {BufferDetail, PeritextEventDetailMap} from '../../../events/types';
import type {PeritextSurfaceState} from '../../../web';
import type {MenuItem} from '../types';
import type {ToolbarPluginOpts} from '../ToolbarPlugin';

export class ToolbarState implements UiLifeCycles {
  public lastEvent: PeritextEventDetailMap['change']['ev'] | undefined = void 0;
  public lastEventTs: number = 0;
  public readonly showInlineToolbar = new ValueSyncStore<[show: boolean, time: number]>([false, 0]);

  /**
   * The ID of the active (where the main cursor or focus is placed) leaf block.
   */
  public readonly activeLeafBlockId$ = new BehaviorSubject<ITimestampStruct | null>(null);

  constructor(
    public readonly surface: PeritextSurfaceState,
    public readonly opts: ToolbarPluginOpts,
  ) {}

  /** ------------------------------------------- {@link UiLifeCycles} */

  public start() {
    const {surface, showInlineToolbar} = this;
    const {dom, events} = surface;
    const txt = dom.txt;
    const {et} = events;
    const mouseDown = dom!.cursor.mouseDown;
    const source = dom!.opts.source;

    const changeUnsubscribe = et.subscribe('change', (ev) => {
      const lastEvent = ev.detail.ev;
      this.setLastEv(lastEvent);
      if (lastEvent) {
        switch (lastEvent.type) {
          case 'cursor': {
            const {activeLeafBlockId$} = this;
            const {overlay, editor} = txt;
            const value = activeLeafBlockId$.getValue();
            if (!editor.hasCursor()) {
              if (value) activeLeafBlockId$.next(null);
              return;
            }
            const focus = editor.cursor.focus();
            const marker = overlay.getOrNextLowerMarker(focus);
            const markerId = marker?.marker.start.id ?? txt.str.id;
            const doSet = !value || compare(value, markerId) !== 0;
            if (doSet) activeLeafBlockId$.next(markerId);
          }
        }
      }
    });

    const unsubscribeMouseDown = mouseDown?.subscribe(() => {
      // if (mouseDown.value) showInlineToolbar.next(false);
    });

    const mouseDownListener = (event: MouseEvent) => {
      // showInlineToolbar.next(false);
      // if (showInlineToolbar.value[0])
      //   showInlineToolbar.next([false, Date.now()]);
    };
    const mouseUpListener = (event: MouseEvent) => {
      if (!showInlineToolbar.value[0]) showInlineToolbar.next([true, Date.now()]);
    };

    source?.addEventListener('mousedown', mouseDownListener);
    source?.addEventListener('mouseup', mouseUpListener);
    return () => {
      changeUnsubscribe();
      unsubscribeMouseDown?.();
      source?.removeEventListener('mousedown', mouseDownListener);
      source?.removeEventListener('mouseup', mouseUpListener);
    };
  }

  private setLastEv(lastEvent: PeritextEventDetailMap['change']['ev']) {
    this.lastEvent = lastEvent;
    this.lastEventTs = Date.now();
  }

  // private doShowInlineToolbar(): boolean {
  //   const {surface, lastEvent} = this;
  //   if (surface.dom!.cursor.mouseDown.value) return false;
  //   if (!lastEvent) return false;
  //   const lastEventIsCursorEvent = lastEvent?.type === 'cursor';
  //   if (!lastEventIsCursorEvent) return false;
  //   if (!surface.peritext.editor.cursorCount()) return false;
  //   return true;
  // }

  // -------------------------------------------------------------------- Menus

  public readonly getFormattingMenu = (): MenuItem => {
    const et = this.surface.events.et;
    return {
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
              onSelect: () => {
                et.format(CommonSliceType.b);
              },
            },
            {
              name: 'Italic',
              // icon: () => <Iconista width={15} height={15} set="radix" icon="font-italic" />,
              // icon: () => <Iconista width={16} height={16} set="lucide" icon="italic" />,
              icon: () => <Iconista width={14} height={14} set="lucide" icon="italic" />,
              right: () => <Sidetip small>⌘ I</Sidetip>,
              keys: ['⌘', 'i'],
              onSelect: () => {
                et.format(CommonSliceType.i);
              },
            },
            {
              name: 'Underline',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="underline" />,
              right: () => <Sidetip small>⌘ U</Sidetip>,
              keys: ['⌘', 'u'],
              onSelect: () => {
                et.format(CommonSliceType.u);
              },
            },
            {
              name: 'Strikethrough',
              // icon: () => <Iconista width={15} height={15} set="radix" icon="strikethrough" />,
              icon: () => <Iconista width={16} height={16} set="tabler" icon="strikethrough" />,
              onSelect: () => {
                et.format(CommonSliceType.s);
              },
            },
            {
              name: 'Overline',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="overline" />,
              onSelect: () => {
                et.format(CommonSliceType.overline);
              },
            },
            {
              name: 'Highlight',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="highlight" />,
              onSelect: () => {
                et.format(CommonSliceType.mark);
              },
            },
            {
              name: 'Classified',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="lock-password" />,
              onSelect: () => {
                et.format(CommonSliceType.spoiler);
              },
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
              onSelect: () => {
                et.format(CommonSliceType.code);
              },
            },
            {
              name: 'Math',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="math-integral-x" />,
              onSelect: () => {
                et.format(CommonSliceType.math);
              },
            },
            {
              name: 'Superscript',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="superscript" />,
              onSelect: () => {
                et.format(CommonSliceType.sup);
              },
            },
            {
              name: 'Subscript',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="subscript" />,
              onSelect: () => {
                et.format(CommonSliceType.sub);
              },
            },
            {
              name: 'Keyboard key',
              icon: () => <Iconista width={16} height={16} set="lucide" icon="keyboard" />,
              onSelect: () => {
                et.format(CommonSliceType.kbd);
              },
            },
            {
              name: 'Insertion',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="pencil-plus" />,
              onSelect: () => {
                et.format(CommonSliceType.ins);
              },
            },
            {
              name: 'Deletion',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="pencil-minus" />,
              onSelect: () => {
                et.format(CommonSliceType.del);
              },
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
              onSelect: () => {},
            },
            {
              name: 'Background',
              icon: () => <Iconista width={16} height={16} set="lucide" icon="paint-bucket" />,
              onSelect: () => {},
            },
            {
              name: 'Border',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="border-left" />,
              onSelect: () => {},
            },
          ],
        },
      ],
    };
  };

  public readonly annotationsMenu = (): MenuItem => {
    return {
      name: 'Annotations',
      expand: 2,
      sepBefore: true,
      children: [
        {
          name: 'Link',
          // icon: () => <Iconista width={15} height={15} set="lucide" icon="link" />,
          icon: () => <Iconista width={15} height={15} set="radix" icon="link-2" />,
          onSelect: () => {},
        },
        // {
        //   name: 'Comment',
        //   icon: () => <Iconista width={16} height={16} set="lineicons" icon="comment-1-text" />,
        //   onSelect: () => {},
        // },
        // {
        //   name: 'Bookmark',
        //   icon: () => <Iconista width={16} height={16} set="lineicons" icon="flag-2" />,
        //   onSelect: () => {},
        // },
        // {
        //   name: 'Footnote',
        //   icon: () => <Iconista width={16} height={16} set="lucide" icon="footprints" />,
        //   onSelect: () => {},
        // },
        {
          name: 'Aside',
          icon: () => <Iconista width={16} height={16} set="tabler" icon="box-align-right" />,
          onSelect: () => {},
        },
      ],
    };
  };

  public readonly modifyMenu = (): MenuItem => {
    const et = this.surface.events.et;
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
          icon: () => <Iconista width={15} height={15} set="radix" icon="layers" />,
          onSelect: () => {},
        },
        {
          name: 'Erase formatting',
          danger: true,
          icon: () => <Iconista width={16} height={16} set="tabler" icon="eraser" />,
          onSelect: () => {
            et.format({behavior: 'erase'});
          },
        },
        {
          name: 'Delete all in range',
          danger: true,
          more: true,
          icon: () => <Iconista width={16} height={16} set="tabler" icon="trash" />,
          onSelect: () => {
            et.format({behavior: 'clear'});
          },
        },
      ],
    };
  };

  public readonly copyAsMenu = (type: 'copy' | 'cut'): MenuItem => {
    const icon =
      type === 'copy'
        ? () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />
        : () => <Iconista width={16} height={16} set="tabler" icon="scissors" />;
    const et = this.surface.events.et;
    const iconMarkdown = () => <Iconista width={16} height={16} set="simple" icon="markdown" style={{opacity: 0.5}} />;
    const iconHtml = () => <Iconista width={14} height={14} set="simple" icon="html5" style={{opacity: 0.5}} />;
    const iconJson = () => <Iconista width={16} height={16} set="tabler" icon="json" style={{opacity: 0.5}} />;
    const onSelect = (format: BufferDetail['format']) => () => {
      et.buffer(type, format);
    };
    return {
      name: type === 'copy' ? 'Copy as' : 'Cut as',
      more: true,
      icon,
      children: [
        {
          name: 'Markdown',
          text: type + ' markdown md',
          icon,
          right: iconMarkdown,
          onSelect: onSelect('md'),
        },
        {
          name: 'MDAST',
          text: type + 'markdown md mdast',
          icon,
          right: iconMarkdown,
          onSelect: onSelect('mdast'),
        },
        {
          name: 'MD sep',
          sep: true,
        },
        {
          name: 'HTML',
          text: type + 'html',
          icon,
          right: iconHtml,
          onSelect: onSelect('html'),
        },
        {
          name: 'HAST',
          text: type + 'html hast',
          icon,
          right: iconHtml,
          onSelect: onSelect('hast'),
        },
        {
          name: 'HTML sep',
          sep: true,
        },
        {
          name: 'Range view',
          text: type + 'range view peritext',
          icon,
          right: iconJson,
          onSelect: onSelect('json'),
        },
        {
          name: 'Fragment ML',
          text: type + 'peritext fragment ml node',
          icon,
          right: iconJson,
          onSelect: onSelect('jsonml'),
        },
        {
          name: 'Fragment text',
          text: type + 'peritext fragment debug',
          icon,
          right: () => <Iconista width={16} height={16} set="lucide" icon="text" style={{opacity: 0.5}} />,
          onSelect: onSelect('fragment'),
        },
      ],
    };
  };

  public readonly pasteAsMenu = (): MenuItem => {
    const icon = () => <Iconista width={15} height={15} set="radix" icon="clipboard" />;
    const iconMarkdown = () => <Iconista width={16} height={16} set="simple" icon="markdown" style={{opacity: 0.5}} />;
    const iconHtml = () => <Iconista width={14} height={14} set="simple" icon="html5" style={{opacity: 0.5}} />;
    const iconJson = () => <Iconista width={16} height={16} set="tabler" icon="json" style={{opacity: 0.5}} />;
    const et = this.surface.events.et;
    const onSelect = (format: BufferDetail['format']) => () => {
      console.log('paste as', format);
      et.buffer('paste', format);
    };
    return {
      name: 'Paste as',
      more: true,
      icon,
      children: [
        {
          name: 'Markdown',
          text: 'paste markdown md',
          icon,
          right: iconMarkdown,
          onSelect: onSelect('md'),
        },
        {
          name: 'MDAST',
          text: 'paste markdown md mdast',
          icon,
          right: iconMarkdown,
          onSelect: onSelect('mdast'),
        },
        {
          name: 'MD sep',
          sep: true,
        },
        {
          name: 'HTML',
          text: 'paste html',
          icon,
          right: iconHtml,
          onSelect: onSelect('html'),
        },
        {
          name: 'HAST',
          text: 'paste html hast',
          icon,
          right: iconHtml,
          onSelect: onSelect('hast'),
        },
        {
          name: 'HTML sep',
          sep: true,
        },
        {
          name: 'Range view',
          text: 'paste range view peritext',
          icon,
          right: iconJson,
          onSelect: onSelect('json'),
        },
        {
          name: 'Fragment ML',
          text: 'paste peritext fragment ml node',
          icon,
          right: iconJson,
          onSelect: onSelect('jsonml'),
        },
      ],
    };
  };

  public readonly clipboardMenu = (): MenuItem => {
    const et = this.surface.events.et;
    return {
      name: 'Copy, cut, and paste',
      // icon: () => <Iconista width={15} height={15} set="radix" icon="copy" />,
      icon: () => <Iconista width={16} height={16} set="lucide" icon="copy" />,
      expand: 0,
      sepBefore: true,
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
              onSelect: () => et.buffer('copy'),
            },
            {
              name: 'Copy text only',
              icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
              onSelect: () => et.buffer('copy', 'text'),
            },
            {
              name: 'Copy style',
              icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
              onSelect: () => et.buffer('copy', 'style'),
            },
            this.copyAsMenu('copy'),
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
              onSelect: () => et.buffer('cut'),
            },
            {
              name: 'Cut text only',
              danger: true,
              icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
              onSelect: () => et.buffer('cut', 'text'),
            },
            this.copyAsMenu('cut'),
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
              onSelect: () => et.buffer('paste'),
            },
            {
              name: 'Paste text',
              icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard" />,
              onSelect: () => et.buffer('paste', 'text'),
            },
            {
              name: 'Paste style',
              icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard" />,
              onSelect: () => et.buffer('paste', 'style'),
            },
            this.pasteAsMenu(),
          ],
        },
      ],
    };
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
        this.annotationsMenu(),
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
        this.modifyMenu(),
        this.clipboardMenu(),
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
  };

  public readonly getSelectionMenu = (): MenuItem => {
    return {
      name: 'Selection menu',
      // maxToolbarItems: 8,
      more: true,
      children: [
        this.getFormattingMenu(),
        this.annotationsMenu(),
        this.modifyMenu(),
        this.clipboardMenu(),
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
        */
      ],
    };
  };

  public readonly blockTypeMenu = (): MenuItem => {
    const menu: MenuItem = {
      name: 'Block type',
      expand: 1,
      children: [
        {
          name: 'Text blocks',
          expand: 3,
          children: [
            {
              name: 'Paragraph',
              // icon: () => <Iconista width={16} height={16} set="lucide" icon="type" />,
              icon: () => <Iconista width={16} height={16} set="lucide" icon="pilcrow" />,
              // icon: () => <Iconista width={15} height={15} set="radix" icon="pilcrow" />,
              onSelect: () => {},
            },
            {
              name: 'Blockquote',
              icon: () => <Iconista width={16} height={16} set="lucide" icon="quote" />,
              onSelect: () => {},
            },
            {
              name: 'Code block',
              // icon: () => <Iconista width={16} height={16} set="tabler" icon="terminal" />,
              icon: () => <Iconista width={16} height={16} set="tabler" icon="code" />,
              onSelect: () => {},
            },
            {
              name: 'Math block',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="math" />,
              onSelect: () => {},
            },
            {
              name: 'Pre-formatted',
              icon: () => <Iconista width={16} height={16} set="lucide" icon="type" />,
              onSelect: () => {},
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
              icon: () => <Iconista width={16} height={16} set="tabler" icon="h-1" />,
              // icon: () => <Iconista width={16} height={16} set="simple" icon="h-1" />,
              onSelect: () => {},
            },
            {
              name: 'Heading 2',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="h-2" />,
              onSelect: () => {},
            },
            {
              name: 'Heading 3',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="h-3" />,
              onSelect: () => {},
            },
            {
              name: 'Heading 4',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="h-4" />,
              onSelect: () => {},
            },
            {
              name: 'Heading 5',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="h-5" />,
              onSelect: () => {},
            },
            {
              name: 'Heading 6',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="h-6" />,
              onSelect: () => {},
            },
            {
              sepBefore: true,
              name: 'Title',
              icon: () => <Iconista width={16} height={16} set="lucide" icon="type" />,
              onSelect: () => {},
            },
            {
              name: 'Sub-title',
              icon: () => <Iconista width={16} height={16} set="lucide" icon="type" />,
              onSelect: () => {},
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
              // icon: () => <Iconista width={16} height={16} set="tabler" icon="list" />,
              icon: () => <Iconista width={16} height={16} set="ibm_32" icon="list--bulleted" />,
              onSelect: () => {},
            },
            {
              name: 'Numbered list',
              icon: () => <Iconista width={16} height={16} set="ibm_32" icon="list--numbered" />,
              onSelect: () => {},
            },
            {
              name: 'Task list',
              icon: () => <Iconista width={16} height={16} set="ibm_32" icon="list--checked" />,
              onSelect: () => {},
            },
          ],
        },
        {
          sepBefore: true,
          name: 'Layouts',
          expand: 0,
          icon: () => <Iconista width={16} height={16} set="tabler" icon="layout" />,
          children: [
            {
              name: 'Table',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="table" />,
              onSelect: () => {},
            },
            {
              name: 'Columns',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="columns" />,
              onSelect: () => {},
            },
          ],
        },
        {
          sepBefore: true,
          name: 'Embed',
          expand: 0,
          icon: () => <Iconista width={16} height={16} set="tabler" icon="image-in-picture" />,
          children: [
            {
              name: 'Image',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="photo-scan" />,
              onSelect: () => {},
            },
            {
              name: 'File',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="file" />,
              onSelect: () => {},
            },
          ],
        },
      ],
    };
    return menu;
  };

  public readonly leafBlockSmallMenu = (): MenuItem => {
    const menu: MenuItem = {
      name: 'Leaf block menu',
      maxToolbarItems: 1,
      more: true,
      children: [
        this.blockTypeMenu(),
        secondBrain(),
      ],
    };
    return menu;
  };
}
