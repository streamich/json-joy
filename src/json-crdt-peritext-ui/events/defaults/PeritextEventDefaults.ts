import {Anchor} from '../../../json-crdt-extensions/peritext/rga/constants';
import {placeCursor} from './annals';
import {Cursor} from '../../../json-crdt-extensions/peritext/editor/Cursor';
import {CursorAnchor, type Peritext} from '../../../json-crdt-extensions/peritext';
import type {Range} from '../../../json-crdt-extensions/peritext/rga/Range';
import type {PeritextDataTransfer} from '../../../json-crdt-extensions/peritext/transfer/PeritextDataTransfer';
import type {PeritextEventHandlerMap, PeritextEventTarget} from '../PeritextEventTarget';
import type {EditorSlices} from '../../../json-crdt-extensions/peritext/editor/EditorSlices';
import type * as events from '../types';
import type {PeritextClipboard, PeritextClipboardData} from '../clipboard/types';
import type {UndoCollector} from '../../types';
import type {UiHandle} from './ui/UiHandle';
import type {Point} from '../../../json-crdt-extensions/peritext/rga/Point';
import type {EditorUi} from '../../../json-crdt-extensions/peritext/editor/types';

const toText = (buf: Uint8Array) => new TextDecoder().decode(buf);

const getEdge = (start: Point, end: Point, anchor: CursorAnchor, edge: events.SelectionMoveInstruction[0]): Point =>
  edge === 'start'
    ? start
    : edge === 'end'
      ? end
      : edge === 'focus'
        ? anchor === CursorAnchor.Start ? end : start
        : anchor === CursorAnchor.Start ? start : end;

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

  protected getSelSet({at}: events.SelectionDetailPart): events.SelectionSet {
    const {editor} = this.txt;
    return at ? [editor.sel2range(at)] : editor.cursors();
  }

  protected moveSelSet(set: events.SelectionSet, {move}: events.SelectionMoveDetailPart): void {
    if (!move) return;
    const {txt, editorUi} = this;
    for (const selection of set) {
      let start = selection.start;
      let end = selection.end;
      let anchor: CursorAnchor = selection instanceof Cursor ? selection.anchorSide : CursorAnchor.End;
      for (const [edge, to, len, collapse] of move) {
        const point = getEdge(start, end, anchor, edge);
        const point2 = typeof to === 'string'
          ? (len ? txt.editor.skip(point, len, to ?? 'char', editorUi) : point.clone())
          : txt.editor.pos2point(to);
        if (point === start) start = point2; else end = point2;
        if (collapse) {
          if (to !== 'point') point2.refAfter();
          if (point === start) end = point2.clone(); else start = point2.clone();
        }
      }
      if (start.cmpSpatial(end) > 0) {
        const tmp = start;
        start = end;
        end = tmp;
        anchor = anchor === CursorAnchor.Start ? CursorAnchor.End : CursorAnchor.Start;
      }
      if (selection instanceof Cursor) selection.set(start, end, anchor);
      else selection.set(start, end);
    }
  }

  public readonly change = (event: CustomEvent<events.ChangeDetail>) => {};

  public readonly insert = ({detail}: CustomEvent<events.InsertDetail>) => {
    const {move, text} = detail;
    const set = [...this.getSelSet(detail)];
    if (move) this.moveSelSet(set, detail);
    this.txt.editor.insert(text, set);
    this.undo?.capture();
  };

  public readonly delete = ({detail}: CustomEvent<events.DeleteDetail>) => {
    const {move} = detail;
    const set = [...this.getSelSet(detail)];
    const editor = this.txt.editor;
    let deleted: boolean = false;
    for (const range of set) {
      if (range.length()) {
        deleted = true;
        editor.delRange(range);
        const start = range.start;
        start.refAfter();
        range.set(start);
      }
    }
    if (deleted) {
      this.undo?.capture();
      return;
    }
    if (move) this.moveSelSet(set, detail);
    for (const range of set) {
      editor.delRange(range);
      range.collapseToStart();
      const start = range.start;
      start.refAfter();
      range.set(start);
    }
    this.undo?.capture();
  };

  public readonly cursor = ({detail}: CustomEvent<events.CursorDetail>) => {
    const {at, move, add} = detail;
    const set = this.getSelSet(detail);
    if (move) this.moveSelSet(set, detail);
    if (at) {
      const {editor} = this.txt;
      if (add) {
        for (const range of set) {
          editor.addCursor(range);
          break;
        }
      } else {
        for (const range of set) {
          editor.cursor.setRange(range);
          break;
        }
      }
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
    if (detail.unit) {
      const p1 = editor.pos2point(detail.unit[0]);
      const p2 = editor.pos2point(detail.unit[1]);
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
              case 'html':
                text = transfer.toHtml(range);
                break;
              case 'hast':
                text = JSON.stringify(transfer.toHast(range), null, 2);
                break;
              case 'jsonml':
                text = JSON.stringify(transfer.toJson(range), null, 2);
                break;
              case 'json':
                text = JSON.stringify(transfer.toView(range), null, 2);
                break;
              case 'mdast':
                text = JSON.stringify(transfer.toMdast(range), null, 2);
                break;
              case 'md':
                text = transfer.toMarkdown(range);
                break;
              case 'fragment':
                text = transfer.toFragment(range) + '';
                break;
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
            // if (inserted) this.et.move(inserted, 'char');
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
            // if (inserted) this.et.move([['both', 'char', inserted]]);
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
