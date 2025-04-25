import * as React from 'react';
import {Sidetip} from 'nice-ui/lib/1-inline/Sidetip';
import {Iconista} from 'nice-ui/lib/icons/Iconista';
import {ValueSyncStore} from '../../../../util/events/sync-store';
import {secondBrain} from './menus';
import {Code} from 'nice-ui/lib/1-inline/Code';
import {FontStyleButton} from 'nice-ui/lib/2-inline-block/FontStyleButton';
import {CommonSliceType, type LeafBlock, type Peritext} from '../../../../json-crdt-extensions';
import {BehaviorSubject} from 'rxjs';
import {compare, type ITimestampStruct} from '../../../../json-crdt-patch';
import {SliceTypeCon} from '../../../../json-crdt-extensions/peritext/slice/constants';
import {Favicon} from '../../../components/Favicon';
import {NewFormatting} from './formattings';
import type {UiLifeCycles} from '../../../web/types';
import type {BufferDetail, PeritextCursorEvent, PeritextEventDetailMap} from '../../../events/types';
import type {PeritextSurfaceState} from '../../../web';
import type {MenuItem, SliceRegistryEntryData} from '../types';
import type {ToolbarPluginOpts} from '../ToolbarPlugin';

export class ToolbarState implements UiLifeCycles {
  public readonly txt: Peritext;
  public lastEvent: PeritextEventDetailMap['change']['ev'] | undefined = void 0;
  public lastEventTs: number = 0;
  public readonly showInlineToolbar = new ValueSyncStore<[show: boolean, time: number]>([false, 0]);

  /**
   * New slice configuration. This is used for new slices which are not yet
   * applied to the text as they need to be configured first.
   */
  public readonly newSlice = new ValueSyncStore<NewFormatting | undefined>(void 0);

  /**
   * The ID of the active (where the main cursor or focus is placed) leaf block.
   */
  public readonly activeLeafBlockId$ = new BehaviorSubject<ITimestampStruct | null>(null);

  constructor(
    public readonly surface: PeritextSurfaceState,
    public readonly opts: ToolbarPluginOpts,
  ) {
    this.txt = this.surface.dom.txt;
  }

  private _setActiveLeafBlockId = () => {
    const {activeLeafBlockId$, txt} = this;
    const {overlay, editor} = txt;
    const value = activeLeafBlockId$.getValue();
    const cardinality = editor.cursorCard();
    if (cardinality !== 1 || (cardinality === 1 && !editor.mainCursor()?.isCollapsed())) {
      if (value) activeLeafBlockId$.next(null);
      return;
    }
    const focus = editor.mainCursor()?.focus();
    const marker = focus ? overlay.getOrNextLowerMarker(focus) : void 0;
    const markerId = marker?.marker.start.id ?? txt.str.id;
    const doSet = !value || compare(value, markerId) !== 0;
    if (doSet) activeLeafBlockId$.next(markerId);
  };

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

  public startSliceConfig(tag: SliceTypeCon | string | number, menu?: MenuItem): NewFormatting | undefined {
    const editor = this.txt.editor;
    const behavior = editor.getRegistry().get(tag);
    const range = editor.mainCursor()?.range();
    if (!range) return;
    const newSlice = this.newSlice;
    if (!behavior) {
      newSlice.next(void 0);
      return;
    }
    const formatting = new NewFormatting(behavior, range, this);
    newSlice.next(formatting);
    return formatting;
  }

  // public registerSlice(tag: TypeTag, data: SliceRegistryEntryData): ToolBarSliceRegistryEntry {
  //   const registry = this.txt.editor.getRegistry();
  //   const entry = registry.get(tag);
  // }

  /** ------------------------------------------- {@link UiLifeCycles} */

