import {printTree, type Printable} from 'tree-dump';
import {AvlMap} from 'sonic-forest/lib/avl/AvlMap';
import {KeyContext} from '@jsonjoy.com/keyboard';
import {InputController} from './controllers/InputController';
import {CursorController} from './controllers/CursorController';
import {RichTextController} from './controllers/RichTextController';
import {CompositionController} from './controllers/CompositionController';
import {ElementAttr} from '../constants';
import {Anchor} from 'json-joy/lib/json-crdt-extensions/peritext/rga/constants';
import {compare, type ITimestampStruct} from 'json-joy/lib/json-crdt-patch';
import {UiHandle} from 'json-joy/lib/json-crdt-extensions/peritext/events/defaults/ui/UiHandle';
import type {PeritextHeadless} from 'json-joy/src/json-crdt-extensions/peritext';
import type {Point} from 'json-joy/lib/json-crdt-extensions/peritext/rga/Point';
import type {Rect, UiLifeCycles} from '../types';
import type {Inline, Peritext} from 'json-joy/lib/json-crdt-extensions';
import type {Range} from 'json-joy/lib/json-crdt-extensions/peritext/rga/Range';
import type {PeritextEventTarget} from 'json-joy/lib/json-crdt-extensions/peritext/events/PeritextEventTarget';
import type {PeritextUiApi} from 'json-joy/lib/json-crdt-extensions/peritext/events/defaults/ui/types';
import type {DomFacade, DomFacadeElement} from './facade/types';

export class DomController implements UiLifeCycles, Printable, PeritextUiApi {
  public readonly txt: Peritext;
  public readonly et: PeritextEventTarget;
  public readonly comp: CompositionController;
  public readonly input: InputController;
  public readonly cursor: CursorController;
  public readonly richText: RichTextController;
  public kbd?: KeyContext;

  /**
   * Index of block HTML <div> elements keyed by the ID (timestamp) of the split
   * boundary that starts that block element.
   */
  public readonly blocks = new AvlMap<ITimestampStruct, HTMLSpanElement>(compare);

  /**
   * Index of inline HTML <span> elements keyed by the slice start {@link Point}.
   */
  public readonly inlines = new AvlMap<Point, HTMLSpanElement>((a, b) => a.cmpSpatial(b));

  constructor(
    public readonly headless: PeritextHeadless,
  ) {
    const events = headless.defaults;
    const {txt} = events;
    this.txt = txt;
    this.et = events.et;
    this.comp = new CompositionController(this);
    this.input = new InputController(this);
    this.cursor = new CursorController(this);
    this.richText = new RichTextController(this);
    const uiHandle = new UiHandle(txt, <PeritextUiApi>this);
    events.ui = uiHandle;
  }

  public isEditable(el: Element): boolean {
    if (!(el as any).isContentEditable) return false;
    const computed = getComputedStyle(el);
    return (
      computed.getPropertyValue('--jsonjoy-peritext-id') === this.et.id + '' &&
      computed.getPropertyValue('--jsonjoy-peritext-editable') === 'yes'
    );
  }

  /** -------------------------------------------------- {@link UiLifeCycles} */

  /**
   * Must be set before calling {@link start}.
   */
  public facade!: DomFacade;

  public start() {
    const {et, facade} = this;
    const el = facade.el;
    const headless = this.headless;
    this.kbd = headless.kbd.child('peritext-input', el as HTMLElement);
    (el as any).contentEditable = 'true';
    const style = el.style;
    style.setProperty('--jsonjoy-peritext-id', et.id + '');
    style.setProperty('--jsonjoy-peritext-editable', 'yes');
    const stopHeadless = this.headless.start();
    const stopComp = this.comp.start();
    const stopInput = this.input.start();
    const stopCursor = this.cursor.start();
    const stopRichText = this.richText.start();
    return () => {
      (el as any).contentEditable = 'false';
      stopHeadless();
      stopComp();
      stopInput();
      stopCursor();
      stopRichText();
    };
  }

  /** ------------------------------------------------- {@link PeritextUiApi} */

  public focus(): void {
    this.facade.el.focus?.();
  }

  protected getSpans(blockInnerId?: Point) {
    let el: DomFacadeElement | undefined;
    if (blockInnerId) {
      const txt = this.txt;
      const marker = txt.overlay.getOrNextLowerMarker(blockInnerId);
      const markerId = marker?.id ?? txt.str.id;
      el = this.blocks.get(markerId);
    }
    el ??= this.facade.el;
    return el.querySelectorAll?.('.jsonjoy-peritext-inline');
  }

  protected findSpanContaining(char: Range): HTMLSpanElement | undefined {
    const start = char.start;
    const overlayPoint = this.txt.overlay.getOrNextLower(start);
    if (overlayPoint) {
      const span = this.inlines.get(overlayPoint);
      if (span) {
        const inline = (span as any)[ElementAttr.InlineOffset] as Inline | undefined;
        if (inline) {
          const contains = inline.contains(char);
          if (contains) return span;
        }
      }
    }
    const spans = this.getSpans(start);
    if (spans) {
      const length = spans.length;
      for (let i = 0; i < length; i++) {
        const span = spans[i] as HTMLSpanElement;
        const inline = (span as any)[ElementAttr.InlineOffset] as Inline | undefined;
        if (inline) {
          const contains = inline.contains(char);
          if (contains) return span;
        }
      }
    }
    return;
  }

  public getCharRect(char: number | ITimestampStruct): Rect | undefined {
    const txt = this.headless.txt;
    const id = typeof char === 'number' ? txt.str.find(char) : char;
    if (!id) return;
    const start = txt.point(id, Anchor.Before);
    const end = txt.point(id, Anchor.After);
    const charRange = txt.range(start, end);
    const span = this.findSpanContaining(charRange);
    if (!span) return;
    const inline = (span as any)[ElementAttr.InlineOffset] as Inline | undefined;
    if (!inline) return;
    const textNode = span.firstChild as Text;
    if (!textNode) return;
    const range = document.createRange();
    range.selectNode(textNode);
    const offset = Math.max(0, Math.min(textNode.length - 1, charRange.start.viewPos() - inline.start.viewPos()));
    range.setStart(textNode, offset);
    range.setEnd(textNode, offset + 1);
    const rects = range.getClientRects();
    return rects[0];
  }

  public caretRect(): Rect | undefined {
    return document.getElementById(this.cursor.caretId)?.getBoundingClientRect?.();
  }

  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab?: string): string {
    return (
      'web' +
      printTree(tab, [
        () => 'blocks: ' + this.blocks.size() + ', inlines: ' + this.inlines.size(),
        (tab) => this.cursor.toString(tab),
        this.kbd ? (tab) => this.kbd!.toString(tab) : null,
        (tab) => this.comp.toString(tab),
        (tab) => this.headless.toString(tab),
      ])
    );
  }
}
