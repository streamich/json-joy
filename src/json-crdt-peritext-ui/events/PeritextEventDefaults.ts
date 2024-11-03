import type {Peritext} from '../../json-crdt-extensions/peritext';
import type {EditorSlices} from '../../json-crdt-extensions/peritext/editor/EditorSlices';
import {CursorAnchor} from '../../json-crdt-extensions/peritext/slice/constants';
import type {PeritextEventHandlerMap, PeritextEventTarget} from './PeritextEventTarget';
import type * as events from './types';

/**
 * Implementation of default handlers for Peritext events, such as "insert",
 * "delete", "cursor", etc. These implementations are used by the
 * {@link PeritextEventTarget} to provide default behavior for each event type.
 * If `event.preventDefault()` is called on a Peritext event, the default handler
 * will not be executed.
 */
export class PeritextEventDefaults implements PeritextEventHandlerMap {
  public constructor(
    protected readonly txt: Peritext,
    protected readonly et: PeritextEventTarget,
  ) {}

  public readonly change = (event: CustomEvent<events.ChangeDetail>) => {};

  public readonly insert = (event: CustomEvent<events.InsertDetail>) => {
    const text = event.detail.text;
    this.txt.editor.insert(text);
  };

  public readonly delete = (event: CustomEvent<events.DeleteDetail>) => {
    const {len = -1, unit = 'char', at} = event.detail;
    const editor = this.txt.editor;
    if (at !== undefined) {
      const point = editor.point(at);
      editor.cursor.set(point);
    }
    editor.delete(len, unit);
  };

  public readonly cursor = (event: CustomEvent<events.CursorDetail>) => {
    const {at, edge, len, unit} = event.detail;
    const txt = this.txt;
    const editor = txt.editor;

    // If `at` is specified, it represents the absolute position. We move the
    // cursor to that position, and leave only one active cursor. All other
    // are automatically removed when `editor.cursor` getter is accessed.
    if ((typeof at === 'number' && at >= 0) || typeof at === 'object') {
      const point = editor.point(at);
      switch (edge) {
        case 'focus':
        case 'anchor': {
          editor.cursor.setEndpoint(point, edge === 'focus' ? 0 : 1);
          break;
        }
        case 'new': {
          editor.addCursor(txt.range(point));
          break;
        }
        // both
        default: {
          // Select a range from the "at" position to the specified length.
          if (!!len && typeof len === 'number') {
            const point2 = editor.skip(point, len, unit ?? 'char');
            const range = txt.rangeFromPoints(point, point2); // Sorted range.
            editor.cursor.set(range.start, range.end, len < 0 ? CursorAnchor.End : CursorAnchor.Start);
          }
          // Set caret (a collapsed cursor) at the specified position.
          else {
            editor.cursor.set(point);
            if (unit) editor.select(unit);
          }
        }
      }
      return;
    }

    // If `edge` is specified.
    const isSpecificEdgeSelected = edge === 'focus' || edge === 'anchor';
    if (isSpecificEdgeSelected) {
      editor.move(len ?? 0, unit ?? 'char', edge === 'focus' ? 0 : 1, false);
      return;
    }

    // If `len` is specified.
    if (len) {
      const cursor = editor.cursor;
      if (cursor.isCollapsed()) editor.move(len, unit ?? 'char');
      else {
        if (len > 0) cursor.collapseToEnd();
        else cursor.collapseToStart();
      }
      return;
    }

    // If `unit` is specified.
    if (unit) {
      editor.select(unit);
      return;
    }
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
  };

  public readonly marker = (event: CustomEvent<events.MarkerDetail>) => {
    throw new Error('Not implemented');
  };
}
