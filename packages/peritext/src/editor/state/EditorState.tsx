import * as React from 'react';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {ValueSyncStore} from 'json-joy/lib/util/events/sync-store';
import {secondBrain} from './menus';
import {Code} from '@jsonjoy.com/ui/lib/1-inline/Code';
import {FontStyleButton} from '@jsonjoy.com/ui/lib/2-inline-block/FontStyleButton';
import {CommonSliceType, type LeafBlock, type Peritext} from 'json-joy/lib/json-crdt-extensions';
import {BehaviorSubject} from 'rxjs';
import {compare, type ITimestampStruct} from 'json-joy/lib/json-crdt-patch';
import {SliceTypeName} from 'json-joy/lib/json-crdt-extensions/peritext/slice/constants';
import {NewFormatting} from './formattings';
import {inlines} from '../inline/tags';
import {ClipboardMenu} from './menus/ClipboardMenu';
import {SelectionMenu} from './menus/SelectionMenu';
import * as a from '../inline/tags/a';
import * as col from '../inline/tags/col';
import * as bg from '../inline/tags/bg';
import type {PeritextSurfaceState} from '../../web/state';
import type {MenuItem} from '../types';
import type {ToolbarPluginOpts} from '../ToolbarPlugin';
import type {
  BufferDetail,
  PeritextCursorEvent,
  PeritextEventDetailMap,
} from 'json-joy/lib/json-crdt-extensions/peritext/events';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';

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
const _BorderLeftIcon = makeIcon({set: 'tabler', icon: 'border-left'});
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
const ItalicIcon = makeIcon({set: 'lucide', icon: 'italic'});
const _BoldIcon = makeIcon({set: 'lucide', icon: 'bold'});
const KeyboardIcon = makeIcon({set: 'lucide', icon: 'keyboard'});
const _PaintBucketIcon = makeIcon({set: 'lucide', icon: 'paint-bucket'});
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
const MarkdownIcon = makeIcon({set: 'simple', icon: 'markdown'});
const Html5Icon = makeIcon({set: 'simple', icon: 'html5'});
const ListBulletedIcon = makeIcon({set: 'ibm_32', icon: 'list--bulleted'});
const ListNumberedIcon = makeIcon({set: 'ibm_32', icon: 'list--numbered'});
const ListCheckedIcon = makeIcon({set: 'ibm_32', icon: 'list--checked'});
const CursorTextIcon = makeIcon({set: 'bootstrap', icon: 'cursor-text'});
const _CommentTextIcon = makeIcon({set: 'lineicons', icon: 'comment-1-text'});
const _FlagIcon = makeIcon({set: 'lineicons', icon: 'flag-2'});

export class EditorState implements UiLifeCycles {
  public readonly txt: Peritext;
  public lastEvent: PeritextEventDetailMap['change']['ev'] | undefined = void 0;
  public lastEventTs: number = 0;
  public readonly showInlineToolbar = new ValueSyncStore<[show: boolean, time: number]>([false, 0]);
  
  public readonly clipboardMenu = new ClipboardMenu(this);
  public readonly selectionMenu = new SelectionMenu(this);

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
    const el = dom.facade.el;

    const registry = this.txt.editor.getRegistry();
    for (const behavior of inlines) {
      registry.add(behavior);
    }
    // Object.assign(registry.get(SliceTypeName.a)?.data() || {}, behavior.a);
    // // registry.add({});
    // Object.assign(registry.get(SliceTypeName.col)?.data() || {}, behavior.col);

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
              this.startSliceConfig(SliceTypeName.a, this.selectionMenu.linkMenuItem());
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

    const unsubscribeKeyBind = dom.kbd?.bind([
      ['Meta Meta', () => {
        et.cursor({flip: true});
      }],
    ]);

    return () => {
      changeUnsubscribe();
      unsubscribeMouseDown?.();
      el.removeEventListener('mousedown', mouseDownListener);
      el.removeEventListener('mouseup', mouseUpListener);
      el.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keydown', onKeyDownDocument);
      et.removeEventListener('cursor', onCursor);
      unsubscribeKeyBind?.();
    };
  }

  // -------------------------------------------------------------------- Menus

  public readonly getCaretMenu = (): MenuItem => {
    return {
      name: 'Inline text',
      maxToolbarItems: 4,
      children: [
        this.selectionMenu.formattingMenu(),
        secondBrain(),
        {
          name: 'Annotations separator',
          sep: true,
        },
        this.selectionMenu.annotationsMenu(),
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
        this.selectionMenu.modifyMenu(),
        this.clipboardMenu.clipboardMenu(),
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
    return this.selectionMenu.build();
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
            this.clipboardMenu.clipboardMenu({
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
