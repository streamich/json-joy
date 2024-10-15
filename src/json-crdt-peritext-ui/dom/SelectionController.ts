import {getCursorPosition} from './util';
import {ElementAttr} from '../constants';
import type {PeritextEventTarget} from '../events/PeritextEventTarget';
import type {Rect, UiLifeCycles} from './types';
import type {Peritext} from '../../json-crdt-extensions/peritext';
import {throttle} from '../../util/throttle';

export interface SelectionControllerOpts {
  /**
   * Element to attach the controller to, this element will be used to listen to
   * "beforeinput" events and will be put into "contenteditable" mode.
   */
  source: HTMLElement;
  txt: Peritext;
  et: PeritextEventTarget;
}

/**
 * Controller for handling text selection and cursor movements. Listens to
 * naive browser events and translates them into Peritext events.
 */
export class SelectionController implements UiLifeCycles {
  protected isMouseDown: boolean = false;
  public readonly caretId: string;

  public constructor(public readonly opts: SelectionControllerOpts) {
    this.caretId = 'jsonjoy.com-peritext-caret-' + opts.et.id;
  }

  protected selectionStart: number = -1;

  private select(ev: MouseEvent, len: number | 'word' | 'block' | 'all'): void {
    const at = this.posAtPoint(ev.clientX, ev.clientY);
    this.selectAt(ev, at, len);
  }

  private readonly _cursor = throttle(this.opts.et.cursor.bind(this.opts.et), 25);

  private readonly selectAt = (ev: MouseEvent, at: number, len: number | 'word' | 'block' | 'all'): void => {
    if (at === -1) return;
    ev.preventDefault();
    this._cursor[0]({at, len});
  };

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
    const el = this.opts.source;
    el.contentEditable = 'true';
    el.addEventListener('mousedown', this.onMouseDown);
    el.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  public stop(): void {
    const el = this.opts.source;
    if (el) el.contentEditable = 'false';
    el.removeEventListener('mousedown', this.onMouseDown);
    el.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    this._cursor[1]();
  }

  private readonly onMouseDown = (ev: MouseEvent): void => {
    switch (ev.detail) {
      case 1: {
        this.isMouseDown = true;
        const at = this.posAtPoint(ev.clientX, ev.clientY);
        if (at === -1) return;
        this.selectionStart = at;
        this.select(ev, 0);
        break;
      }
      case 2:
        this.isMouseDown = false;
        return this.select(ev, 'word');
      case 3:
        this.isMouseDown = false;
        return this.select(ev, 'block');
      case 4:
        this.isMouseDown = false;
        return this.select(ev, 'all');
    }
  };

  private readonly onMouseMove = (ev: MouseEvent): void => {
    if (!this.isMouseDown) return;
    const at = this.selectionStart;
    if (at < 0) return;
    const to = this.posAtPoint(ev.clientX, ev.clientY);
    if (to < 0) return;
    ev.preventDefault();
    this._cursor[0]({at: to, edge: 'focus'});
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
