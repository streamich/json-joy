import {Cursor} from './Cursor';
import {CursorAnchor, SliceBehavior} from '../slice/constants';
import {EditorSlices} from './EditorSlices';
import {next, prev} from 'sonic-forest/lib/util';
import {isLetter, isPunctuation, isWhitespace} from './util';
import {Anchor} from '../rga/constants';
import {MarkerOverlayPoint} from '../overlay/MarkerOverlayPoint';
import {UndefEndIter, type UndefIterator} from '../../../util/iterator';
import type {SliceType} from '../slice';
import type {ChunkSlice} from '../util/ChunkSlice';
import type {Peritext} from '../Peritext';
import type {Point} from '../rga/Point';
import type {Range} from '../rga/Range';
import type {CharIterator, CharPredicate, Position, TextRangeUnit} from './types';

/**
   * For inline boolean ("Overwrite") slices, both range endpoints should be
   * attached to {@link Anchor.Before} as per the Peritext paper. This way, say
   * bold text, automatically extends to include the next character typed as
   * user types.
   *
   * @param range The range to be adjusted.
   */
const makeRangeExtendable = <T>(range: Range<T>): void => {
  if (range.end.anchor !== Anchor.Before || range.start.anchor !== Anchor.Before) {
    const start = range.start.clone();
    const end = range.end.clone();
    start.refBefore();
    end.refBefore();
    range.set(start, end);
  }
};

export class Editor<T = string> {
  public readonly saved: EditorSlices<T>;
  public readonly extra: EditorSlices<T>;
  public readonly local: EditorSlices<T>;

  constructor(public readonly txt: Peritext<T>) {
    this.saved = new EditorSlices(txt, txt.savedSlices);
    this.extra = new EditorSlices(txt, txt.extraSlices);
    this.local = new EditorSlices(txt, txt.localSlices);
  }

