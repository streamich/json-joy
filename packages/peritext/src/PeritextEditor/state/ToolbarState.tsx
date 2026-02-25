import * as React from 'react';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {ValueSyncStore} from 'json-joy/lib/util/events/sync-store';

// Preloaded icons - Radix set
const FontBoldIcon = makeIcon({set: 'radix', icon: 'font-bold'});
const _FontItalicIcon = makeIcon({set: 'radix', icon: 'font-italic'});
const _StrikethroughRadixIcon = makeIcon({set: 'radix', icon: 'strikethrough'});
const ClipboardCopyIcon = makeIcon({set: 'radix', icon: 'clipboard-copy'});
const ClipboardIcon = makeIcon({set: 'radix', icon: 'clipboard'});
const DropdownMenuIcon = makeIcon({set: 'radix', icon: 'dropdown-menu'});
const LetterSpacingIcon = makeIcon({set: 'radix', icon: 'letter-spacing'});
const FontStyleIcon = makeIcon({set: 'radix', icon: 'font-style'});
const FontFamilyIcon = makeIcon({set: 'radix', icon: 'font-family'});
const FontSizeIcon = makeIcon({set: 'radix', icon: 'font-size'});
const LetterCaseUppercaseIcon = makeIcon({set: 'radix', icon: 'letter-case-uppercase'});
const LetterCaseLowercaseIcon = makeIcon({set: 'radix', icon: 'letter-case-lowercase'});
const LayersIcon = makeIcon({set: 'radix', icon: 'layers'});
const RadixKeyboardIcon = makeIcon({set: 'radix', icon: 'keyboard'});
const RadixFileIcon = makeIcon({set: 'radix', icon: 'file'});
const CalendarIcon = makeIcon({set: 'radix', icon: 'calendar'});
const ButtonIcon = makeIcon({set: 'radix', icon: 'button'});
const SewingPinIcon = makeIcon({set: 'radix', icon: 'sewing-pin'});
const PlusIcon = makeIcon({set: 'radix', icon: 'plus'});
const LinkRadixIcon = makeIcon({set: 'radix', icon: 'link-2'});

// Preloaded icons - Tabler set
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
const BorderLeftIcon = makeIcon({set: 'tabler', icon: 'border-left'});
const BoxAlignRightIcon = makeIcon({set: 'tabler', icon: 'box-align-right'});
const EraserIcon = makeIcon({set: 'tabler', icon: 'eraser'});
const TrashIcon = makeIcon({set: 'tabler', icon: 'trash'});
const ScissorsIcon = makeIcon({set: 'tabler', icon: 'scissors'});
const JsonIcon = makeIcon({set: 'tabler', icon: 'json'});
const TypographyIcon = makeIcon({set: 'tabler', icon: 'typography'});
const TemplateIcon = makeIcon({set: 'tabler', icon: 'template'});
const WalletIcon = makeIcon({set: 'tabler', icon: 'wallet'});
const BrainIcon = makeIcon({set: 'tabler', icon: 'brain'});
const H1Icon = makeIcon({set: 'tabler', icon: 'h-1'});
const H2Icon = makeIcon({set: 'tabler', icon: 'h-2'});
const H3Icon = makeIcon({set: 'tabler', icon: 'h-3'});
const H4Icon = makeIcon({set: 'tabler', icon: 'h-4'});
const H5Icon = makeIcon({set: 'tabler', icon: 'h-5'});
const H6Icon = makeIcon({set: 'tabler', icon: 'h-6'});
const LayoutIcon = makeIcon({set: 'tabler', icon: 'layout'});
const TableIcon = makeIcon({set: 'tabler', icon: 'table'});
const ColumnsIcon = makeIcon({set: 'tabler', icon: 'columns'});
const ImageInPictureIcon = makeIcon({set: 'tabler', icon: 'image-in-picture'});
const PhotoScanIcon = makeIcon({set: 'tabler', icon: 'photo-scan'});
const TablerFileIcon = makeIcon({set: 'tabler', icon: 'file'});
const MathIcon = makeIcon({set: 'tabler', icon: 'math'});

