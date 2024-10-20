import {Cursor} from './Cursor';
import {CursorAnchor, SliceBehavior} from '../slice/constants';
import {PersistedSlice} from '../slice/PersistedSlice';
import {EditorSlices} from './EditorSlices';
import {Chars} from '../constants';
import {ChunkSlice} from '../util/ChunkSlice';
import {isLetter} from './util';
import {Anchor} from '../rga/constants';
import type {ITimestampStruct} from '../../../json-crdt-patch/clock';
import type {Peritext} from '../Peritext';
import type {SliceType} from '../slice/types';
import type {MarkerSlice} from '../slice/MarkerSlice';
import type {Point} from '../rga/Point';
import type {Range} from '../rga/Range';
import type {CharIterator, CharPredicate} from './types';
import type {UndefIterator} from '../../../util/iterator';

export class Editor<T = string> {
  public readonly saved: EditorSlices<T>;
  public readonly extra: EditorSlices<T>;
  public readonly local: EditorSlices<T>;

  constructor(public readonly txt: Peritext<T>) {
    this.saved = new EditorSlices(txt, txt.savedSlices);
    this.extra = new EditorSlices(txt, txt.extraSlices);
    this.local = new EditorSlices(txt, txt.localSlices);
  }

  // ------------------------------------------------------------------ cursors

  public addCursor(range: Range<T>, anchor: CursorAnchor = CursorAnchor.Start): Cursor<T> {
    const cursor = this.txt.localSlices.ins<Cursor<T>, typeof Cursor>(
      range,
      SliceBehavior.Cursor,
      anchor,
      undefined,
      Cursor,
    );
    return cursor;
  }

  /**
   * Returns the first cursor in the text and removes all other cursors. If
   * there is no cursor, creates one and inserts it at the start of the text.
   * To work with multiple cursors, use `.cursors()` method.
   *
   * Cursor is the the current user selection. It can be a caret or a range. If
   * range is collapsed to a single point, it is a *caret*.
   */
  public get cursor(): Cursor<T> {
    let cursor: Cursor<T> | undefined;
    for (let i: Cursor<T> | undefined, iterator = this.cursors0(); i = iterator();)
      if (!cursor) cursor = i; else this.local.del(i);
    return cursor ?? this.addCursor(this.txt.rangeAt(0));
  }

  public cursors0(): UndefIterator<Cursor<T>> {
    const iterator = this.txt.localSlices.iterator0();
    return () => {
      const slice = iterator();
      return slice instanceof Cursor ? slice : void 0;
    };
  }

  public cursors(callback: (cursor: Cursor<T>) => void): void {
    for (let cursor: Cursor<T> | undefined, iterator = this.cursors0(); cursor = iterator();) callback(cursor);
  }

  public delCursors(): void {
    for (let cursor: Cursor<T> | undefined, iterator = this.cursors0(); cursor = iterator();) this.local.del(cursor);
  }

  // ------------------------------------------------------------- text editing

  /**
   * Insert inline text at current cursor position. If cursor selects a range,
   * the range is removed and the text is inserted at the start of the range.
   */
  public insert(text: string): void {
    let cnt = 0;
    this.cursors((cursor) => {
      cnt++;
      cursor.insert(text);
    });
    if (!cnt) this.cursor.insert(text);
  }

  /**
   * Deletes the previous character at current cursor position. If cursor
   * selects a range, deletes the whole range.
   */
  public delBwd(): void {
    this.cursors((cursor) => cursor.delBwd());
  }

  // ------------------------------------------------------------------ various

  /** @todo Add main impl details of this to `Cursor`, but here ensure there is only one cursor. */
  public selectAll(): boolean {
    const range = this.txt.rangeAll();
    if (!range) return false;
    this.cursor.setRange(range);
    return true;
  }

  /**
   * Returns an iterator through visible text, one `step` characters at a time,
   * starting from a given {@link Point}.
   *
   * @param start The starting point.
   * @param step Number of visible characters to skip.
   * @returns The next visible character iterator.
   */
  public walk(start: Point<T>, step: number = 1): CharIterator<T> {
    let point: Point<T> | undefined = start.clone();
    return () => {
      if (!point) return;
      const char = step > 0 ? point.rightChar() : point.leftChar();
      if (!char) return (point = undefined);
      const end = point.step(step);
      if (end) point = undefined;
      return char;
    };
  }

  /**
   * Returns a forward iterator through visible text, one character at a time,
   * starting from a given {@link Point}.
   *
   * @param start The starting point.
   * @param chunk Chunk to start from.
   * @returns The next visible character iterator.
   */
  public fwd(start: Point<T>): CharIterator<T> {
    return this.walk(start, 1);
  }

  /**
   * Returns a backward iterator through visible text, one character at a time,
   * starting from a given {@link Point}.
   *
   * @param start The starting point.
   * @param chunk Chunk to start from.
   * @returns The previous visible character iterator.
   */
  public bwd(start: Point<T>): CharIterator<T> {
    return this.walk(start, -1);
  }

  /**
   * Skips a word in an arbitrary direction. A word is defined by the `predicate`
   * function, which returns `true` if the character is part of the word.
   *
   * @param iterator Character iterator.
   * @param predicate Predicate function to match characters, returns `true` if
   *     the character is part of the word.
   * @param firstLetterFound Whether the first letter has already been found. If
   *     not, will skip any characters until the first letter, which is matched
   *     by the `predicate` is found.
   * @returns Point after the last character skipped.
   */
  private skipWord(
    iterator: CharIterator<T>,
    predicate: CharPredicate<string>,
    firstLetterFound: boolean,
  ): Point<T> | undefined {
    let next: ChunkSlice<T> | undefined;
    let prev: ChunkSlice<T> | undefined;
    while ((next = iterator())) {
      const char = (next.view() as string)[0];
      if (firstLetterFound) {
        if (!predicate(char)) break;
      } else if (predicate(char)) firstLetterFound = true;
      prev = next;
    }
    if (!prev) return;
    return this.txt.point(prev.id(), Anchor.After);
  }

  /**
   * Skips a word forward. A word is defined by the `predicate` function, which
   * returns `true` if the character is part of the word.
   *
   * @param point Point from which to start skipping.
   * @param predicate Character class to skip.
   * @param firstLetterFound Whether the first letter has already been found. If
   *        not, will skip any characters until the first letter, which is
   *        matched by the `predicate` is found.
   * @returns Point after the last character skipped.
   */
  public fwdSkipWord(
    point: Point<T>,
    predicate: CharPredicate<string> = isLetter,
    firstLetterFound: boolean = false,
  ): Point<T> {
    return this.skipWord(this.fwd(point), predicate, firstLetterFound) || point;
  }

  /**
   * Skips a word backward. A word is defined by the `predicate` function, which
   * returns `true` if the character is part of the word.
   *
   * @param point Point from which to start skipping.
   * @param predicate Character class to skip.
   * @param firstLetterFound Whether the first letter has already been found. If
   *        not, will skip any characters until the first letter, which is
   *        matched by the `predicate` is found.
   * @returns Point after the last character skipped.
   */
  public bwdSkipWord(
    point: Point<T>,
    predicate: CharPredicate<string> = isLetter,
    firstLetterFound: boolean = false,
  ): Point<T> {
    const bwd = this.bwd(point);
    const endPoint = this.skipWord(bwd, predicate, firstLetterFound);
    if (endPoint) endPoint.anchor = Anchor.Before;
    return endPoint || point;
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