  public text(): string {
    return this.txt.strApi().view();
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
   * Cursor is the the current user selection. It can be a caret or a range. If
   * range is collapsed to a single point, it is a *caret*.
   *
   * Returns the first cursor in the text and removes all other cursors. If
   * there is no cursor, creates one and inserts it at the start of the text.
   * To work with multiple cursors, use `.cursors()` method.
   */
  public get cursor(): Cursor<T> {
    let cursor: Cursor<T> | undefined;
    for (let i: Cursor<T> | undefined, iterator = this.cursors0(); (i = iterator()); )
      if (!cursor) cursor = i;
      else this.local.del(i);
    return cursor ?? this.addCursor(this.txt.rangeAt(0));
  }

  public cursors0(): UndefIterator<Cursor<T>> {
    const iterator = this.txt.localSlices.iterator0();
    return () => {
      const slice = iterator();
      return slice instanceof Cursor ? slice : void 0;
    };
  }

  public cursors() {
    return new UndefEndIter(this.cursors0());
  }

  public forCursor(callback: (cursor: Cursor<T>) => void): void {
    for (let cursor: Cursor<T> | undefined, i = this.cursors0(); (cursor = i()); ) callback(cursor);
  }

  public cursorCount(): number {
    let cnt = 0;
    for (const i = this.cursors0(); i(); ) cnt++;
    return cnt;
  }

  public delCursor(cursor: Cursor<T>): void {
    this.local.del(cursor);
  }

  public delCursors(): void {
    for (let cursor: Cursor<T> | undefined, i = this.cursors0(); (cursor = i()); ) this.delCursor(cursor);
  }

  // ------------------------------------------------------------- text editing

  /**
   * Insert inline text at current cursor position. If cursor selects a range,
   * the range is removed and the text is inserted at the start of the range.
   */
  public insert(text: string): void {
    let cnt = 0;
    this.forCursor((cursor) => {
      cnt++;
      cursor.insert(text);
    });
    if (!cnt) this.cursor.insert(text);
  }

  /**
   * Deletes the previous character at current cursor positions. If cursors
   * select a range, deletes the whole range.
   */
  public del(step: number = -1): void {
    this.forCursor((cursor) => cursor.del(step));
  }

  /**
   * Deletes one or more units of text in all cursors. If cursor is a range,
   * deletes the whole range.
   *
   * @param step Number of units to delete.
   * @param unit A unit of deletion: "char", "word", "line".
   */
  public delete(step: number, unit: 'char' | 'word' | 'line'): void {
    this.forCursor((cursor) => {
      if (!cursor.isCollapsed()) {
        cursor.collapse();
        return;
      }
      let point1 = cursor.start.clone();
      let point2 = point1.clone();
      if (step > 0) point2 = this.skip(point2, step, unit);
      else if (step < 0) point1 = this.skip(point1, step, unit);
      else if (step === 0) {
        point1 = this.skip(point1, -1, unit);
        point2 = this.skip(point2, 1, unit);
      }
      const txt = this.txt;
      const range = txt.range(point1, point2);
      txt.delStr(range);
      point1.refAfter();
      cursor.set(point1);
    });
  }

  // ----------------------------------------------------------------- movement

  /**
   * Returns an iterator through visible text, one `step`, one character at a
   * time, starting from a given {@link Point}.
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
   * @returns Point after the last skipped character.
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
   * Hard skips line, skips to the next "\n" newline character.
   *
   * @param iterator Character iterator.
   * @returns Point after the last skipped character.
   */
  private skipLine(iterator: CharIterator<T>): Point<T> | undefined {
    let next: ChunkSlice<T> | undefined;
    let prev: ChunkSlice<T> | undefined;
    while ((next = iterator())) {
      const char = (next.view() as string)[0];
      if (char === '\n') break;
      prev = next;
    }
    if (!prev) return;
    return this.txt.point(prev.id(), Anchor.After);
  }

  /**
   * End of word iterator (eow). Skips a word forward. A word is defined by the
   * `predicate` function, which returns `true` if the character is part of the
   * word.
   *
   * @param point Point from which to start skipping.
   * @param predicate Character class to skip.
   * @param firstLetterFound Whether the first letter has already been found. If
   *        not, will skip any characters until the first letter, which is
   *        matched by the `predicate` is found.
   * @returns Point after the last character skipped.
   */
  public eow(
    point: Point<T>,
    predicate: CharPredicate<string> = isLetter,
    firstLetterFound: boolean = false,
  ): Point<T> {
    return this.skipWord(this.fwd(point), predicate, firstLetterFound) || point;
  }

  /**
   * Beginning of word iterator (bow). Skips a word backward. A word is defined
   * by the `predicate` function, which returns `true` if the character is part
   * of the word.
   *
   * @param point Point from which to start skipping.
   * @param predicate Character class to skip.
   * @param firstLetterFound Whether the first letter has already been found. If
   *        not, will skip any characters until the first letter, which is
   *        matched by the `predicate` is found.
   * @returns Point after the last character skipped.
   */
  public bow(
    point: Point<T>,
    predicate: CharPredicate<string> = isLetter,
    firstLetterFound: boolean = false,
  ): Point<T> {
    const bwd = this.bwd(point);
    const endPoint = this.skipWord(bwd, predicate, firstLetterFound);
    if (endPoint) endPoint.anchor = Anchor.Before;
    return endPoint || point;
  }

  /** Find end of line, starting from given point. */
  public eol(point: Point<T>): Point<T> {
    return this.skipLine(this.fwd(point)) || this.end();
  }

  /** Find beginning of line, starting from given point. */
  public bol(point: Point<T>): Point<T> {
    const bwd = this.bwd(point);
    const endPoint = this.skipLine(bwd);
    if (endPoint) endPoint.anchor = Anchor.Before;
    return endPoint || this.start();
  }

  /**
   * Find end of block, starting from given point. Overlay should be refreshed
   * before calling this method.
   */
  public eob(point: Point<T>): Point<T> {
    const txt = this.txt;
    const overlay = txt.overlay;
    point = point.clone();
    point.halfstep(1);
    if (point.isAbsEnd()) return point;
    let overlayPoint = overlay.getOrNextHigher(point);
    if (!overlayPoint) return this.end();
    if (point.cmp(overlayPoint) === 0) overlayPoint = next(overlayPoint);
    while (!(overlayPoint instanceof MarkerOverlayPoint) && overlayPoint) overlayPoint = next(overlayPoint);
    if (overlayPoint instanceof MarkerOverlayPoint) {
      const point = overlayPoint.clone();
      point.refAfter();
      return point;
    } else return this.end();
  }

  /**
   * Find beginning of block, starting from given point. Overlay should be
   * refreshed before calling this method.
   */
  public bob(point: Point<T>): Point<T> {
    const overlay = this.txt.overlay;
    point = point.clone();
    point.halfstep(-1);
    if (point.isAbsStart()) return point;
    let overlayPoint = overlay.getOrNextLower(point);
    if (!overlayPoint) return this.start();
    while (!(overlayPoint instanceof MarkerOverlayPoint) && overlayPoint) overlayPoint = prev(overlayPoint);
    if (overlayPoint instanceof MarkerOverlayPoint) {
      const point = overlayPoint.clone();
      point.refBefore();
      return point;
    } else return this.start();
  }

  /**
   * Move a point given number of steps in a specified direction. The unit of
   * one move step is defined by the `unit` parameter.
   *
   * @param point The point to start from.
   * @param steps Number of steps to move. Negative number moves backward.
   * @param unit The unit of move per step: "char", "word", "line", etc.
   * @returns The destination point after the move.
   */
  public skip(point: Point<T>, steps: number, unit: TextRangeUnit): Point<T> {
    if (!steps) return point;
    switch (unit) {
      case 'point': {
        const p = point.clone();
        return p.halfstep(steps), p;
      }
      case 'char': {
        const p = point.clone();
        return p.step(steps), p;
      }
      case 'word': {
        if (steps > 0) for (let i = 0; i < steps; i++) point = this.eow(point);
        else for (let i = 0; i < -steps; i++) point = this.bow(point);
        return point;
      }
      case 'line': {
        if (steps > 0) for (let i = 0; i < steps; i++) point = this.eol(point);
        else for (let i = 0; i < -steps; i++) point = this.bol(point);
        return point;
      }
      case 'block': {
        if (steps > 0) for (let i = 0; i < steps; i++) point = this.eob(point);
        else for (let i = 0; i < -steps; i++) point = this.bob(point);
        return point;
      }
      case 'all':
        return steps > 0 ? this.end() : this.start();
    }
  }

  /**
   * Move all cursors given number of units.
   *
   * @param steps Number of steps to move.
   * @param unit The unit of move per step: "char", "word", "line".
   * @param endpoint 0 for "focus", 1 for "anchor", 2 for both.
   * @param collapse Whether to collapse the range to a single point.
   */
  public move(steps: number, unit: TextRangeUnit, endpoint: 0 | 1 | 2 = 0, collapse: boolean = true): void {
    this.forCursor((cursor) => {
      switch (endpoint) {
        case 0: {
          let point = cursor.focus();
          point = this.skip(point, steps, unit);
          if (collapse) cursor.set(point);
          else cursor.setEndpoint(point, 0);
          break;
        }
        case 1: {
          let point = cursor.anchor();
          point = this.skip(point, steps, unit);
          if (collapse) cursor.set(point);
          else cursor.setEndpoint(point, 1);
          break;
        }
        case 2: {
          const start = this.skip(cursor.start, steps, unit);
          const end = collapse ? start.clone() : this.skip(cursor.end, steps, unit);
          cursor.set(start, end);
          break;
        }
      }
    });
  }

  // ---------------------------------------------------------------- selection

  /**
   * Leaves only the first cursor, and sets it selection to the whole text.
   *
   * @returns Returns `true` if the selection was successful.
   */
  public selectAll(): boolean {
    const range = this.txt.rangeAll();
    if (!range) return false;
    this.cursor.setRange(range);
    return true;
  }

  /**
   * Selects a word by extending the selection to the left and right of the point.
   *
   * @param point Point to the right of which is the starting character of the word.
   * @returns Range which contains the word.
   */
  public rangeWord(point: Point<T>): Range<T> | undefined {
    const char = point.rightChar() || point.leftChar();
    if (!char) return;
    const c = String(char.view())[0];
    const predicate: CharPredicate<string> = isLetter(c) ? isLetter : isWhitespace(c) ? isWhitespace : isPunctuation;
    const start = this.bow(point, predicate, true);
    const end = this.eow(point, predicate, true);
    return this.txt.range(start, end);
  }

  /**
   * Returns a range by expanding the selection to the left and right of the
   * given point.
   *
   * @param point Point from which to start range expansion.
   * @param unit Unit of the range expansion.
   * @returns Range which contains the specified unit.
   */
  public range(point: Point<T>, unit: TextRangeUnit): Range<T> | undefined {
    if (unit === 'word') return this.rangeWord(point);
    const point1 = this.skip(point, -1, unit);
    const point2 = this.skip(point, 1, unit);
    return this.txt.range(point1, point2);
  }

  public select(unit: TextRangeUnit): void {
    this.forCursor((cursor) => {
      const range = this.range(cursor.start, unit);
      if (range) cursor.setRange(range);
      else this.delCursors;
    });
  }

  public selectAt(at: Position<T>, unit: TextRangeUnit | ''): void {
    this.cursor.set(this.point(at));
    if (unit) this.select(unit);
  }

  // --------------------------------------------------------------- formatting
  
  public formatExclusive(type: SliceType, data?: unknown, slices: EditorSlices<T> = this.saved): void {
    // TODO: handle mutually exclusive slices (<sub>, <sub>)
    const overlay = this.txt.overlay;
    overlay.refresh(); // TODO: Refresh for `overlay.stat()` calls. Is it actually needed?
    for (let i = this.cursors0(), cursor = i(); cursor; cursor = i()) {
      const [complete] = overlay.stat(cursor, 1e6);
      const alreadyFormatted = complete.has(type);
      if (alreadyFormatted) continue;
      makeRangeExtendable(cursor);
      if (cursor.start.isAbs() || cursor.end.isAbs()) continue;
      slices.insOverwrite(type, data);
    }
  }

  // ------------------------------------------------------------------ various

  public point(at: Position<T>): Point<T> {
    return typeof at === 'number' ? this.txt.pointAt(at) : Array.isArray(at) ? this.txt.pointAt(at[0], at[1]) : at;
  }

  public end(): Point<T> {
    const txt = this.txt;
    return txt.pointEnd() ?? txt.pointAbsEnd();
  }

  public start(): Point<T> {
    const txt = this.txt;
    return txt.pointStart() ?? txt.pointAbsStart();
  }
}
