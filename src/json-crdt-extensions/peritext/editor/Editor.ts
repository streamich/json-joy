import {Cursor} from './Cursor';
import {Anchor} from '../rga/constants';
import {CursorAnchor, SliceBehavior} from '../slice/constants';
import {tick, type ITimestampStruct} from '../../../json-crdt-patch/clock';
import {PersistedSlice} from '../slice/PersistedSlice';
import {Chars} from '../constants';
import type {Range} from '../rga/Range';
import type {Peritext} from '../Peritext';
import type {Point} from '../rga/Point';
import type {SliceType} from '../slice/types';
import type {MarkerSlice} from '../slice/MarkerSlice';
import type {Slices} from '../slice/Slices';

export class Editor<T = string> {
  /**
   * Cursor is the the current user selection. It can be a caret or a
   * range. If range is collapsed to a single point, it is a caret.
   */
  public readonly cursor: Cursor<T>;

  constructor(
    public readonly txt: Peritext<T>,
    slices: Slices<T>,
  ) {
    const point = txt.pointAbsStart();
    const range = txt.range(point, point.clone());
    // TODO: Add ability to remove cursor.
    this.cursor = slices.ins<Cursor<T>, typeof Cursor>(
      range,
      SliceBehavior.Cursor,
      CursorAnchor.Start,
      undefined,
      Cursor,
    );
  }

  /** @deprecated */
  public getCursorText(): string {
    return this.cursor.text();
  }

  /**
   * Ensures there is no range selection. If user has selected a range,
   * the contents is removed and the cursor is set at the start of the range as cursor.
   *
   * @todo If block boundaries are withing the range, remove the blocks.
   *
   * @returns Returns the cursor position after the operation.
   * 
   * @deprecated
   */
  public collapseSelection(): void {
    this.cursor.collapse();
  }

  /**
   * Insert inline text at current cursor position. If cursor selects a range,
   * the range is removed and the text is inserted at the start of the range.
   * 
   * @deprecated
   */
  public insert(text: string): void {
    this.cursor.insert(text);
  }

  /**
   * Deletes the previous character at current cursor position. If cursor
   * selects a range, deletes the whole range.
   * 
   * @deprecated
   */
  public delBwd(): void {
    this.cursor.delBwd();
  }

  // TODO: Use Point APIs instead
  /** @deprecated */
  public start(): Point<T> | undefined {
    const txt = this.txt;
    const str = txt.str;
    if (!str.length()) return;
    const firstChunk = str.first();
    if (!firstChunk) return;
    const firstId = firstChunk.id;
    const start = txt.point(firstId, Anchor.Before);
    return start;
  }

  // TODO: Use Point APIs instead
  /** @deprecated */
  public end(): Point<T> | undefined {
    const txt = this.txt;
    const str = txt.str;
    if (!str.length()) return;
    const lastChunk = str.last();
    if (!lastChunk) return;
    const lastId = lastChunk.span > 1 ? tick(lastChunk.id, lastChunk.span - 1) : lastChunk.id;
    const end = txt.point(lastId, Anchor.After);
    return end;
  }

  public all(): Range<T> | undefined {
    const start = this.start();
    const end = this.end();
    if (!start || !end) return;
    return this.txt.range(start, end);
  }

  public selectAll(): void {
    const range = this.all();
    if (range) this.cursor.setRange(range);
  }

  public insStackSlice(type: SliceType, data?: unknown | ITimestampStruct): PersistedSlice<T> {
    const range = this.cursor.range();
    return this.txt.savedSlices.ins(range, SliceBehavior.Stack, type, data);
  }

  public insOverwriteSlice(type: SliceType, data?: unknown | ITimestampStruct): PersistedSlice<T> {
    const range = this.cursor.range();
    return this.txt.savedSlices.ins(range, SliceBehavior.Overwrite, type, data);
  }

  public insEraseSlice(type: SliceType, data?: unknown | ITimestampStruct): PersistedSlice<T> {
    const range = this.cursor.range();
    return this.txt.savedSlices.ins(range, SliceBehavior.Erase, type, data);
  }

  public insMarker(type: SliceType, data?: unknown): MarkerSlice<T> {
    this.collapseSelection();
    const after = this.cursor.start.clone();
    after.refAfter();
    return this.txt.insMarker(after.id, type, data, Chars.BlockSplitSentinel);
  }
}
