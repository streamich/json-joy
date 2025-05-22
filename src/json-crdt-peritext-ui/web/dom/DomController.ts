import {printTree, type Printable} from 'tree-dump';
import {AvlMap} from 'sonic-forest/lib/avl/AvlMap';
import {InputController} from './InputController';
import {CursorController} from './CursorController';
import {RichTextController} from './RichTextController';
import {KeyController} from './KeyController';
import {CompositionController} from './CompositionController';
import {AnnalsController} from './annals/AnnalsController';
import {ElementAttr} from '../constants';
import {Anchor} from '../../../json-crdt-extensions/peritext/rga/constants';
import {compare, type ITimestampStruct} from '../../../json-crdt-patch';
import {UiHandle} from '../../../json-crdt-extensions/peritext/events/defaults/ui/UiHandle';
import type {Point} from '../../../json-crdt-extensions/peritext/rga/Point';
import type {Log} from '../../../json-crdt/log/Log';
import type {Rect, UiLifeCycles} from '../types';
import type {Inline, Peritext} from '../../../json-crdt-extensions';
import type {Range} from '../../../json-crdt-extensions/peritext/rga/Range';
import type {PeritextEventTarget} from '../../../json-crdt-extensions/peritext/events/PeritextEventTarget';
import type {PeritextUiApi} from '../../../json-crdt-extensions/peritext/events/defaults/ui/types';
import type {PeritextEventDefaults} from '../../../json-crdt-extensions/peritext/events/defaults/PeritextEventDefaults';

export class DomController implements UiLifeCycles, Printable, PeritextUiApi {
  public readonly txt: Peritext;
  public readonly et: PeritextEventTarget;
  public readonly keys: KeyController;
  public readonly comp: CompositionController;
  public readonly input: InputController;
  public readonly cursor: CursorController;
  public readonly richText: RichTextController;
  public readonly annals: AnnalsController;

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
    public readonly events: PeritextEventDefaults,
    public readonly log: Log,
  ) {
    const {txt} = events;
    this.txt = txt;
    this.et = events.et;
    this.keys = new KeyController(this);
    this.comp = new CompositionController(this);
    this.input = new InputController(this);
    this.cursor = new CursorController(this);
    this.richText = new RichTextController(this);
    this.annals = new AnnalsController(this);
    const uiHandle = new UiHandle(txt, <PeritextUiApi>this);
    events.ui = uiHandle;
    events.undo = this.annals;
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
  public el!: HTMLElement;

  public start() {
    const {et, el} = this;
    (el as any).contentEditable = 'true';
    const style = el.style;
    style.setProperty('--jsonjoy-peritext-id', et.id + '');
    style.setProperty('--jsonjoy-peritext-editable', 'yes');
    const stopKeys = this.keys.start();
    const stopComp = this.comp.start();
    const stopInput = this.input.start();
    const stopCursor = this.cursor.start();
    const stopRichText = this.richText.start();
    const stopAnnals = this.annals.start();
    return () => {
      (el as any).contentEditable = 'false';
      stopKeys();
      stopComp();
      stopInput();
      stopCursor();
      stopRichText();
      stopAnnals();
    };
  }

  /** ------------------------------------------------- {@link PeritextUiApi} */

  public focus(): void {
    this.el.focus();
  }

  protected getSpans(blockInnerId?: Point) {
    let el: Element | undefined;
    if (blockInnerId) {
      const txt = this.txt;
      const marker = txt.overlay.getOrNextLowerMarker(blockInnerId);
      const markerId = marker?.id ?? txt.str.id;
      el = this.blocks.get(markerId);
    }
    el ??= this.el;
    return el.querySelectorAll('.jsonjoy-peritext-inline');
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
    const length = spans.length;
    for (let i = 0; i < length; i++) {
      const span = spans[i] as HTMLSpanElement;
      const inline = (span as any)[ElementAttr.InlineOffset] as Inline | undefined;
      if (inline) {
        const contains = inline.contains(char);
        if (contains) return span;
      }
    }
    return;
  }

  public getCharRect(char: number | ITimestampStruct): Rect | undefined {
    const txt = this.events.txt;
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
      'DOM' +
      printTree(tab, [
        (tab) => 'blocks: ' + this.blocks.size(),
        (tab) => 'inlines: ' + this.inlines.size(),
        (tab) => this.cursor.toString(tab),
        (tab) => this.keys.toString(tab),
        (tab) => this.comp.toString(tab),
        (tab) => this.annals.toString(tab),
      ])
    );
  }
}
