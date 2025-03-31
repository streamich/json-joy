import {printTree, type Printable} from 'tree-dump';
import {InputController} from './InputController';
import {CursorController} from './CursorController';
import {RichTextController} from './RichTextController';
import {KeyController} from './KeyController';
import {CompositionController} from './CompositionController';
import {AnnalsController} from './annals/AnnalsController';
import {ElementAttr} from '../constants';
import {Anchor} from '../../json-crdt-extensions/peritext/rga/constants';
import type {ITimestampStruct} from '../../json-crdt-patch';
import type {PeritextEventDefaults} from '../events/defaults/PeritextEventDefaults';
import type {PeritextEventTarget} from '../events/PeritextEventTarget';
import type {Rect, UiLifeCycles} from '../dom/types';
import type {Log} from '../../json-crdt/log/Log';
import type {Inline} from '../../json-crdt-extensions';
import type {Range} from '../../json-crdt-extensions/peritext/rga/Range';
import type {PeritextUiApi} from '../events/defaults/ui/types';

export interface DomControllerOpts {
  source: HTMLElement;
  events: PeritextEventDefaults;
  log: Log;
}

export class DomController implements UiLifeCycles, Printable, PeritextUiApi {
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

  /** ------------------------------------------------- {@link PeritextUiApi} */

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
        (tab) => this.cursor.toString(tab),
        (tab) => this.keys.toString(tab),
        (tab) => this.comp.toString(tab),
        (tab) => this.annals.toString(tab),
      ])
    );
  }
}
