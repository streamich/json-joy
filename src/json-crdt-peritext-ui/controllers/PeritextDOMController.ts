import {getCursorPosition} from './util';
import {ElementAttr} from '../constants';
import {PeritextEventTarget} from '../events/PeritextEventTarget';
import {PeritextEventDefaults} from '../events/PeritextEventDefaults';
import {PeritextController} from './PeritextController';
import type {Rect, UiLifeCycles} from './types';
import type {Peritext} from '../../json-crdt-extensions/peritext';

export interface PeritextDOMControllerOptions {
  /**
   * Element to attach the controller to, this element will be used to listen to
   * "beforeinput" events and will be put into "contenteditable" mode.
   */
  el: HTMLElement;
  txt: Peritext;
  defaults?: UiLifeCycles;
  base: PeritextController;
  et: PeritextEventTarget;
}

export class PeritextDOMController implements UiLifeCycles {
  public static createWithDefaults(options: Omit<PeritextDOMControllerOptions, 'et' | 'base'>): PeritextDOMController {
    const et = new PeritextEventTarget();
    const defaults = new PeritextEventDefaults(options.txt, et);
    const base = new PeritextController({...options, et, source: options.el});
    const controller = new PeritextDOMController({...options, et, base, defaults});
    return controller;
  }

  protected isMouseDown: boolean = false;
  public readonly caretId: string;

  public constructor(public readonly opts: PeritextDOMControllerOptions) {
    this.caretId = 'jj-caret-' + opts.et.id;
  }

  protected selectionStart: number = -1;

  private select(ev: MouseEvent, len: number | 'word' | 'block' | 'all'): void {
    const at = this.posAtPoint(ev.clientX, ev.clientY);
    this.selectAt(ev, at, len);
  }

  private selectAt(ev: MouseEvent, at: number, len: number | 'word' | 'block' | 'all'): void {
    if (at === -1) return;
    ev.preventDefault();
    this.opts.et.cursor({at, len});
  }

  /**
   * String position at coordinate, or -1, if unknown.
   */
  protected posAtPoint(x: number, y: number): number {
    const res = getCursorPosition(x, y);
    if (res) {
      let node: null | (typeof res)[0] = res[0];
      const offset = res[1];
      for (let i = 0; i < 5 && node; i++) {
        const inlinePos = (<any>node)[ElementAttr.InlineOffset];
        if (typeof inlinePos === 'number') return inlinePos + offset;
        node = node.parentNode;
      }
    }
    return -1;
  }

  public caretRect(): Rect | undefined {
    const el = document.getElementById(this.caretId);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    return rect;
  }

  /**
   * Find text position at similar x coordinate on the next line.
   *
   * @param direction 1 for next line, -1 for previous line.
   * @returns The position at similar x coordinate on the next line, or
   *          undefined if not found.
   * 
   * @todo Implement similar functionality for finding soft line breaks (end
   *     and start of lines). Or use `.getClientRects()` trick with `Range`
   *     object, see: https://www.bennadel.com/blog/4310-detecting-rendered-line-breaks-in-a-text-node-in-javascript.htm
   */
  public getNextLinePos(direction: 1 | -1 = 1): number | undefined {
    const rect = this.caretRect();
    if (!rect) return;
    const {x, y, width, height} = rect;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const currentPos = this.opts.txt.editor.cursor.focus().viewPos();
    const caretPos = this.posAtPoint(x + halfWidth, y + halfHeight);
    if (currentPos !== caretPos) return;
    for (let i = 1; i < 8; i++) {
      const dy = i * direction * halfHeight;
      const pos = this.posAtPoint(x + halfWidth, y + halfHeight + dy);
      if (pos !== -1 && pos !== caretPos) {
        if (direction < 0) {
          if (pos < caretPos) return pos;
        } else if (pos > caretPos) return pos;
      }
    }
    return undefined;
  }

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public start(): void {
    this.opts.defaults?.start();
    this.opts.base.start();
    const el = this.opts.el;
    el.contentEditable = 'true';
    el.addEventListener('click', this.onClick);
    el.addEventListener('mousedown', this.onMouseDown);
    el.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  public stop(): void {
    this.opts.defaults?.stop();
    this.opts.base.stop();
    const el = this.opts.el;
    if (el) el.contentEditable = 'false';
    el.removeEventListener('click', this.onClick);
    el.removeEventListener('mousedown', this.onMouseDown);
    el.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  private readonly onClick = (ev: MouseEvent): void => {
    switch (ev.detail) {
      case 2:
        return this.select(ev, 'word');
      case 3:
        return this.select(ev, 'block');
      case 4:
        return this.select(ev, 'all');
    }
  };

  private readonly onMouseDown = (ev: MouseEvent): void => {
    this.isMouseDown = true;
    const at = this.posAtPoint(ev.clientX, ev.clientY);
    if (at === -1) return;
    this.selectionStart = at;
    this.select(ev, 0);
  };

  private readonly onMouseMove = (ev: MouseEvent): void => {
    if (!this.isMouseDown) return;
    const at = this.selectionStart;
    if (at < 0) return;
    const to = this.posAtPoint(ev.clientX, ev.clientY);
    if (to < 0) return;
    this.selectAt(ev, at, to - at);
  };

  private readonly onMouseUp = (ev: MouseEvent): void => {
    this.isMouseDown = false;
  };

  private onKeyDown = (event: KeyboardEvent): void => {
    const key = event.key;
    const et = this.opts.et;
    switch (key) {
      case 'ArrowUp':
      case 'ArrowDown': {
        event.preventDefault();
        const direction = key === 'ArrowUp' ? -1 : 1;
        const at = this.getNextLinePos(direction);
        if (at !== undefined) {
          if (event.shiftKey) {
            et.cursor({at, edge: 'focus'});
          } else {
            et.cursor({at});
          }
        }
        break;
      }
    }
  };
}
