import type {Peritext} from '../../json-crdt-extensions/peritext';
import type {EditorSlices} from '../../json-crdt-extensions/peritext/editor/EditorSlices';
import type {PeritextEventHandlerMap, PeritextEventTarget} from './PeritextEventTarget';
import type * as events from './types';

export class PeritextEventDefaults implements PeritextEventHandlerMap {
  public constructor(
    protected readonly txt: Peritext,
    protected readonly et: PeritextEventTarget,
  ) {}

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
    const {at, len, unit, edge} = event.detail;
    const txt = this.txt;
    const editor = txt.editor;
    if (at && at !== -1) {
      const point = editor.point(at);
      switch (edge) {
        case 'focus':
        case 'anchor': {
          editor.cursor.setEndpoint(point, edge === 'focus' ? 0 : 1);
          break;
        }
        case 'new': {
          editor.addCursor(txt.range(point, point.clone()));
          break;
        }
        default: {
          // both
          if (!!len && typeof len === 'number') {
            const point2 = point.clone();
            point2.step(len);
            const range = txt.rangeFromPoints(point, point2);
            editor.cursor.set(range.start, range.end);
          } else editor.cursor.set(point);
        }
      }
      this.et.change(event);
      return;
    }
    const numericLen = typeof len === 'number' ? len : 0;
    const isSpecificEdgeSelected = edge === 'focus' || edge === 'anchor';
    if (isSpecificEdgeSelected) editor.move(numericLen, unit ?? 'char', edge === 'focus' ? 0 : 1, false);
    else {
      const cursor = editor.cursor;
      if (cursor.isCollapsed()) editor.move(numericLen, unit ?? 'char');
      else {
        if (numericLen > 0) cursor.collapseToEnd();
        else cursor.collapseToStart();
      }
    }
    this.et.change(event);
  };

  public readonly inline = (event: CustomEvent<events.InlineDetail>) => {
    const {type, store = 'saved', behavior = 'overwrite', data, pos} = event.detail;
    const editor = this.txt.editor;
    const slices: EditorSlices = store === 'saved' ? editor.saved : store === 'extra' ? editor.extra : editor.local;
    switch (behavior) {
      case 'stack':
        slices.insStack(type, data);
        break;
      case 'erase':
        slices.insErase(type, data);
        break;
      default:
        slices.insOverwrite(type, data);
    }
    this.et.change(event);
  };

  public readonly marker = (event: CustomEvent<events.MarkerDetail>) => {
    throw new Error('Not implemented');
  };
}
