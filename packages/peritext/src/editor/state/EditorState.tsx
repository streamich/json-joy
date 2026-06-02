import * as sync from 'thingies/lib/sync';
import {compare, type ITimestampStruct} from 'json-joy/lib/json-crdt-patch';
import {SliceTypeName} from 'json-joy/lib/json-crdt-extensions/peritext/slice/constants';
import {spans as defaultSpans} from '../inline/spans';
import {blocks as defaultBLocks} from '../block/blocks';
import {FmtManagePaneState} from '../inline/components/FmtManagePane/state';
import {Menu} from './menus/Menu';
import {Commands} from './commands/Commands';
import {SelectionState} from './SelectionState';
import type {BlockBehavior} from '../block/BlockBehavior';
import type {SpanBehavior} from '../inline/SpanBehavior';
import type {AnyBinding, Key} from '@jsonjoy.com/keyboard';
import type {Inline, InlineAttr, PeritextEventTarget} from 'json-joy/lib/json-crdt-extensions';
import type {Peritext} from 'json-joy/lib/json-crdt-extensions';
import type {PeritextSurfaceState} from '../../web/state';
import type {EditorPluginOpts} from '../plugin';
import type {PeritextEventDetailMap} from 'json-joy/lib/json-crdt-extensions/peritext/events';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';

export class EditorState implements UiLifeCycles {
  public readonly txt: Peritext;
  public lastEvent: PeritextEventDetailMap['change']['ev'] | undefined = void 0;
  public lastEventTs: number = 0;
  public readonly selection: SelectionState;

  public readonly menu = new Menu(this);
  public cmd?: Commands;

  public readonly activeSlice = sync.val<undefined>(void 0);

  /**
   * The ID of the active (where the main cursor or focus is placed) leaf block.
   */
  public readonly activeLeafBlockId$ = sync.val<ITimestampStruct | null>(null);

  /** State of the active (exactly selected) island "under" cursor popup, if any. */
  public readonly islandUnder = sync.val<FmtManagePaneState | null>(null);

  public readonly et: PeritextEventTarget;

  public readonly spanOrder: Record<string | number, number> = {};
  public readonly spanMap: Record<string | number, SpanBehavior> = {};
  public readonly blockMap: Record<string | number, BlockBehavior> = {};

  public readonly docSize: sync.Value<ResizeObserverEntry | null>;
  public readonly docWidth: sync.Computed<number>;
  public readonly docSizer: ResizeObserver;

