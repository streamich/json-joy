import type {Peritext} from '../../json-crdt-extensions/peritext';
import type {PeritextEventHandlerMap, PeritextEventTarget} from './PeritextEventTarget';
import type * as events from './types';

export class PeritextEventDefaults implements PeritextEventHandlerMap {
  public constructor(protected readonly txt: Peritext, protected readonly et: PeritextEventTarget) {}

  public readonly change = (event: CustomEvent<events.ChangeDetail>) => {
    // console.log('change', event?.type, event?.detail);
  };

  public readonly insert = (event: CustomEvent<events.InsertDetail>) => {
    if (event.defaultPrevented) return;
    const text = event.detail.text;
    this.txt.editor.insert(text);
    this.et.change(event);
  };

  public readonly delete = (event: CustomEvent<events.DeleteDetail>) => {
    if (event.defaultPrevented) return;
    const {direction = -1, unit = 'char'} = event.detail;
    this.txt.editor.delete(direction, unit);
    this.et.change(event);
  };

  public readonly cursor = (event: CustomEvent<events.CursorDetail>) => {
    const {at, len = 0, unit, edge} = event.detail;
    const txt = this.txt;
    const editor = txt.editor;
    const cursor = editor.cursor;
    const isAbsolutePosition = at !== -1 && at !== undefined;
    if (isAbsolutePosition) {
      switch (edge) {
        case 'focus': {
          const point = txt.pointAt(at);
          cursor.setEndpoint(point, 0);
          break;
        }
        default: {
          switch (len) {
            case 'word':
              editor.selectWord(at);
              break;
            case 'block':
              editor.selectBlock(at);
              break;
            case 'all':
              editor.selectAll();
              break;
            default:
              cursor.setAt(at, len);
          }
        }
      }
      this.et.change(event);
    } else {
      const numericLen = typeof len === 'number' ? len : 0;
      if (edge === 'focus' || edge === 'anchor') {
        // const point = (edge === 'focus' ? cursor.focus() : cursor.anchor()).clone();
        // switch (unit) {
        //   case 'line':
        //     point.eol(numericLen);
        //     break;
        //   case 'word':
        //     point.eow(numericLen);
        //     break;
        //   default:
        //     point.move(numericLen);
        // }
        // cursor.setEdge(point, edge === 'anchor' ? 1 : 0);
      } else {
        if (cursor.isCollapsed()) {
          switch (unit) {
            case 'line':
              // cursor.eol(numericLen);
              break;
            case 'word':
              // cursor.eow(numericLen);
              break;
            default:
              cursor.move(numericLen);
          }
        } else {
          if (numericLen > 0) cursor.collapseToEnd();
          else cursor.collapseToStart();
        }
      }
      this.et.change(event);
    }
  };

  public readonly marker = (event: CustomEvent<events.MarkerDetail>) => {
    throw new Error('Not implemented');
  };
}