// Preloaded icons - Lucide set
const ItalicIcon = makeIcon({set: 'lucide', icon: 'italic'});
const _BoldIcon = makeIcon({set: 'lucide', icon: 'bold'});
const KeyboardIcon = makeIcon({set: 'lucide', icon: 'keyboard'});
const PaintBucketIcon = makeIcon({set: 'lucide', icon: 'paint-bucket'});
const CopyIcon = makeIcon({set: 'lucide', icon: 'copy'});
const TypeIcon = makeIcon({set: 'lucide', icon: 'type'});
const VariableIcon = makeIcon({set: 'lucide', icon: 'variable'});
const SquareChevronRightIcon = makeIcon({set: 'lucide', icon: 'square-chevron-right'});
const SmilePlusIcon = makeIcon({set: 'lucide', icon: 'smile-plus'});
const OmegaIcon = makeIcon({set: 'lucide', icon: 'omega'});
const _LinkIcon = makeIcon({set: 'lucide', icon: 'link'});
const BetweenVerticalEndIcon = makeIcon({set: 'lucide', icon: 'between-vertical-end'});
const TextIcon = makeIcon({set: 'lucide', icon: 'text'});
const UndoIcon = makeIcon({set: 'lucide', icon: 'undo'});
const RedoIcon = makeIcon({set: 'lucide', icon: 'redo'});
const QuoteIcon = makeIcon({set: 'lucide', icon: 'quote'});
const PilcrowIcon = makeIcon({set: 'lucide', icon: 'pilcrow'});
const _FootprintsIcon = makeIcon({set: 'lucide', icon: 'footprints'});

// Preloaded icons - Simple set
const MarkdownIcon = makeIcon({set: 'simple', icon: 'markdown'});
const Html5Icon = makeIcon({set: 'simple', icon: 'html5'});

// Preloaded icons - IBM set
const ListBulletedIcon = makeIcon({set: 'ibm_32', icon: 'list--bulleted'});
const ListNumberedIcon = makeIcon({set: 'ibm_32', icon: 'list--numbered'});
const ListCheckedIcon = makeIcon({set: 'ibm_32', icon: 'list--checked'});

// Preloaded icons - Bootstrap set
const CursorTextIcon = makeIcon({set: 'bootstrap', icon: 'cursor-text'});