  constructor(
    public readonly surface: PeritextSurfaceState,
    public readonly opts: EditorPluginOpts,
    public readonly spans: SpanBehavior[] = defaultSpans as SpanBehavior[],
    public readonly blocks: BlockBehavior[] = defaultBLocks as BlockBehavior[],
  ) {
    this.txt = this.surface.dom.txt;
    this.et = surface.headless.et;
    this.selection = new SelectionState(this);
    const spanLength = spans.length;
    for (let i = 0; i < spanLength; i++) {
      const span = spans[i];
      const tag = span.tag;
      this.spanOrder[tag] = i;
      this.spanMap[tag] = span;
    }
    const blockLength = blocks.length;
    for (let i = 0; i < blockLength; i++) {
      const block = blocks[i];
      this.blockMap[block.tag] = block;
    }
    const docSize = (this.docSize = sync.val<ResizeObserverEntry | null>(null));
    this.docWidth = sync.comp([docSize], ([entry]) => {
      return entry?.contentRect?.width || 0;
    });
    this.docSizer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) docSize.next(entry);
    });
  }

  private _setActiveLeafBlockId = () => {
    const {activeLeafBlockId$, txt} = this;
    const {overlay, editor} = txt;
    const value = activeLeafBlockId$.value;
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

  public islandSelected(inline: Inline, attr: InlineAttr): void {
    const {islandUnder, txt, surface} = this;
    const editor = txt.editor;
    if (editor.cursorCard() !== 1) {
      islandUnder.next(null);
      return;
    }
    const selection = inline.selection();
    const isExactSelection = !!selection?.[0] && !!selection?.[1];
    if (!isExactSelection) {
      islandUnder.next(null);
      return;
    }
    const state = new FmtManagePaneState(this, inline, surface.headless.kbd);
    islandUnder.next(state);
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

  // public registerSlice(tag: TypeTag, data: SliceRegistryEntryData): ToolBarSliceRegistryEntry {
  //   const registry = this.txt.editor.getRegistry();
  //   const entry = registry.get(tag);
  // }

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public start() {
    const {surface, menu} = this;
    const {dom, events} = surface;
    const {et} = events;
    const mouseDown = dom!.cursor.mouseDown;
    const el = dom.facade.el;
    const commands = (this.cmd = new Commands(this));
    const stopMenu = menu.start();
    const registry = this.txt.editor.getRegistry();
    for (const behavior of defaultSpans) {
      registry.add(behavior);
      const {cmd} = behavior;
      if (cmd) {
        if (Array.isArray(cmd)) for (const c of cmd) commands.register(c);
        else commands.register(cmd);
      }
    }
    const stopCommands = this.cmd.start();
    // Object.assign(registry.get(SliceTypeName.a)?.data() || {}, behavior.a);
    // // registry.add({});
    // Object.assign(registry.get(SliceTypeName.col)?.data() || {}, behavior.col);

    const changeUnsubscribe = et.subscribe('change', (ev) => {
      const lastEvent = ev.detail.ev;
      this.setLastEv(lastEvent);
      this._setActiveLeafBlockId();
    });

    const {txt, islandUnder} = this;
    const cursorUnsubscribe = et.subscribe('cursor', (ev) => {
      const islandUnderValue = islandUnder.value;
      if (islandUnderValue) {
        const editor = txt.editor;
        if (editor.cursorCard() !== 1 || !islandUnderValue.inline || editor.cursor.cmp(islandUnderValue.inline) !== 0) {
          islandUnder.next(null);
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

    // TODO: Move this to <a> span behavior.
    const onKeyDownDocument = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'k': {
          if (event.metaKey) {
            const editor = this.txt.editor;
            const newSlice = this.selection.newSlice;
            if (
              editor.hasCursor() &&
              !editor.mainCursor()?.isCollapsed() &&
              (!newSlice.value || newSlice.value.behavior.tag !== SliceTypeName.a)
            ) {
              event.stopPropagation();
              event.preventDefault;
              this.selection.showNewSlicePopup(SliceTypeName.a);
              return;
            }
          }
          break;
        }
      }
    };

    el.addEventListener('mousedown', mouseDownListener);

    document.addEventListener('keydown', onKeyDownDocument);

    const unbindHotkeys = this.surface.headless.kbd.bind([
      [
        'Escape',
        (press: Key) => {
          if (islandUnder.value) {
            islandUnder.next(null);
            return;
          }
          // Remove all cursors.
          const editor = this.txt.editor;
          if (editor.hasCursor()) {
            editor.delCursors();
            this.surface.rerender();
            return;
          }
          press.propagate = true;
        },
      ],
    ]);

    const unbindHotkeysSurface = dom.kbd?.bind([
      [
        'Escape',
        (press: Key) => {
          const editor = this.txt.editor;
          const mainCursor = editor.mainCursor();
          // Hide inline selection toolbar.
          const toolbarHidden = this.selection.hideToolbar();
          if (toolbarHidden && mainCursor && !mainCursor.isCollapsed()) {
            return;
          }
          // Leave only one cursor, if multiple cursors are present.
          const cursorCardinality = editor.cursorCard();
          if (cursorCardinality > 1) {
            editor.delCursors((c) => c !== mainCursor);
            this.surface.rerender();
            return;
          }
          if (cursorCardinality === 1 && mainCursor && !mainCursor.isCollapsed()) {
            mainCursor.set(mainCursor.focus());
            this.surface.rerender();
            return;
          }
          // Blur the editor.
          const div = this.surface.dom.facade.el;
          if (div instanceof HTMLElement && document.activeElement === div) {
            div.blur();
            return;
          }
          press.propagate = true;
        },
      ],
      [
        'Meta Meta',
        () => {
          et.cursor({flip: true});
        },
      ],
      ...this.spans
        .filter((b) => b.keys)
        .map(
          (b) =>
            [
              b.keys!.join('+'),
              (press: Key) => {
                press.event?.preventDefault();
                b.action?.(this);
              },
            ] as AnyBinding,
        ),
    ]);

    const selectionStop = this.selection.start();

    return () => {
      this.docSizer.disconnect();
      stopMenu();
      stopCommands();
      changeUnsubscribe();
      cursorUnsubscribe();
      unsubscribeMouseDown?.();
      el.removeEventListener('mousedown', mouseDownListener);
      document.removeEventListener('keydown', onKeyDownDocument);
      unbindHotkeys();
      unbindHotkeysSurface?.();
      selectionStop();
    };
  }
}
