import {printTree, type Printable} from 'tree-dump';
import {AvlMap} from "sonic-forest/lib/avl/AvlMap";
import {InputController} from './InputController';
import {CursorController} from './CursorController';
import {RichTextController} from './RichTextController';
import {KeyController} from './KeyController';
import {CompositionController} from './CompositionController';
import {AnnalsController} from './annals/AnnalsController';
import {ElementAttr} from '../constants';
import {Anchor} from '../../../json-crdt-extensions/peritext/rga/constants';
import {UiHandle} from '../../events/defaults/ui/UiHandle';
import {compare, type ITimestampStruct} from '../../../json-crdt-patch';
import type {Point} from '../../../json-crdt-extensions/peritext/rga/Point';
import type {PeritextEventDefaults} from '../../events/defaults/PeritextEventDefaults';
import type {PeritextEventTarget} from '../../events/PeritextEventTarget';
import type {Rect, UiLifeCycles} from '../types';
import type {Log} from '../../../json-crdt/log/Log';
import type {Inline, Peritext} from '../../../json-crdt-extensions';
import type {Range} from '../../../json-crdt-extensions/peritext/rga/Range';
import type {PeritextUiApi} from '../../events/defaults/ui/types';

export interface DomControllerOpts {
  source: HTMLElement;
  events: PeritextEventDefaults;
  log: Log;
}

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
  public readonly boundaries = new AvlMap<ITimestampStruct, Element>(compare);

  constructor(public readonly opts: DomControllerOpts) {
    const {source, events, log} = opts;
    const {txt} = events;
    this.txt = txt;
    const et = (this.et = opts.events.et);
    const keys = (this.keys = new KeyController({source}));
    const comp = (this.comp = new CompositionController({et, source, txt}));
    this.input = new InputController({et, source, txt, comp});
    this.cursor = new CursorController({et, source, txt, keys});
    this.richText = new RichTextController({et, source, txt});
    this.annals = new AnnalsController({et, txt, log});
    const uiHandle = new UiHandle(txt, <PeritextUiApi>this);
    events.ui = uiHandle;
    events.undo = this.annals;
  }

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public start() {
    const stopKeys = this.keys.start();
    const stopComp = this.comp.start();
    const stopInput = this.input.start();
    const stopCursor = this.cursor.start();
    const stopRichText = this.richText.start();
    const stopAnnals = this.annals.start();
    return () => {
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
    this.opts.source.focus();
  }

  protected getSpans(blockInnerId?: Point) {
    let el: Element | undefined;
    if (blockInnerId) {
      const txt = this.txt;
      const marker = txt.overlay.getOrNextLowerMarker(blockInnerId);
      const markerId = marker?.id ?? txt.str.id;
      el = this.boundaries.get(markerId);
    }
    el ??= this.opts.source;
    return el.querySelectorAll('.jsonjoy-peritext-inline');
  }

  protected findSpanContaining(range: Range): [span: HTMLSpanElement, inline: Inline] | undefined {
    const spans = this.getSpans(range.start);
    const length = spans.length;
    for (let i = 0; i < length; i++) {
      const span = spans[i] as HTMLSpanElement;
      const inline = (span as any)[ElementAttr.InlineOffset] as Inline | undefined;
      if (inline) {
        const contains = inline.contains(range);
        if (contains) return [span, inline];
      }
    }
    return;
  }

  public getCharRect(char: number | ITimestampStruct): Rect | undefined {
    const txt = this.opts.events.txt;
    const id = typeof char === 'number' ? txt.str.find(char) : char;
    if (!id) return;
    const start = txt.point(id, Anchor.Before);
    const end = txt.point(id, Anchor.After);
    const charRange = txt.range(start, end);
    const [span, inline] = this.findSpanContaining(charRange) || [];
    if (!span || !inline) return;
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
        (tab) => 'boundaries: ' + this.boundaries.toString(tab),
        (tab) => this.cursor.toString(tab),
        (tab) => this.keys.toString(tab),
        (tab) => this.comp.toString(tab),
        (tab) => this.annals.toString(tab),
      ])
    );
  }
}