// Preloaded icons - Lineicons set
const _CommentTextIcon = makeIcon({set: 'lineicons', icon: 'comment-1-text'});
const _FlagIcon = makeIcon({set: 'lineicons', icon: 'flag-2'});
import {secondBrain} from './menus';
import {Code} from '@jsonjoy.com/ui/lib/1-inline/Code';
import {FontStyleButton} from '@jsonjoy.com/ui/lib/2-inline-block/FontStyleButton';
import {CommonSliceType, type LeafBlock, type Peritext} from 'json-joy/lib/json-crdt-extensions';
import {BehaviorSubject} from 'rxjs';
import {compare, type ITimestampStruct} from 'json-joy/lib/json-crdt-patch';
import {SliceTypeName} from 'json-joy/lib/json-crdt-extensions/peritext/slice/constants';
import {NewFormatting} from './formattings';
import type {PeritextSurfaceState} from '../../PeritextWebUi/state';
import * as behavior from '../formatting/tags';
import type {MenuItem} from '../types';
import type {ToolbarPluginOpts} from '../ToolbarPlugin';
import type {
  BufferDetail,
  PeritextCursorEvent,
  PeritextEventDetailMap,
} from 'json-joy/lib/json-crdt-extensions/peritext/events';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';

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

  public startSliceConfig(tag: SliceTypeName | string | number, menu?: MenuItem): NewFormatting | undefined {
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
    Object.assign(registry.get(SliceTypeName.a)?.data() || {}, behavior.a);
    // registry.add({});
    Object.assign(registry.get(SliceTypeName.col)?.data() || {}, behavior.col);

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
            event.preventDefault;
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
            if (
              editor.hasCursor() &&
              !editor.mainCursor()?.isCollapsed() &&
              (!newSliceConfig.value || newSliceConfig.value.behavior.tag !== SliceTypeName.a)
            ) {
              event.stopPropagation();
              event.preventDefault;
              this.startSliceConfig(SliceTypeName.a, this.linkMenuItem());
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
              icon: () => <FontBoldIcon width={15} height={15} />,
              // icon: () => <BoldIcon width={16} height={16} />,
              right: () => <Sidetip small>⌘ B</Sidetip>,
              keys: ['⌘', 'b'],
              onSelect: () => {
                et.format('tog', CommonSliceType.b);
              },
            },
            {
              name: 'Italic',
              // icon: () => <FontItalicIcon width={15} height={15} />,
              // icon: () => <ItalicIcon width={16} height={16} />,
              icon: () => <ItalicIcon width={14} height={14} />,
              right: () => <Sidetip small>⌘ I</Sidetip>,
              keys: ['⌘', 'i'],
              onSelect: () => {
                et.format('tog', CommonSliceType.i);
              },
            },
            {
              name: 'Underline',
              icon: () => <UnderlineIcon width={16} height={16} />,
              right: () => <Sidetip small>⌘ U</Sidetip>,
              keys: ['⌘', 'u'],
              onSelect: () => {
                et.format('tog', CommonSliceType.u);
              },
            },
            {
              name: 'Strikethrough',
              // icon: () => <StrikethroughRadixIcon width={15} height={15} />,
              icon: () => <StrikethroughIcon width={16} height={16} />,
              onSelect: () => {
                et.format('tog', CommonSliceType.s);
              },
            },
            {
              name: 'Overline',
              icon: () => <OverlineIcon width={16} height={16} />,
              onSelect: () => {
                et.format('tog', CommonSliceType.overline);
              },
            },
            {
              name: 'Highlight',
              icon: () => <HighlightIcon width={16} height={16} />,
              onSelect: () => {
                et.format('tog', CommonSliceType.mark);
              },
            },
            {
              name: 'Classified',
              icon: () => <LockPasswordIcon width={16} height={16} />,
              onSelect: () => {
                et.format('tog', CommonSliceType.spoiler);
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
              icon: () => <CodeIcon width={16} height={16} />,
              onSelect: () => {
                et.format('tog', CommonSliceType.code);
              },
            },
            {
              name: 'Math',
              icon: () => <MathIntegralXIcon width={16} height={16} />,
              onSelect: () => {
                et.format('tog', CommonSliceType.math);
              },
            },
            {
              name: 'Superscript',
              icon: () => <SuperscriptIcon width={16} height={16} />,
              onSelect: () => {
                et.format('tog', CommonSliceType.sup);
              },
            },
            {
              name: 'Subscript',
              icon: () => <SubscriptIcon width={16} height={16} />,
              onSelect: () => {
                et.format('tog', CommonSliceType.sub);
              },
            },
            {
              name: 'Keyboard key',
              icon: () => <KeyboardIcon width={16} height={16} />,
              onSelect: () => {
                et.format('tog', CommonSliceType.kbd);
              },
            },
            {
              name: 'Insertion',
              icon: () => <PencilPlusIcon width={16} height={16} />,
              onSelect: () => {
                et.format('tog', CommonSliceType.ins);
              },
            },
            {
              name: 'Deletion',
              icon: () => <PencilMinusIcon width={16} height={16} />,
              onSelect: () => {
                et.format('tog', CommonSliceType.del);
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
            this.colorMenuItem(),
            {
              name: 'Background',
              icon: () => <PaintBucketIcon width={16} height={16} />,
              onSelect: () => {},
            },
            {
              name: 'Border',
              icon: () => <BorderLeftIcon width={16} height={16} />,
              onSelect: () => {},
            },
          ],
        },
      ],
    };
  };

  public readonly colorMenuItem = (): MenuItem => {
    const colorItem: MenuItem = {
      ...behavior.col.menu,
      onSelect: () => {
        this.startSliceConfig(CommonSliceType.col, colorItem);
      },
    };
    return colorItem;
  };

  public readonly linkMenuItem = (): MenuItem => {
    const linkAction: MenuItem = {
      ...behavior.a.menu,
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

  public readonly copyAsMenu = (action: 'copy' | 'cut', ctx: ClipboardMenuCtx = {}): MenuItem => {
    const icon =
      action === 'copy'
        ? () => <ClipboardCopyIcon width={15} height={15} />
        : () => <ScissorsIcon width={16} height={16} />;
    const et = this.surface.events.et;
    const iconMarkdown = () => <MarkdownIcon width={16} height={16} style={{opacity: 0.5}} />;
    const iconHtml = () => <Html5Icon width={14} height={14} style={{opacity: 0.5}} />;
    const iconJson = () => <JsonIcon width={16} height={16} style={{opacity: 0.5}} />;
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
      right: () => <TextIcon width={16} height={16} style={{opacity: 0.5}} />,
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
    const icon = () => <ClipboardIcon width={15} height={15} />;
    const iconMarkdown = () => <MarkdownIcon width={16} height={16} style={{opacity: 0.5}} />;
    const iconHtml = () => <Html5Icon width={14} height={14} style={{opacity: 0.5}} />;
    const iconJson = () => <JsonIcon width={16} height={16} style={{opacity: 0.5}} />;
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
      icon: () => <ClipboardCopyIcon width={15} height={15} />,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(copyAction, 'copy'), action: 'copy'});
      },
    };
    const copyTextOnlyAction: MenuItem = {
      name: 'Copy text only',
      icon: () => <ClipboardCopyIcon width={15} height={15} />,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(copyTextOnlyAction, 'copy'), action: 'copy', format: 'text'});
      },
    };
    const children: MenuItem[] = [copyAction, copyTextOnlyAction];
    if (!ctx.hideStyleActions) {
      const copyStyleAction: MenuItem = {
        name: 'Copy style',
        icon: () => <ClipboardCopyIcon width={15} height={15} />,
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
      icon: () => <ClipboardCopyIcon width={15} height={15} />,
      expand: 5,
      children,
    };
  };

  public readonly cutMenu = (ctx: ClipboardMenuCtx = {}): MenuItem => {
    const et = this.surface.events.et;
    const cutAction: MenuItem = {
      name: 'Cut',
      danger: true,
      icon: () => <ScissorsIcon width={16} height={16} />,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(cutAction, 'cut'), action: 'cut'});
      },
    };
    const cutTextAction: MenuItem = {
      name: 'Cut text only',
      danger: true,
      icon: () => <ScissorsIcon width={16} height={16} />,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(cutTextAction, 'cut'), action: 'cut', format: 'text'});
      },
    };
    return {
      id: 'cut-menu',
      name: 'Cut',
      icon: () => <ScissorsIcon width={16} height={16} />,
      expand: 5,
      children: [cutAction, cutTextAction, this.copyAsMenu('cut', ctx)],
    };
  };

  public readonly pasteMenu = (ctx: ClipboardMenuCtx = {}): MenuItem => {
    const et = this.surface.events.et;
    const pasteAction: MenuItem = {
      name: 'Paste',
      icon: () => <ClipboardIcon width={15} height={15} />,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(pasteAction, 'paste'), action: 'paste'});
      },
    };
    const pasteTextAction: MenuItem = {
      name: 'Paste text',
      icon: () => <ClipboardIcon width={15} height={15} />,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(pasteTextAction, 'paste'), action: 'paste', format: 'text'});
      },
    };
    const children: MenuItem[] = [pasteAction, pasteTextAction];
    if (!ctx.hideStyleActions) {
      const pasteStyleAction: MenuItem = {
        name: 'Paste style',
        icon: () => <ClipboardIcon width={15} height={15} />,
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
      icon: () => <ClipboardIcon width={15} height={15} />,
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
      icon: () => <CopyIcon width={16} height={16} />,
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
        this.modifyMenu(),
        this.clipboardMenu(),
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
          // icon: () => <CopyIcon width={15} height={15} />,
          icon: () => <CopyIcon width={16} height={16} />,
          expand: 0,
          children: [
            {
              id: 'copy-menu',
              name: 'Copy',
              // icon: () => <CopyIcon width={15} height={15} />,
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
              // icon: () => <CopyIcon width={15} height={15} />,
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
              icon: () => <PilcrowIcon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', SliceTypeName.p);
              },
            },
            {
              name: 'Code block',
              icon: () => <CodeIcon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', SliceTypeName.codeblock);
              },
            },
            {
              name: 'Blockquote',
              icon: () => <QuoteIcon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', [SliceTypeName.blockquote, SliceTypeName.p]);
              },
            },
            {
              name: 'Math block',
              icon: () => <MathIcon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', SliceTypeName.mathblock);
              },
            },
            {
              name: 'Pre-formatted',
              icon: () => <TypeIcon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', SliceTypeName.pre);
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
              icon: () => <H1Icon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', SliceTypeName.h1);
              },
            },
            {
              name: 'Heading 2',
              icon: () => <H2Icon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', SliceTypeName.h2);
              },
            },
            {
              name: 'Heading 3',
              icon: () => <H3Icon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', SliceTypeName.h3);
              },
            },
            {
              name: 'Heading 4',
              icon: () => <H4Icon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', SliceTypeName.h4);
              },
            },
            {
              name: 'Heading 5',
              icon: () => <H5Icon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', SliceTypeName.h5);
              },
            },
            {
              name: 'Heading 6',
              icon: () => <H6Icon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', SliceTypeName.h6);
              },
            },
            {
              sepBefore: true,
              name: 'Title',
              icon: () => <TypeIcon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', SliceTypeName.title);
              },
            },
            {
              name: 'Sub-title',
              icon: () => <TypeIcon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', SliceTypeName.subtitle);
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
              icon: () => <ListBulletedIcon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', [SliceTypeName.ul, SliceTypeName.li, SliceTypeName.p]);
              },
            },
            {
              name: 'Numbered list',
              icon: () => <ListNumberedIcon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', [SliceTypeName.ol, SliceTypeName.li, SliceTypeName.p]);
              },
            },
            {
              name: 'Task list',
              icon: () => <ListCheckedIcon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', [SliceTypeName.tl, SliceTypeName.li, SliceTypeName.p]);
              },
            },
          ],
        },
        {
          sepBefore: true,
          name: 'Layouts',
          expand: 0,
          icon: () => <LayoutIcon width={16} height={16} />,
          children: [
            {
              name: 'Table',
              icon: () => <TableIcon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', [SliceTypeName.table, SliceTypeName.tr, SliceTypeName.p]);
              },
            },
            {
              name: 'Columns',
              icon: () => <ColumnsIcon width={16} height={16} />,
              onSelect: () => {
                et.marker('upd', [SliceTypeName.column, SliceTypeName.p]);
              },
            },
          ],
        },
        {
          sepBefore: true,
          name: 'Embed',
          expand: 0,
          icon: () => <ImageInPictureIcon width={16} height={16} />,
          children: [
            {
              name: 'Image',
              icon: () => <PhotoScanIcon width={16} height={16} />,
              onSelect: () => {},
            },
            {
              name: 'File',
              icon: () => <TablerFileIcon width={16} height={16} />,
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
              icon: () => <CursorTextIcon width={16} height={16} />,
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

  public readonly documentMenu = (): MenuItem => {
    const _et = this.surface.events.et;
    const menu: MenuItem = {
      name: 'Document menu',
      maxToolbarItems: 1,
      more: true,
      minWidth: 280,
      children: [
        {
          name: 'History',
          expand: 2,
          children: [
            {
              name: 'Undo',
              icon: () => <UndoIcon width={16} height={16} />,
              onSelect: () => {},
            },
            {
              name: 'Redo',
              icon: () => <RedoIcon width={16} height={16} />,
              onSelect: () => {},
            },
          ],
        },
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
