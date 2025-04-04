import {getCursorPosition, unit} from '../util';
import {ElementAttr} from '../constants';
import {throttle} from '../../../util/throttle';
import {ValueSyncStore} from '../../../util/events/sync-store';
import type {Printable} from 'tree-dump';
import type {KeyController} from './KeyController';
import type {PeritextEventTarget} from '../../events/PeritextEventTarget';
import type {UiLifeCycles} from '../types';
import type {Peritext} from '../../../json-crdt-extensions/peritext';
import type {Inline} from '../../../json-crdt-extensions/peritext/block/Inline';

export interface CursorControllerOpts {
  /**
   * Element to attach the controller to, this element will be used to listen to
   * "beforeinput" events and will be put into "contenteditable" mode.
   */
  source: HTMLElement;
  txt: Peritext;
  et: PeritextEventTarget;
  keys: KeyController;
}

/**
 * Controller for handling text selection and cursor movements. Listens to
 * naive browser events and translates them into Peritext events.
 */
export class CursorController implements UiLifeCycles, Printable {
  public readonly caretId: string;

  private readonly _cursor: [fn: PeritextEventTarget['cursor'], stop: () => void];

  public constructor(public readonly opts: CursorControllerOpts) {
    this.caretId = 'jsonjoy.com-peritext-caret-' + opts.et.id;
    this._cursor = throttle(opts.et.cursor.bind(opts.et), 25);
  }

  /** The position where user started to scrub the text. */
  protected selAnchor: number = -1;

  /**
   * String position at coordinate, or -1, if unknown.
   */
  protected posAtPoint(x: number, y: number): number {
    const res = getCursorPosition(x, y);
    if (res) {
      let node: null | (typeof res)[0] = res[0];
      const offset = res[1];
      for (let i = 0; i < 5 && node; i++) {
        const inline = (<any>node)[ElementAttr.InlineOffset] as Inline | undefined;
        const pos = inline?.pos?.();
        if (typeof pos === 'number') return pos + offset;
        node = node.parentNode;
      }
    }
    return -1;
  }

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public start() {
    const el = this.opts.source;
    el.addEventListener('mousedown', this.onMouseDown);
    el.addEventListener('keydown', this.onKeyDown);
    el.addEventListener('focus', this.onFocus);
    el.addEventListener('blur', this.onBlur);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    return () => {
      el.removeEventListener('mousedown', this.onMouseDown);
      el.removeEventListener('keydown', this.onKeyDown);
      el.removeEventListener('focus', this.onFocus);
      el.removeEventListener('blur', this.onBlur);
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
      this._cursor[1](); // Stop throttling loop.
    };
  }

  public readonly focus = new ValueSyncStore<boolean>(false);

  private readonly onFocus = (event: Event): void => {
    this.focus.next(true);
  };

  private readonly onBlur = (): void => {
    this.focus.next(false);
  };

  private x = 0;
  private y = 0;
  public readonly mouseDown = new ValueSyncStore<boolean>(false);

  private readonly onMouseDown = (ev: MouseEvent): void => {
    if (!this.focus.value && this.opts.txt.editor.hasCursor()) return;
    const {clientX, clientY} = ev;
    this.x = clientX;
    this.y = clientY;
    switch (ev.detail) {
      case 1: {
        this.mouseDown.next(false);
        const at = this.posAtPoint(clientX, clientY);
        if (at === -1) return;
        this.selAnchor = at;
        const pressed = this.opts.keys.pressed;
        const et = this.opts.et;
        if (pressed.has('Shift')) {
          ev.preventDefault();
          et.cursor({at, unit: 'word'});
        } else if (pressed.has('Alt')) {
          ev.preventDefault();
          et.cursor({at, edge: 'new'});
        } else {
          this.mouseDown.next(true);
          ev.preventDefault();
          et.cursor({at});
        }
        break;
      }
      case 2:
        this.mouseDown.next(false);
        ev.preventDefault();
        this.opts.et.cursor({unit: 'word'});
        break;
      case 3:
        this.mouseDown.next(false);
        ev.preventDefault();
        this.opts.et.cursor({unit: 'block'});
        break;
      case 4:
        this.mouseDown.next(false);
        ev.preventDefault();
        this.opts.et.cursor({unit: 'all'});
        break;
    }
  };

  private readonly onMouseMove = (ev: MouseEvent): void => {
    if (!this.mouseDown.value) return;
    const at = this.selAnchor;
    if (at < 0) return;
    const {clientX, clientY} = ev;
    const to = this.posAtPoint(clientX, clientY);
    if (to < 0) return;
    ev.preventDefault();
    const mouseHasNotMoved = clientX === this.x && clientY === this.y;
    if (mouseHasNotMoved) return;
    this.x = clientX;
    this.y = clientY;
    this._cursor[0]({at: to, edge: 'focus'});
  };

  private readonly onMouseUp = (ev: MouseEvent): void => {
    this.mouseDown.next(false);
  };

  private onKeyDown = (event: KeyboardEvent): void => {
    const key = event.key;
    if (event.isComposing || key === 'Dead') return;
    const et = this.opts.et;
    switch (key) {
      case 'ArrowUp':
      case 'ArrowDown': {
        event.preventDefault();
        const direction = key === 'ArrowUp' ? -1 : 1;
        et.move(direction, 'vert', event.shiftKey ? 'focus' : 'both');
        break;
      }
      case 'ArrowLeft':
      case 'ArrowRight': {
        const direction = key === 'ArrowLeft' ? -1 : 1;
        event.preventDefault();
        if (event.shiftKey) et.move(direction, unit(event) || 'char', 'focus');
        else if (event.metaKey) et.move(direction, 'line');
        else if (event.altKey && event.ctrlKey) et.move(direction, 'point');
        else if (event.altKey || event.ctrlKey) et.move(direction, 'word');
        else et.move(direction);
        break;
      }
      case 'Home':
      case 'End': {
        event.preventDefault();
        const direction = key === 'End' ? 1 : -1;
        const edge = event.shiftKey ? 'focus' : 'both';
        et.move(direction, 'line', edge);
        return;
      }
      case 'a':
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          et.cursor({unit: 'all'});
          return;
        }
    }
  };

  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab?: string): string {
    return `cursor { focus: ${this.focus.value}, x: ${this.x}, y: ${this.y}, mouseDown: ${this.mouseDown.value} }`;
  }
}