  public start() {
    const {surface, showInlineToolbar, newSlice: newSliceConfig} = this;
    const {dom, events} = surface;
    const {et} = events;
    const mouseDown = dom!.cursor.mouseDown;
    const el = dom.el;

    const registry = this.txt.editor.getRegistry();
    const linkEntry = registry.get(SliceTypeCon.a);
    if (linkEntry) {
      const data = linkEntry.data() as SliceRegistryEntryData;
      data.menu = this.linkMenuItem();
      data.renderIcon = ({range: slice}) => {
        const data = slice.data() as {href: string};
        if (!data || typeof data !== 'object') return;
        return <Favicon url={data.href} />;
      };
      data.previewText = ({range: slice}) => {
        const data = slice.data() as {href: string};
        if (!data || typeof data !== 'object') return '';
        return (data.href || '').replace(/^(https?:\/\/)?(www\.)?/, '');
      };
      data.renderCard = (formatting) => {
        return <div>LINK EDIT</div>;
      };
    }

    const changeUnsubscribe = et.subscribe('change', (ev) => {
      const lastEvent = ev.detail.ev;
      this.setLastEv(lastEvent);
      this._setActiveLeafBlockId();
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
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape': {
          if (newSliceConfig.value) {
            event.stopPropagation();
            event.preventDefault
            newSliceConfig.next(void 0);
            return;
          }
          break;
        }
      }
    };
    const onKeyDownDocument = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'k': {
          if (event.metaKey) {
            const editor = this.txt.editor;
            if (editor.hasCursor() && !editor.mainCursor()?.isCollapsed() && (!newSliceConfig.value || newSliceConfig.value.behavior.tag !== SliceTypeCon.a)) {
              event.stopPropagation();
              event.preventDefault
              this.startSliceConfig(SliceTypeCon.a, this.linkMenuItem());
              return;
            }
          }
          break;
        }
      }
    };
    const onCursor = ({detail}: PeritextCursorEvent) => {
      // Close config popup on non-focus cursor moves.
      if (newSliceConfig.value) {
        const isFocusMove = detail.move && detail.move.length === 1 && detail.move[0][0] === 'focus';
        if (!isFocusMove) {
          this.newSlice.next(void 0);
        }
      }
    };
    
    el.addEventListener('mousedown', mouseDownListener);
    el.addEventListener('mouseup', mouseUpListener);
    el.addEventListener('keydown', onKeyDown);
    document.addEventListener('keydown', onKeyDownDocument);
    et.addEventListener('cursor', onCursor);

    const unsubscribeKeyHistory = dom.keys.history.subscribe(() => {
      // Flip selection anchor and focus edges on quick [Meta, Meta] key sequence.
      const keys = dom.keys.history.value;
      const last = keys[keys.length - 1];
      const beforeLast = keys[keys.length - 2];
      if (last?.key === 'Meta' && beforeLast?.key === 'Meta')
        if (last.ts - beforeLast.ts < 500) et.cursor({flip: true});
    });

    return () => {
      changeUnsubscribe();
      unsubscribeMouseDown?.();
      el.removeEventListener('mousedown', mouseDownListener);
      el.removeEventListener('mouseup', mouseUpListener);
      el.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keydown', onKeyDownDocument);
      et.removeEventListener('cursor', onCursor);
      unsubscribeKeyHistory();
    };
  }

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

  public readonly linkMenuItem = (): MenuItem => {
    const linkAction: MenuItem = {
      name: 'Link',
      icon: () => <Iconista width={15} height={15} set="lucide" icon="link" />,
      // icon: () => <Iconista width={15} height={15} set="radix" icon="link-2" />,
      right: () => <Sidetip small>⌘ K</Sidetip>,
      keys: ['⌘', 'k'],
      onSelect: () => {
        this.startSliceConfig(CommonSliceType.a, linkAction);
      },
    };
    return linkAction;
  };

  public readonly annotationsMenu = (): MenuItem => {
    
    return {
      name: 'Annotations',
      expand: 2,
      sepBefore: true,
      children: [
        this.linkMenuItem(),
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

  public readonly copyAsMenu = (action: 'copy' | 'cut', ctx: ClipboardMenuCtx = {}): MenuItem => {
    const icon =
      action === 'copy'
        ? () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />
        : () => <Iconista width={16} height={16} set="tabler" icon="scissors" />;
    const et = this.surface.events.et;
    const iconMarkdown = () => <Iconista width={16} height={16} set="simple" icon="markdown" style={{opacity: 0.5}} />;
    const iconHtml = () => <Iconista width={14} height={14} set="simple" icon="html5" style={{opacity: 0.5}} />;
    const iconJson = () => <Iconista width={16} height={16} set="tabler" icon="json" style={{opacity: 0.5}} />;
    const markdownAction: MenuItem = {
      name: 'Markdown',
      text: action + ' markdown md',
      icon,
      right: iconMarkdown,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(markdownAction, action), action, format: 'md'});
      },
    };
    const mdastAction: MenuItem = {
      name: 'MDAST',
      text: action + ' markdown md mdast',
      icon,
      right: iconMarkdown,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(mdastAction, action), action, format: 'mdast'});
      },
    };
    const htmlAction: MenuItem = {
      name: 'HTML',
      text: action + ' html',
      icon,
      right: iconHtml,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(htmlAction, action), action, format: 'html'});
      },
    };
    const hastAction: MenuItem = {
      name: 'HAST',
      text: action + ' html hast',
      icon,
      right: iconHtml,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(hastAction, action), action, format: 'hast'});
      },
    };
    const jsonAction: MenuItem = {
      name: 'Range view',
      text: action + ' range view peritext',
      icon,
      right: iconJson,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(jsonAction, action), action, format: 'json'});
      },
    };
    const jsonmlAction: MenuItem = {
      name: 'Fragment ML',
      text: action + ' peritext fragment ml node',
      icon,
      right: iconJson,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(jsonmlAction, action), action, format: 'jsonml'});
      },
    };
    const fragmentAction: MenuItem = {
      name: 'Fragment text',
      text: action + 'peritext fragment debug',
      icon,
      right: () => <Iconista width={16} height={16} set="lucide" icon="text" style={{opacity: 0.5}} />,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(fragmentAction, action), action, format: 'fragment'});
      },
    };
    return {
      name: action === 'copy' ? 'Copy as' : 'Cut as',
      more: true,
      icon,
      children: [
        markdownAction,
        mdastAction,
        {
          name: 'MD sep',
          sep: true,
        },
        htmlAction,
        hastAction,
        {
          name: 'HTML sep',
          sep: true,
        },
        jsonAction,
        jsonmlAction,
        fragmentAction,
      ],
    };
  };

  public readonly pasteAsMenu = (ctx: ClipboardMenuCtx = {}): MenuItem => {
    const icon = () => <Iconista width={15} height={15} set="radix" icon="clipboard" />;
    const iconMarkdown = () => <Iconista width={16} height={16} set="simple" icon="markdown" style={{opacity: 0.5}} />;
    const iconHtml = () => <Iconista width={14} height={14} set="simple" icon="html5" style={{opacity: 0.5}} />;
    const iconJson = () => <Iconista width={16} height={16} set="tabler" icon="json" style={{opacity: 0.5}} />;
    const et = this.surface.events.et;
    const markdownAction: MenuItem = {
      name: 'Markdown',
      text: 'paste markdown md',
      icon,
      right: iconMarkdown,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(markdownAction, 'paste'), action: 'paste', format: 'md'});
      },
    };
    const mdastAction: MenuItem = {
      name: 'MDAST',
      text: 'paste markdown md mdast',
      icon,
      right: iconMarkdown,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(mdastAction, 'paste'), action: 'paste', format: 'mdast'});
      },
    };
    const htmlAction: MenuItem = {
      name: 'HTML',
      text: 'paste html',
      icon,
      right: iconHtml,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(htmlAction, 'paste'), action: 'paste', format: 'html'});
      },
    };
    const hastAction: MenuItem = {
      name: 'HAST',
      text: 'paste html hast',
      icon,
      right: iconHtml,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(hastAction, 'paste'), action: 'paste', format: 'hast'});
      },
    };
    const jsonAction: MenuItem = {
      name: 'Range view',
      text: 'paste range view peritext',
      icon,
      right: iconJson,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(jsonAction, 'paste'), action: 'paste', format: 'json'});
      },
    };
    const jsonmlAction: MenuItem = {
      name: 'Fragment ML',
      text: 'paste peritext fragment ml node',
      icon,
      right: iconJson,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(jsonmlAction, 'paste'), action: 'paste', format: 'jsonml'});
      },
    };
    return {
      name: 'Paste as',
      more: true,
      icon,
      children: [
        markdownAction,
        mdastAction,
        {
          name: 'MD sep',
          sep: true,
        },
        htmlAction,
        hastAction,
        {
          name: 'HTML sep',
          sep: true,
        },
        jsonAction,
        jsonmlAction,
      ],
    };
  };

  public readonly copyMenu = (ctx: ClipboardMenuCtx = {}): MenuItem => {
    const et = this.surface.events.et;
    const copyAction: MenuItem = {
      name: 'Copy',
      icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(copyAction, 'copy'), action: 'copy'});
      },
    };
    const copyTextOnlyAction: MenuItem = {
      name: 'Copy text only',
      icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(copyTextOnlyAction, 'copy'), action: 'copy', format: 'text'});
      },
    };
    const children: MenuItem[] = [copyAction, copyTextOnlyAction];
    if (!ctx.hideStyleActions) {
      const copyStyleAction: MenuItem = {
        name: 'Copy style',
        icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
        onSelect: () => {
          et.buffer({...ctx.onBeforeAction?.(copyStyleAction, 'copy'), action: 'copy', format: 'style'});
        },
      };
      children.push(copyStyleAction);
    }
    children.push(this.copyAsMenu('copy', ctx));
    return {
      id: 'copy-menu',
      name: 'Copy',
      icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard-copy" />,
      expand: 5,
      children,
    };
  };

  public readonly cutMenu = (ctx: ClipboardMenuCtx = {}): MenuItem => {
    const et = this.surface.events.et;
    const cutAction: MenuItem = {
      name: 'Cut',
      danger: true,
      icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(cutAction, 'cut'), action: 'cut'});
      },
    };
    const cutTextAction: MenuItem = {
      name: 'Cut text only',
      danger: true,
      icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(cutTextAction, 'cut'), action: 'cut', format: 'text'});
      },
    };
    return {
      id: 'cut-menu',
      name: 'Cut',
      icon: () => <Iconista width={16} height={16} set="tabler" icon="scissors" />,
      expand: 5,
      children: [cutAction, cutTextAction, this.copyAsMenu('cut', ctx)],
    };
  };

  public readonly pasteMenu = (ctx: ClipboardMenuCtx = {}): MenuItem => {
    const et = this.surface.events.et;
    const pasteAction: MenuItem = {
      name: 'Paste',
      icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard" />,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(pasteAction, 'paste'), action: 'paste'});
      },
    };
    const pasteTextAction: MenuItem = {
      name: 'Paste text',
      icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard" />,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(pasteTextAction, 'paste'), action: 'paste', format: 'text'});
      },
    };
    const children: MenuItem[] = [pasteAction, pasteTextAction];
    if (!ctx.hideStyleActions) {
      const pasteStyleAction: MenuItem = {
        name: 'Paste style',
        icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard" />,
        onSelect: () => {
          et.buffer({...ctx.onBeforeAction?.(pasteStyleAction, 'paste'), action: 'paste', format: 'style'});
        },
      };
      children.push(pasteStyleAction);
    }
    children.push(this.pasteAsMenu(ctx));
    return {
      id: 'paste-menu',
      name: 'Paste',
      icon: () => <Iconista width={15} height={15} set="radix" icon="clipboard" />,
      expand: 5,
      children,
    };
  };

  public readonly clipboardMenu = (ctx: ClipboardMenuCtx = {}): MenuItem => {
    const copyMenu = this.copyMenu(ctx);
    const cutMenu = this.cutMenu(ctx);
    const pasteMenu = this.pasteMenu(ctx);
    cutMenu.sepBefore = true;
    pasteMenu.sepBefore = true;
    return {
      name: 'Copy, cut, and paste',
      icon: () => <Iconista width={16} height={16} set="lucide" icon="copy" />,
      expand: 0,
      sepBefore: true,
      children: [copyMenu, cutMenu, pasteMenu],
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
    const et = this.surface.events.et;
    const menu: MenuItem = {
      name: 'Block type',
      expand: 1,
      expandChild: 0,
      children: [
        {
          name: 'Text blocks',
          expand: 3,
          children: [
            {
              name: 'Paragraph',
              icon: () => <Iconista width={16} height={16} set="lucide" icon="pilcrow" />,
              onSelect: () => {
                et.marker('upd', SliceTypeCon.p);
              },
            },
            {
              name: 'Code block',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="code" />,
              onSelect: () => {
                et.marker('upd', SliceTypeCon.codeblock);
              },
            },
            {
              name: 'Blockquote',
              icon: () => <Iconista width={16} height={16} set="lucide" icon="quote" />,
              onSelect: () => {
                et.marker('upd', [SliceTypeCon.blockquote, SliceTypeCon.p]);
              },
            },
            {
              name: 'Math block',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="math" />,
              onSelect: () => {
                et.marker('upd', SliceTypeCon.mathblock);
              },
            },
            {
              name: 'Pre-formatted',
              icon: () => <Iconista width={16} height={16} set="lucide" icon="type" />,
              onSelect: () => {
                et.marker('upd', SliceTypeCon.pre);
              },
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
              onSelect: () => {
                et.marker('upd', SliceTypeCon.h1);
              },
            },
            {
              name: 'Heading 2',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="h-2" />,
              onSelect: () => {
                et.marker('upd', SliceTypeCon.h2);
              },
            },
            {
              name: 'Heading 3',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="h-3" />,
              onSelect: () => {
                et.marker('upd', SliceTypeCon.h3);
              },
            },
            {
              name: 'Heading 4',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="h-4" />,
              onSelect: () => {
                et.marker('upd', SliceTypeCon.h4);
              },
            },
            {
              name: 'Heading 5',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="h-5" />,
              onSelect: () => {
                et.marker('upd', SliceTypeCon.h5);
              },
            },
            {
              name: 'Heading 6',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="h-6" />,
              onSelect: () => {
                et.marker('upd', SliceTypeCon.h6);
              },
            },
            {
              sepBefore: true,
              name: 'Title',
              icon: () => <Iconista width={16} height={16} set="lucide" icon="type" />,
              onSelect: () => {
                et.marker('upd', SliceTypeCon.title);
              },
            },
            {
              name: 'Sub-title',
              icon: () => <Iconista width={16} height={16} set="lucide" icon="type" />,
              onSelect: () => {
                et.marker('upd', SliceTypeCon.subtitle);
              },
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
              icon: () => <Iconista width={16} height={16} set="ibm_32" icon="list--bulleted" />,
              onSelect: () => {
                et.marker('upd', [SliceTypeCon.ul, SliceTypeCon.li, SliceTypeCon.p]);
              },
            },
            {
              name: 'Numbered list',
              icon: () => <Iconista width={16} height={16} set="ibm_32" icon="list--numbered" />,
              onSelect: () => {
                et.marker('upd', [SliceTypeCon.ol, SliceTypeCon.li, SliceTypeCon.p]);
              },
            },
            {
              name: 'Task list',
              icon: () => <Iconista width={16} height={16} set="ibm_32" icon="list--checked" />,
              onSelect: () => {
                et.marker('upd', [SliceTypeCon.tl, SliceTypeCon.li, SliceTypeCon.p]);
              },
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
              onSelect: () => {
                et.marker('upd', [SliceTypeCon.table, SliceTypeCon.row, SliceTypeCon.p]);
              },
            },
            {
              name: 'Columns',
              icon: () => <Iconista width={16} height={16} set="tabler" icon="columns" />,
              onSelect: () => {
                et.marker('upd', [SliceTypeCon.column, SliceTypeCon.p]);
              },
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

  public readonly leafBlockSmallMenu = (ctx: LeafBlockMenuCtx): MenuItem => {
    const et = this.surface.events.et;
    const block = ctx.block;
    const menu: MenuItem = {
      name: 'Leaf block menu',
      maxToolbarItems: 1,
      more: true,
      minWidth: 280,
      children: [
        {...this.blockTypeMenu(), expand: 1, expandChild: 0},
        {
          sepBefore: true,
          name: 'Cursor actions',
          expand: 4,
          children: [
            {
              name: 'Select block',
              icon: () => <Iconista width={16} height={16} set="bootstrap" icon="cursor-text" />,
              onSelect: () => {
                const start = block.start.clone();
                if (!start.isAbsStart()) start.step(1);
                et.cursor({at: [start, block.end]});
              },
            },
            this.clipboardMenu({
              hideStyleActions: true,
              onBeforeAction: (item, action) => {
                const start = block.start.clone();
                if (!start.isAbsStart() && action === 'paste') start.step(1);
                return {
                  at: [start, block.end],
                };
              },
            }),
          ],
        },

        secondBrain(),
      ],
    };
    return menu;
  };
}

export interface LeafBlockMenuCtx {
  block: LeafBlock<string>;
}

export interface ClipboardMenuCtx {
  hideStyleActions?: boolean;
  onBeforeAction?: (item: MenuItem, action: 'cut' | 'copy' | 'paste') => void | Partial<BufferDetail>;
}
