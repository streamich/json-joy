import {Cursor} from './Cursor';
import {CursorAnchor, SliceBehavior} from '../slice/constants';
import {PersistedSlice} from '../slice/PersistedSlice';
import {EditorSlices} from './EditorSlices';
import {Chars} from '../constants';
import type {ITimestampStruct} from '../../../json-crdt-patch/clock';
import type {Peritext} from '../Peritext';
import type {SliceType} from '../slice/types';
import type {MarkerSlice} from '../slice/MarkerSlice';

export class Editor<T = string> {
  public readonly saved: EditorSlices<T>;

  constructor(public readonly txt: Peritext<T>) {
    this.saved = new EditorSlices(txt, txt.savedSlices);
  }

  public firstCursor(): Cursor<T> | undefined {
    const iterator = this.txt.localSlices.iterator0();
    let cursor = iterator();
    while (cursor) {
      if (cursor instanceof Cursor) return cursor;
      cursor = iterator();
    }
    return;
  }

  /**
   * Returns the first cursor in the text. If there is no cursor, creates one
   * and inserts it at the start of the text. To work with multiple cursors, use
   * `.cursors()` method.
   *
   * Cursor is the the current user selection. It can be a caret or a range. If
   * range is collapsed to a single point, it is a *caret*.
   */
  public get cursor(): Cursor<T> {
    const maybeCursor = this.firstCursor();
    if (maybeCursor) return maybeCursor;
    const txt = this.txt;
    const cursor = txt.localSlices.ins<Cursor<T>, typeof Cursor>(
      txt.rangeAt(0),
      SliceBehavior.Cursor,
      CursorAnchor.Start,
      undefined,
      Cursor,
    );
    return cursor;
  }

  public cursors(callback: (cursor: Cursor<T>) => void): void {
    this.txt.localSlices.forEach((slice) => {
      if (slice instanceof Cursor) callback(slice);
    });
  }

  /**
   * Insert inline text at current cursor position. If cursor selects a range,
   * the range is removed and the text is inserted at the start of the range.
   */
  public insert(text: string): void {
    this.cursors((cursor) => cursor.insert(text));
  }

  /**
   * Deletes the previous character at current cursor position. If cursor
   * selects a range, deletes the whole range.
   */
  public delBwd(): void {
    this.cursors((cursor) => cursor.delBwd());
  }

  /** @todo Add main impl details of this to `Cursor`, but here ensure there is only one cursor. */
  public selectAll(): boolean {
    const range = this.txt.rangeAll();
    if (!range) return false;
    this.cursor.setRange(range);
    return true;
  }

  /** @deprecated use `.saved.insStack` */
  public insStackSlice(type: SliceType, data?: unknown | ITimestampStruct): PersistedSlice<T> {
    const range = this.cursor.range();
    return this.txt.savedSlices.ins(range, SliceBehavior.Stack, type, data);
  }

  /** @deprecated use `.saved.insOverwrite` */
  public insOverwriteSlice(type: SliceType, data?: unknown | ITimestampStruct): PersistedSlice<T> {
    const range = this.cursor.range();
    return this.txt.savedSlices.ins(range, SliceBehavior.Overwrite, type, data);
  }

  /** @deprecated use `.saved.insErase` */
  public insEraseSlice(type: SliceType, data?: unknown | ITimestampStruct): PersistedSlice<T> {
    const range = this.cursor.range();
    return this.txt.savedSlices.ins(range, SliceBehavior.Erase, type, data);
  }

  /** @deprecated use `.saved.insMarker` */
  public insMarker(type: SliceType, data?: unknown): MarkerSlice<T> {
    return this.saved.insMarker(type, data, Chars.BlockSplitSentinel)[0];
  }
}
