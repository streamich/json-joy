import {CursorAnchor} from '../../../json-crdt-extensions/peritext/slice/constants';
import {Anchor} from '../../../json-crdt-extensions/peritext/rga/constants';
import {placeCursor} from './annals';
import type {Range} from '../../../json-crdt-extensions/peritext/rga/Range';
import type {PeritextDataTransfer} from '../../../json-crdt-extensions/peritext/transfer/PeritextDataTransfer';
import type {PeritextEventHandlerMap, PeritextEventTarget} from '../PeritextEventTarget';
import type {Peritext} from '../../../json-crdt-extensions/peritext';
import type {EditorSlices} from '../../../json-crdt-extensions/peritext/editor/EditorSlices';
import type * as events from '../types';
import type {PeritextClipboard, PeritextClipboardData} from '../clipboard/types';
import type {UndoCollector} from '../../types';
import type {UiHandle} from './ui/UiHandle';
import type {Point} from '../../../json-crdt-extensions/peritext/rga/Point';
import type {EditorUi} from '../../../json-crdt-extensions/peritext/editor/types';

const toText = (buf: Uint8Array) => new TextDecoder().decode(buf);

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
  public undo?: UndoCollector;
  public ui?: UiHandle;

  protected editorUi: EditorUi = {
    eol: (point: Point, steps: number): Point | undefined => {
      const ui = this.ui;
      if (!ui) return;
      const res = ui.getLineEnd(point, steps > 0);
      return res ? res[0] : void 0;
    },
    vert: (point: Point, steps: number): Point | undefined => {
      const ui = this.ui;
      if (!ui) return;
      const pos = ui.pointX(point);
      if (!pos) return;
      const currLine = ui.getLineInfo(point);
      if (!currLine) return;
      const x = pos[0];
      const iterations = Math.abs(steps);
      let nextPoint = point;
      for (let i = 0; i < iterations; i++) {
        const nextLine = steps > 0 ? ui.getNextLineInfo(currLine) : ui.getNextLineInfo(currLine, -1);
        if (!nextLine) break;
        nextPoint = ui.findPointAtX(x, nextLine);
        if (!nextPoint) break;
        if (point.anchor === Anchor.Before) nextPoint.refBefore();
        else nextPoint.refAfter();
      }
      return nextPoint;
    },
  };

  public constructor(
    public readonly txt: Peritext,
    public readonly et: PeritextEventTarget,
    public readonly opts: PeritextEventDefaultsOpts = {},
  ) {}

  public readonly change = (event: CustomEvent<events.ChangeDetail>) => {};

  public readonly insert = (event: CustomEvent<events.InsertDetail>) => {
    const text = event.detail.text;
    const editor = this.txt.editor;
    editor.insert(text);
    this.undo?.capture();
  };

  public readonly delete = (event: CustomEvent<events.DeleteDetail>) => {
    const {len = -1, unit = 'char', at} = event.detail;
    const editor = this.txt.editor;
    if (at !== undefined) {
      const point = editor.point(at);
      editor.cursor.set(point);
    }
    editor.delete(len, unit);
    this.undo?.capture();
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
            const point2 = editor.skip(point, len, unit ?? 'char', this.editorUi);
            const range = txt.rangeFromPoints(point, point2); // Sorted range.
            editor.cursor.set(range.start, range.end, len < 0 ? CursorAnchor.End : CursorAnchor.Start);
          }
          // Set caret (a collapsed cursor) at the specified position.
          else {
            point.refAfter();
            editor.cursor.set(point);
            if (unit) editor.select(unit, this.editorUi);
          }
        }
      }
      return;
    }

    // If `edge` is specified.
    const isSpecificEdgeSelected = edge === 'focus' || edge === 'anchor';
    if (isSpecificEdgeSelected) {
      editor.move(len ?? 0, unit ?? 'char', edge === 'focus' ? 0 : 1, false, this.editorUi);
      return;
    }

    // If `len` is specified.
    if (len) {
      const cursor = editor.cursor;
      if (cursor.isCollapsed()) editor.move(len, unit ?? 'char', void 0, void 0, this.editorUi);
      else {
        if (len > 0) cursor.collapseToEnd();
        else cursor.collapseToStart();
      }
      return;
    }

    // If `unit` is specified.
    if (unit) {
      editor.select(unit, this.editorUi);
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
    this.undo?.capture();
  };

  public readonly marker = (event: CustomEvent<events.MarkerDetail>) => {
    const {action, type, data} = event.detail;
    const editor = this.txt.editor;
    switch (action) {
      case 'ins': {
        editor.split(type, data);
        break;
      }
      case 'tog': {
        if (type === undefined) throw new Error('TYPE_REQUIRED');
        editor.tglMarker(type, data);
        break;
      }
      case 'upd': {
        if (type === undefined) throw new Error('TYPE_REQUIRED');
        editor.updMarker(type, data);
        break;
      }
      case 'del': {
        editor.delMarker();
        break;
      }
    }
    this.undo?.capture();
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
      range = editor.getCursor()?.range();
      if (!range) range = txt.rangeAll();
    }
    if (!range) return;
    switch (action) {
      case 'cut':
      case 'copy': {
        const copyStyle = () => {
          if (!range) return;
          if (range.length() < 1) {
            range.end.step(1);
            if (range.length() < 1) range.start.step(-1);
          }
          const data = opts.transfer?.toFormat?.(range);
          clipboard.write(data as unknown as PeritextClipboardData<string>)?.catch((err) => console.error(err));
        };
        switch (format) {
          case 'text': {
            const text = range.text();
            clipboard.writeText(text)?.catch((err) => console.error(err));
            if (action === 'cut') editor.collapseCursors();
            break;
          }
          case 'style': {
            copyStyle();
            break;
          }
          case 'html':
          case 'hast':
          case 'json':
          case 'jsonml':
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
          default: {
            // `auto'
            const transfer = opts.transfer;
            if (!transfer) return;
            if (range.length() < 1) {
              copyStyle();
            } else {
              const data = transfer.toClipboard(range);
              clipboard.write(data as unknown as PeritextClipboardData<string>)?.catch((err) => console.error(err));
              if (action === 'cut') editor.collapseCursors();
            }
          }
        }
        break;
      }
      case 'paste': {
        switch (format) {
          case 'text': {
            const data = await clipboard.read(['text/plain', 'text/html']);
            let buffer: Uint8Array | undefined;
            if ((buffer = data['text/plain'])) {
              const text = toText(buffer);
              this.et.insert(text);
            } else if ((buffer = data['text/html'])) {
              const html = toText(buffer);
              const text = opts.transfer?.textFromHtml?.(html) ?? html;
              this.et.insert(text);
            }
            break;
          }
          case 'style': {
            const transfer = opts.transfer;
            if (transfer) {
              const {html} = detail.data || (await clipboard.readData());
              if (html) {
                transfer.fromStyle(range, html);
                this.et.change();
              }
            }
            break;
          }
          case 'html':
          case 'hast':
          case 'json':
          case 'jsonml':
          case 'mdast':
          case 'md': {
            const data = detail.data;
            const transfer = opts.transfer;
            if (!transfer) return;
            let text: string = data?.text || '';
            if (!text) {
              const clipboardData = await clipboard.read(['text/plain']);
              const buffer = clipboardData['text/plain'];
              if (buffer) text = toText(buffer);
            }
            if (!range.isCollapsed()) editor.delRange(range);
            range.collapseToStart();
            const start = range.start;
            const pos = start.viewPos();
            let inserted: number = 0;
            switch (format) {
              case 'html': {
                inserted = transfer.fromHtml(pos, text);
                break;
              }
              case 'hast': {
                const json = JSON.parse(text);
                inserted = transfer.fromHast(pos, json);
                break;
              }
              case 'jsonml': {
                const json = JSON.parse(text);
                inserted = transfer.fromJson(pos, json);
                break;
              }
              case 'json': {
                const json = JSON.parse(text);
                inserted = transfer.fromView(pos, json);
                break;
              }
              case 'mdast': {
                const json = JSON.parse(text);
                inserted = transfer.fromMdast(pos, json);
                break;
              }
              case 'md': {
                inserted = transfer.fromMarkdown(pos, text);
                break;
              }
            }
            if (inserted) this.et.move(inserted, 'char');
            this.et.change();
            break;
          }
          default: {
            // 'auto'
            let data = detail.data;
            const transfer = opts.transfer;
            if (!transfer) {
              let text: string = data?.text || '';
              if (!text) {
                const clipboardData = await clipboard.read(['text/plain']);
                const buffer = clipboardData['text/plain'];
                if (buffer) text = toText(buffer);
              }
              if (text) this.et.insert(text);
              return;
            }
            if (!data) data = await clipboard.readData();
            const inserted = transfer.fromClipboard(range, data);
            if (inserted) this.et.move(inserted, 'char');
            this.et.change();
          }
        }
        break;
      }
    }
    this.undo?.capture();
  };

  public readonly annals = (event: CustomEvent<events.AnnalsDetail>) => {
    const {batch} = event.detail;
    this.txt.model.applyBatch(batch);
    const txt = this.txt;
    const cursor = placeCursor(txt, batch);
    if (cursor) txt.editor.cursor.setRange(cursor);
  };
}
