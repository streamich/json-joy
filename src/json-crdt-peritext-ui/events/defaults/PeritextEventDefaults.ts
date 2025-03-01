import {CursorAnchor} from '../../../json-crdt-extensions/peritext/slice/constants';
import {toBase64} from '@jsonjoy.com/base64/lib/toBase64';
import type {Range} from '../../../json-crdt-extensions/peritext/rga/Range';
import type {PeritextDataTransfer} from '../../../json-crdt-extensions/peritext/PeritextDataTransfer';
import type {PeritextEventHandlerMap, PeritextEventTarget} from '../PeritextEventTarget';
import type {Peritext} from '../../../json-crdt-extensions/peritext';
import type {EditorSlices} from '../../../json-crdt-extensions/peritext/editor/EditorSlices';
import type * as events from '../types';
import type {PeritextClipboard} from '../clipboard/types';

const base64Str = (str: string) => toBase64(new TextEncoder().encode(str));

export interface PeritextEventDefaultsOpts {
  clipboard?: PeritextClipboard;
  transfer?: PeritextDataTransfer;
}

/**
 * Implementation of default handlers for Peritext events, such as "insert",
 * "delete", "cursor", etc. These implementations are used by the
 * {@link PeritextEventTarget} to provide default behavior for each event type.
 * If `event.preventDefault()` is called on a Peritext event, the default handler
 * will not be executed.
 */
export class PeritextEventDefaults implements PeritextEventHandlerMap {
  public constructor(
    public readonly txt: Peritext,
    public readonly et: PeritextEventTarget,
    public readonly opts: PeritextEventDefaultsOpts = {},
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
          const cursor = editor.cursor;
          cursor.setEndpoint(point, edge === 'focus' ? 0 : 1);
          if (cursor.isCollapsed()) {
            const start = cursor.start;
            start.refAfter();
            cursor.set(start);
          }
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
            point.refAfter();
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

  public readonly format = (event: CustomEvent<events.FormatDetail>) => {
    const {type, store = 'saved', behavior = 'one', data} = event.detail;
    const editor = this.txt.editor;
    const slices: EditorSlices = store === 'saved' ? editor.saved : store === 'extra' ? editor.extra : editor.local;
    switch (behavior) {
      case 'many': {
        if (type === undefined) throw new Error('TYPE_REQUIRED');
        slices.insStack(type, data);
        break;
      }
      case 'one': {
        if (type === undefined) throw new Error('TYPE_REQUIRED');
        editor.toggleExclFmt(type, data, slices);
        break;
      }
      case 'erase': {
        if (type === undefined) editor.eraseFormatting(slices);
        else slices.insErase(type, data);
        break;
      }
      case 'clear': {
        editor.clearFormatting(slices);
        break;
      }
    }
  };

  public readonly marker = (event: CustomEvent<events.MarkerDetail>) => {
    const {action, type, data} = event.detail;
    switch (action) {
      case 'ins': {
        this.txt.editor.split(type, data);
        break;
      }
      case 'tog': {
        const marker = this.txt.overlay.getOrNextLowerMarker(this.txt.editor.cursor.start);
        if (marker) {
          marker.marker.update({type});
        }
        console.log('togggling..', marker);
        break;
      }
    }
  };

  public readonly buffer = async (event: CustomEvent<events.BufferDetail>) => {
    const opts = this.opts;
    const clipboard = opts.clipboard;
    if (!clipboard) return;
    const detail = event.detail;
    const {action, format} = detail;
    let range: undefined | Range<any>;
    const txt = this.txt;
    const editor = txt.editor;
    if (detail.range) {
      const p1 = editor.point(detail.range[0]);
      const p2 = editor.point(detail.range[1]);
      range = txt.rangeFromPoints(p1, p2);
    } else {
      range = editor.getCursor();
      if (!range) range = txt.rangeAll();
    }
    if (!range) return;
    switch (action) {
      case 'cut':
      case 'copy': {
        switch (format) {
          case 'text': {
            const text = range.text();
            clipboard.writeText(text)?.catch((err) => console.error(err));
            if (action === 'cut') editor.collapseCursors();
            break;
          }
          case 'html':
          case 'hast':
          case 'json':
          case 'jsonml':
          case 'mdast':
          case 'mdast':
          case 'md':
          case 'fragment': {
            const transfer = opts.transfer;
            if (!transfer) return;
            let text = '';
            switch (format) {
              case 'html': {
                text = transfer.toHtml(range);
                break;
              }
              case 'hast': {
                text = JSON.stringify(transfer.toHast(range), null, 2);
                break;
              }
              case 'jsonml': {
                text = JSON.stringify(transfer.toJson(range), null, 2);
                break;
              }
              case 'json': {
                text = JSON.stringify(transfer.toView(range), null, 2);
                break;
              }
              case 'mdast': {
                text = JSON.stringify(transfer.toMdast(range), null, 2);
                break;
              }
              case 'md': {
                text = transfer.toMarkdown(range);
                break;
              }
              case 'fragment': {
                text = transfer.toFragment(range) + '';
                break;
              }
            }
            clipboard.writeText(text)?.catch((err) => console.error(err));
            if (action === 'cut') editor.collapseCursors();
            break;
          }
          default: { // `auto'
            try {
              const pojo = editor.export(range);
              const json = JSON.stringify(pojo);
              const jsonBase64 = base64Str(json);
              const text = pojo[0] as string;
              const html = `<div data-application-json="${jsonBase64}">${text}</div>`;
              const data = {
                'text/plain': text,
                'text/html': html,
                'application/json': json,
              };
              // Collapse cursor before the async clipboard operation, so when
              // "change" event is dispatched, re-render happens and the cursor
              // is already collapsed.
              if (action === 'cut') editor.collapseCursors();
              await clipboard.write(data);
            } catch (error) {
              console.error(error);
            }
          }
        }
        break;
      }
    }
  };
}
