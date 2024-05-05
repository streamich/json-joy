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

export class Editor<T = string> {
  /**
   * Cursor is the the current user selection. It can be a caret or a
   * range. If range is collapsed to a single point, it is a caret.
   */
  public readonly cursor: Cursor<T>;

  constructor(public readonly txt: Peritext<T>) {
    const point = txt.pointAbsStart();
    const range = txt.range(point, point.clone());
    // TODO: Add ability to remove cursor.
    this.cursor = txt.localSlices.ins<Cursor<T>, typeof Cursor>(
      range,
      SliceBehavior.Cursor,
      CursorAnchor.Start,
      undefined,
      Cursor,
    );
  }

  /**
   * Insert inline text at current cursor position. If cursor selects a range,
   * the range is removed and the text is inserted at the start of the range.
   */
  public insert(text: string): void {
    this.cursor.insert(text);
  }

  /**
   * Deletes the previous character at current cursor position. If cursor
   * selects a range, deletes the whole range.
   */
  public delBwd(): void {
    this.cursor.delBwd();
  }

  public selectAll(): boolean {
    const range = this.txt.rangeAll();
    if (!range) return false;
    this.cursor.setRange(range);
    return true;
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
    this.cursor.collapse();
    const after = this.cursor.start.clone();
    after.refAfter();
    return this.txt.insMarker(after.id, type, data, Chars.BlockSplitSentinel);
  }
}
