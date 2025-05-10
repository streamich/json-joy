import {getCursorPosition, unit} from '../util';
import {ElementAttr} from '../constants';
import {throttle} from '../../../util/throttle';
import {ValueSyncStore} from '../../../util/events/sync-store';
import type {Printable} from 'tree-dump';
import type {PeritextEventTarget} from '../../events/PeritextEventTarget';
import type {UiLifeCycles} from '../types';
import type {Inline} from '../../../json-crdt-extensions/peritext/block/Inline';
import type {DomController} from './DomController';

/**
 * Controller for handling text selection and cursor movements. Listens to
 * naive browser events and translates them into Peritext events.
 */
export class CursorController implements UiLifeCycles, Printable {
  public readonly caretId: string;

  private readonly _cursor: [fn: PeritextEventTarget['cursor'], stop: () => void];

  public constructor(public readonly dom: DomController) {
    const et = dom.et;
    this.caretId = 'jsonjoy.com-peritext-caret-' + et.id;
    this._cursor = throttle(et.cursor.bind(et), 25);
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
    const el = this.dom.el;
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

  private readonly onFocus = (ev: FocusEvent): void => {
    if (!this.dom.isEditable(ev.target as Element)) return;
    this.focus.next(true);
  };

  private readonly onBlur = (ev: FocusEvent): void => {
    if (!this.dom.isEditable(ev.target as Element)) return;
    this.focus.next(false);
  };

  private x = 0;
  private y = 0;
  public readonly mouseDown = new ValueSyncStore<boolean>(false);

  private readonly onMouseDown = (ev: MouseEvent): void => {
    if (!this.dom.isEditable(ev.target as Element)) return;
    if (!this.focus.value && this.dom.txt.editor.hasCursor()) return;
    const {clientX, clientY} = ev;
    this.x = clientX;
    this.y = clientY;
    const et = this.dom.et;
    switch (ev.detail) {
      case 1: {
        this.mouseDown.next(false);
        const at = this.posAtPoint(clientX, clientY);
        if (at === -1) return;
        this.selAnchor = at;
        const pressed = this.dom.keys.pressed;
        if (pressed.has('Shift')) {
          ev.preventDefault();
          et.move(
            [
              ['anchor', 'word', -1],
              ['focus', 'word', 1],
            ],
            [at],
          );
        } else if (pressed.has('Alt')) {
          ev.preventDefault();
          et.cursor({at: [at], add: true});
        } else {
          this.mouseDown.next(true);
          ev.preventDefault();
          et.cursor({at: [at]});
        }
        break;
      }
      case 2:
        this.mouseDown.next(false);
        ev.preventDefault();
        et.move([
          ['anchor', 'word', -1],
          ['focus', 'word', 1],
        ]);
        break;
      case 3:
        this.mouseDown.next(false);
        ev.preventDefault();
        et.move([
          ['start', 'word', -1],
          ['end', 'word', 1],
        ]);
        break;
      case 4:
        this.mouseDown.next(false);
        ev.preventDefault();
        et.move([
          ['start', 'line', -1],
          ['end', 'line', 1],
        ]);
        break;
      case 5:
        this.mouseDown.next(false);
        ev.preventDefault();
        et.move([
          ['start', 'block', -1],
          ['end', 'block', 1],
        ]);
        break;
      case 6:
        this.mouseDown.next(false);
        ev.preventDefault();
        et.move([
          ['start', 'all', -1],
          ['end', 'all', 1],
        ]);
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
    this._cursor[0]({move: [['focus', to]]});
  };

  private readonly onMouseUp = (ev: MouseEvent): void => {
    this.mouseDown.next(false);
  };

  private onKeyDown = (event: KeyboardEvent): void => {
    if (!this.dom.isEditable(event.target as Element)) return;
    const key = event.key;
    if (event.isComposing || key === 'Dead') return;
    const et = this.dom.et;
    switch (key) {
      case 'ArrowUp':
      case 'ArrowDown': {
        event.preventDefault();
        et.move('focus', 'vert', key === 'ArrowUp' ? -1 : 1, !event.shiftKey);
        break;
      }
      case 'ArrowLeft':
      case 'ArrowRight': {
        const direction = key === 'ArrowLeft' ? -1 : 1;
        event.preventDefault();
        if (event.metaKey) et.move('focus', 'line', direction, !event.shiftKey);
        else if (event.altKey && event.ctrlKey) et.move('focus', 'point', direction, !event.shiftKey);
        else if (event.altKey || event.ctrlKey) et.move('focus', 'word', direction, !event.shiftKey);
        else et.move('focus', unit(event) || 'char', direction, !event.shiftKey);
        break;
      }
      case 'Home':
      case 'End': {
        event.preventDefault();
        const direction = key === 'End' ? 1 : -1;
        et.move('focus', 'line', direction, !event.shiftKey);
        return;
      }
      case 'a':
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          et.cursor({at: [0, 0], move: [['end', 'all', 1]]});
          return;
        }
    }
  };

  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab?: string): string {
    return `cursor { focus: ${this.focus.value}, x: ${this.x}, y: ${this.y}, mouseDown: ${this.mouseDown.value} }`;
  }
}
