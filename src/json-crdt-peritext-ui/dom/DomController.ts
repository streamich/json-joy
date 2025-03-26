import {printTree, type Printable} from 'tree-dump';
import {InputController} from './InputController';
import {CursorController} from './CursorController';
import {RichTextController} from './RichTextController';
import {KeyController} from './KeyController';
import {CompositionController} from './CompositionController';
import {AnnalsController} from './annals/AnnalsController';
import {ElementAttr} from '../constants';
import type {PeritextEventDefaults} from '../events/defaults/PeritextEventDefaults';
import type {PeritextEventTarget} from '../events/PeritextEventTarget';
import type {PeritextRenderingSurfaceApi, Rect, UiLifeCycles} from '../dom/types';
import type {Log} from '../../json-crdt/log/Log';
import type {Point} from '../../json-crdt-extensions/peritext/rga/Point';
import type {Inline} from '../../json-crdt-extensions';
import type {Range} from '../../json-crdt-extensions/peritext/rga/Range';

export interface DomControllerOpts {
  source: HTMLElement;
  events: PeritextEventDefaults;
  log: Log;
}

export class DomController implements UiLifeCycles, Printable, PeritextRenderingSurfaceApi {
  public readonly et: PeritextEventTarget;
  public readonly keys: KeyController;
  public readonly comp: CompositionController;
  public readonly input: InputController;
  public readonly cursor: CursorController;
  public readonly richText: RichTextController;
  public readonly annals: AnnalsController;

  constructor(public readonly opts: DomControllerOpts) {
    const {source, events, log} = opts;
    const {txt} = events;
    const et = (this.et = opts.events.et);
    const keys = (this.keys = new KeyController({source}));
    const comp = (this.comp = new CompositionController({et, source, txt}));
    this.input = new InputController({et, source, txt, comp});
    this.cursor = new CursorController({et, source, txt, keys});
    this.richText = new RichTextController({et, source, txt});
    this.annals = new AnnalsController({et, txt, log});
  }

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public start(): void {
    this.keys.start();
    this.comp.start();
    this.input.start();
    this.cursor.start();
    this.richText.start();
    this.annals.start();
  }

  public stop(): void {
    this.keys.stop();
    this.comp.stop();
    this.input.stop();
    this.cursor.stop();
    this.richText.stop();
    this.annals.stop();
  }

  /** ----------------------------------- {@link PeritextRenderingSurfaceApi} */

  public focus(): void {
    this.opts.source.focus();
  }

  protected getSpans() {
    return this.opts.source.querySelectorAll('.jsonjoy-peritext-inline');
  }

  protected findSpanContaining(range: Range): [span: HTMLSpanElement, inline: Inline] | undefined {
    const spans = this.getSpans();
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

  public getCharRect(pos: number | Point<string>, right = true): Rect | undefined {
    const txt = this.opts.events.txt;
    const point = typeof pos === 'number' ? txt.pointAt(pos) : pos;
    const char = right ? point.rightChar() : point.leftChar();
    if (!char) return;
    const charRange = txt.rangeFromChunkSlice(char);
    const [span, inline] = this.findSpanContaining(charRange) || [];
    if (!span || !inline) return;
    const textNode = span.firstChild as Text;
    if (!textNode) return;
    const range = document.createRange();
    range.selectNode(textNode);
    const offset = charRange.start.viewPos() - inline.start.viewPos();
    range.setStart(textNode, offset);
    range.setEnd(textNode, offset + 1);
    const rects = range.getClientRects();
    return rects[0];
  }

  public getLineEnd(pos: number | Point<string>, right = true): [point: Point, rect: Rect] | undefined {
    const txt = this.opts.events.txt;
    const startPoint = typeof pos === 'number' ? txt.pointAt(pos) : pos;
    const startRect = this.getCharRect(startPoint, right);
    if (!startRect) return;
    let curr = startPoint.clone();
    let currRect = startRect;
    while (true) {
      const next = curr.copy(p => p.step(right ? 1 : -1));
      if (!next) return [curr, currRect];
      const nextRect = this.getCharRect(next, right);
      if (!nextRect) return [curr, currRect];
      if (right ? nextRect.x < currRect.x : nextRect.x > currRect.x) return [curr, currRect];
      curr = next;
      currRect = nextRect;
    }
  }

  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab?: string): string {
    return (
      'DOM' +
      printTree(tab, [
        (tab) => this.cursor.toString(tab),
        (tab) => this.keys.toString(tab),
        (tab) => this.comp.toString(tab),
        (tab) => this.annals.toString(tab),
      ])
    );
  }
}
