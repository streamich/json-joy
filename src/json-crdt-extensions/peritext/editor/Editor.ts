import {Cursor} from './Cursor';
import {Anchor} from '../rga/constants';
import {formatType} from '../slice/util';
import {EditorSlices} from './EditorSlices';
import {next, prev} from 'sonic-forest/lib/util';
import {printTree} from 'tree-dump/lib/printTree';
import {SliceRegistry} from '../registry/SliceRegistry';
import {PersistedSlice} from '../slice/PersistedSlice';
import {stringify} from '../../../json-text/stringify';
import {CommonSliceType, type SliceTypeSteps, type SliceType, type SliceTypeStep} from '../slice';
import {isLetter, isPunctuation, isWhitespace, stepsEqual} from './util';
import {ValueSyncStore} from '../../../util/events/sync-store';
import {MarkerOverlayPoint} from '../overlay/MarkerOverlayPoint';
import {UndefEndIter, type UndefIterator} from '../../../util/iterator';
import {tick, Timespan, type ITimespanStruct} from '../../../json-crdt-patch';
import {CursorAnchor, SliceStacking, SliceHeaderMask, SliceHeaderShift, SliceTypeCon} from '../slice/constants';
import type {Point} from '../rga/Point';
import type {Range} from '../rga/Range';
import type {Printable} from 'tree-dump';
import type {Peritext} from '../Peritext';
import type {ChunkSlice} from '../util/ChunkSlice';
import type {MarkerSlice} from '../slice/MarkerSlice';
import type {
  CharIterator,
  CharPredicate,
  EditorPosition,
  TextRangeUnit,
  ViewStyle,
  ViewRange,
  ViewSlice,
  EditorUi,
  EditorSelection,
} from './types';

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

export class Editor<T = string> implements Printable {
  public readonly saved: EditorSlices<T>;
  public readonly extra: EditorSlices<T>;
  public readonly local: EditorSlices<T>;

  /**
   * The registry holds definitions of detailed behavior of various slice tags.
   */
  public registry: SliceRegistry | undefined;

  /**
   * Formatting basic inline formatting which will be applied to the next
   * inserted text. This is a temporary store for formatting which is not yet
   * applied to the text, but will be if the cursor is not moved. This is used
   * for {@link SliceStacking.One} formatting which is set as "pending" when
   * user toggles it while cursor is caret.
   */
  public readonly pending = new ValueSyncStore<Map<CommonSliceType | string | number, unknown> | undefined>(void 0);

  constructor(public readonly txt: Peritext<T>) {
    this.saved = new EditorSlices(txt, txt.savedSlices);
    this.extra = new EditorSlices(txt, txt.extraSlices);
    this.local = new EditorSlices(txt, txt.localSlices);
  }

  public getRegistry(): SliceRegistry {
    let registry = this.registry;
    if (!registry) this.registry = registry = SliceRegistry.withCommon();
    return registry;
  }

  public text(): string {
    return this.txt.strApi().view();
  }

  // ------------------------------------------------------------------ cursors

  public addCursor(range: Range<T> = this.txt.rangeAt(0), anchor: CursorAnchor = CursorAnchor.Start): Cursor<T> {
    const cursor = this.txt.localSlices.ins<Cursor<T>, typeof Cursor>(
      range,
      SliceStacking.Cursor,
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
    return cursor ?? this.addCursor();
  }

  public cursors0(): UndefIterator<Cursor<T>> {
    const iterator = this.txt.localSlices.iterator0();
    return () => {
      while (true) {
        const slice = iterator();
        if (slice instanceof Cursor) return slice;
        if (!slice) return;
      }
    };
  }

  public mainCursor(): Cursor<T> | undefined {
    return this.cursors0()();
  }

  public cursors() {
    return new UndefEndIter(this.cursors0());
  }

  public forCursor(callback: (cursor: Cursor<T>) => void): void {
    for (let cursor: Cursor<T> | undefined, i = this.cursors0(); (cursor = i()); ) callback(cursor);
  }

  /**
   * @returns Returns `true` if there is at least one cursor in the document.
   */
  public hasCursor(): boolean {
    return !!this.cursors0()();
  }

  /**
   * Returns the first cursor in the document, if any.
   *
   * @returns Returns the first cursor in the document, or `undefined` if there
   *     are no cursors.
   */
  public getCursor(): undefined | Cursor<T> {
    return this.hasCursor() ? this.cursor : void 0;
  }

  /**
   * @returns Returns the exact number of cursors in the document.
   */
  public cursorCount(): number {
    let cnt = 0;
    for (const i = this.cursors0(); i(); ) cnt++;
    return cnt;
  }

  /**
   * Returns relative count of cursors (cardinality).
   *
   * @returns 0 if there are no cursors, 1 if there is exactly one cursor, 2 if
   *     there are more than one cursor.
   */
  public cursorCard(): 0 | 1 | 2 {
    const i = this.cursors0();
    return !i() ? 0 : !i() ? 1 : 2;
  }

  public delCursor(cursor: Cursor<T>): void {
    this.local.del(cursor);
  }

  public delCursors(): void {
    for (let cursor: Cursor<T> | undefined, i = this.cursors0(); (cursor = i()); ) this.delCursor(cursor);
  }

  /**
   * Ensures there is no range selection. If user has selected a range,
   * the contents is removed and the cursor is set at the start of the range
   * as caret.
   */
  public collapseCursor(cursor: Range<T>): void {
    this.delRange(cursor);
    cursor.collapseToStart();
  }

  public collapseCursors(): void {
    for (let i = this.cursors0(), cursor = i(); cursor; cursor = i()) this.collapseCursor(cursor);
  }

  // ------------------------------------------------------------- text editing

  /**
   * Ensures there is exactly one cursor. If the cursor is a range, contents
   * inside the range is deleted and cursor is collapsed to a single point.
   *
   * @returns A single cursor collapsed to a single point.
   */
  public caret(): Cursor<T> {
    const cursor = this.cursor;
    if (!cursor.isCollapsed()) this.delRange(cursor);
    return cursor;
  }

  /**
   * Insert inline text at current cursor position. If cursor selects a range,
   * the range is removed and the text is inserted at the start of the range.
   */
  public insert0(range: Range<T>, text: string): ITimespanStruct | undefined {
    if (!text) return;
    if (!range.isCollapsed()) this.delRange(range);
    const after = range.start.clone();
    after.refAfter();
    const txt = this.txt;
    const textId = txt.ins(after.id, text);
    const span = new Timespan(textId.sid, textId.time, text.length);
    const shift = text.length - 1;
    const point = txt.point(shift ? tick(textId, shift) : textId, Anchor.After);
    if (range instanceof Cursor) range.set(point, point, CursorAnchor.Start);
    else range.set(point);
    return span;
  }

  /**
   * Inserts text at the cursor positions and collapses cursors, if necessary.
   * Then applies any pending inline formatting to the inserted text.
   */
  public insert(text: string, ranges?: IterableIterator<Range<T>> | Range<T>[]): ITimespanStruct[] {
    const spans: ITimespanStruct[] = [];
    if (!ranges) {
      if (!this.hasCursor()) this.addCursor();
      ranges = this.cursors();
    }
    if (!ranges) return [];
    for (const range of ranges) {
      const span = this.insert0(range, text);
      if (span) spans.push(span);
      const pending = this.pending.value;
      if (pending?.size) {
        this.pending.next(void 0);
        const start = range.start.clone();
        start.step(-text.length);
        const toggleRange = this.txt.range(start, range.end.clone());
        for (const [type, data] of pending) this.toggleRangeExclFmt(toggleRange, type, data);
      }
    }
    return spans;
  }

  /**
   * Deletes the previous character at current cursor positions. If cursors
   * select a range, deletes the whole range.
   */
  public del(step: number = -1): void {
    this.delete(step, 'char');
  }

  public delRange(range: Range<T>): void {
    const txt = this.txt;
    const overlay = txt.overlay;
    const contained = overlay.findContained(range);
    for (const slice of contained)
      if (slice instanceof PersistedSlice && slice.stacking !== SliceStacking.Cursor) slice.del();
    txt.delStr(range);
  }

  /**
   * Deletes one or more units of text in all cursors. If cursor is a range,
   * deletes the whole range.
   *
   * @param step Number of units to delete.
   * @param unit A unit of deletion: "char", "word", "line".
   */
  public delete(step: number, unit: 'char' | 'word' | 'line'): void {
    const txt = this.txt;
    for (let i = this.cursors0(), cursor = i(); cursor; cursor = i()) {
      if (!cursor.isCollapsed()) {
        this.collapseCursor(cursor);
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
      const range = txt.range(point1, point2);
      this.delRange(range);
      point1.refAfter();
      cursor.set(point1);
    }
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
  public skip(point: Point<T>, steps: number, unit: TextRangeUnit, ui?: EditorUi<T>): Point<T> {
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
      case 'vline': {
        if (steps > 0) for (let i = 0; i < steps; i++) point = ui?.eol?.(point, 1) ?? this.eol(point);
        else for (let i = 0; i < -steps; i++) point = ui?.eol?.(point, -1) ?? this.bol(point);
        return point;
      }
      case 'vert': {
        return ui?.vert?.(point, steps) || point;
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
  public move(
    steps: number,
    unit: TextRangeUnit,
    endpoint: 0 | 1 | 2 = 0,
    collapse: boolean = true,
    ui?: EditorUi<T>,
  ): void {
    this.forCursor((cursor) => {
      switch (endpoint) {
        case 0: {
          let point = cursor.focus();
          point = this.skip(point, steps, unit, ui);
          if (collapse) cursor.set(point);
          else cursor.setEndpoint(point, 0);
          break;
        }
        case 1: {
          let point = cursor.anchor();
          point = this.skip(point, steps, unit, ui);
          if (collapse) cursor.set(point);
          else cursor.setEndpoint(point, 1);
          break;
        }
        case 2: {
          const start = this.skip(cursor.start, steps, unit, ui);
          const end = collapse ? start.clone() : this.skip(cursor.end, steps, unit, ui);
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
  public range(point: Point<T>, unit: TextRangeUnit, ui?: EditorUi<T>): Range<T> | undefined {
    if (unit === 'word') return this.rangeWord(point);
    const point1 = this.skip(point, -1, unit, ui);
    const point2 = this.skip(point, 1, unit, ui);
    return this.txt.range(point1, point2);
  }

  public select(unit: TextRangeUnit, ui?: EditorUi<T>): void {
    this.forCursor((cursor) => {
      const range = this.range(cursor.start, unit, ui);
      if (range) cursor.set(range.start, range.end, CursorAnchor.Start);
      else this.delCursors;
    });
  }

  public selectAt(at: EditorPosition<T>, unit: TextRangeUnit | '', ui?: EditorUi<T>): void {
    this.cursor.set(this.pos2point(at));
    if (unit) this.select(unit, ui);
  }

  // --------------------------------------------------------------- formatting

  public eraseFormatting(
    store: EditorSlices<T> = this.saved,
    selection: Range<T>[] | IterableIterator<Range<T>> = this.cursors(),
  ): void {
    const overlay = this.txt.overlay;
    for (const range of selection) {
      overlay.refresh();
      const contained = overlay.findContained(range);
      for (const slice of contained) {
        if (slice instanceof PersistedSlice) {
          switch (slice.stacking) {
            case SliceStacking.One:
            case SliceStacking.Many:
            case SliceStacking.Erase:
              slice.del();
          }
        }
      }
      overlay.refresh();
      const overlapping = overlay.findOverlapping(range);
      for (const slice of overlapping) {
        switch (slice.stacking) {
          case SliceStacking.One:
          case SliceStacking.Many: {
            store.insErase(slice.type);
          }
        }
      }
    }
  }

  public clearFormatting(
    store: EditorSlices<T> = this.saved,
    selection: Range<T>[] | IterableIterator<Range<T>> = this.cursors(),
  ): void {
    const overlay = this.txt.overlay;
    overlay.refresh();
    for (const range of selection) {
      const overlapping = overlay.findOverlapping(range);
      for (const slice of overlapping) store.del(slice.id);
    }
  }

  // -------------------------------------------------------- inline formatting

  protected toggleRangeExclFmt(
    range: Range<T>,
    type: CommonSliceType | string | number,
    data?: unknown,
    store: EditorSlices<T> = this.saved,
  ): void {
    if (range.isCollapsed()) throw new Error('Range is collapsed');
    const txt = this.txt;
    const overlay = txt.overlay;
    const [complete] = overlay.stat(range, 1e6);
    const needToRemoveFormatting = complete.has(type);
    makeRangeExtendable(range);
    const contained = overlay.findContained(range);
    for (const slice of contained) if (slice instanceof PersistedSlice && slice.type === type) slice.del();
    if (needToRemoveFormatting) {
      overlay.refresh();
      const [complete2, partial2] = overlay.stat(range, 1e6);
      const needsErase = complete2.has(type) || partial2.has(type);
      if (needsErase) store.slices.insErase(range, type);
    } else {
      if (range.start.isAbs()) {
        const start = txt.pointStart();
        if (!start) return;
        if (start.cmpSpatial(range.end) >= 0) return;
        range.start = start;
      }
      if (range.end.isAbs()) {
        const end = txt.pointEnd();
        if (!end) return;
        if (end.cmpSpatial(range.start) <= 0) return;
        range.end = end;
      }
      store.slices.insOne(range, type, data);
    }
  }

  public toggleExclFmt(
    type: SliceTypeCon | string | number,
    data?: unknown,
    store: EditorSlices<T> = this.saved,
    selection: Range<T>[] | IterableIterator<Range<T>> = this.cursors(),
  ): void {
    // TODO: handle mutually exclusive slices (<sub>, <sub>)
    this.txt.overlay.refresh();
    SELECTION: for (const range of selection) {
      if (range.isCollapsed()) {
        const pending = this.pending.value ?? new Map();
        if (pending.has(type)) pending.delete(type);
        else pending.set(type, data);
        this.pending.next(pending);
        continue SELECTION;
      }
      this.toggleRangeExclFmt(range, type, data, store);
    }
  }

  // --------------------------------------------------------- block formatting

  /**
   * Returns block split marker of the block inside which the point is located.
   *
   * @param point The point to get the marker at.
   * @returns The split marker at the point, if any.
   */
  public getMarker(point: Point<T>): MarkerSlice<T> | undefined {
    return this.txt.overlay.getOrNextLowerMarker(point)?.marker;
  }

  /**
   * Returns the block type at the given point. Block type is a nested array of
   * tags, e.g. `['p']`, `['blockquote', 'p']`, `['ul', 'li', 'p']`, etc.
   *
   * @param point The point to get the block type at.
   * @returns Current block type at the point.
   */
  public getBlockType(point: Point<T>): [type: SliceTypeSteps, marker?: MarkerSlice<T> | undefined] {
    const marker = this.getMarker(point);
    if (!marker) return [[SliceTypeCon.p]];
    let steps = marker?.type ?? [SliceTypeCon.p];
    if (!Array.isArray(steps)) steps = [steps];
    return [steps, marker];
  }

  /**
   * Insert a block split at the start of the document. The start of the
   * document is defined as immediately after all deleted characters starting
   * from the beginning of the document, or as the ABS start of the document if
   * there are no deleted characters.
   *
   * @param type The type of the marker.
   * @returns The inserted marker slice.
   */
  public insStartMarker(type: SliceType): MarkerSlice<T> {
    const txt = this.txt;
    const start = txt.pointStart() ?? txt.pointAbsStart();
    start.refAfter();
    return this.txt.savedSlices.insMarkerAfter(start.id, type);
  }

  /**
   * Find the block split marker which contains the point and sets the block
   * type of the marker. If there is no block split marker at the point, a new
   * block split marker is inserted at the beginning of the document with the
   * specified block type.
   *
   * @param point The point at which to set the block type.
   * @param type The new block type.
   * @returns The marker slice at the point, or a new marker slice if there is none.
   */
  public setBlockType(point: Point<T>, type: SliceType): MarkerSlice<T> {
    const marker = this.getMarker(point);
    if (marker) {
      marker.update({type});
      return marker;
    }
    return this.insStartMarker(type);
  }

  public getContainerPath(steps: SliceTypeSteps): SliceTypeSteps {
    const registry = this.getRegistry();
    const length = steps.length;
    for (let i = length - 1; i >= 0; i--) {
      const step = steps[i];
      const tag = Array.isArray(step) ? step[0] : step;
      const isContainer = registry.isContainer(tag);
      if (isContainer) return steps.slice(0, i + 1);
    }
    return [];
  }

  public getDeepestCommonContainer(steps1: SliceTypeSteps, steps2: SliceTypeSteps): number {
    const length1 = steps1.length;
    const length2 = steps2.length;
    const min = Math.min(length1, length2);
    for (let i = 0; i < min; i++) {
      const step1 = steps1[i];
      const step2 = steps2[i];
      const tag1 = Array.isArray(step1) ? step1[0] : step1;
      const tag2 = Array.isArray(step2) ? step2[0] : step2;
      const disc1 = Array.isArray(step1) ? step1[1] : 0;
      const disc2 = Array.isArray(step2) ? step2[1] : 0;
      if (tag1 !== tag2 || disc1 !== disc2) return i - 1;
      if (!this.getRegistry().isContainer(tag1)) return i - 1;
    }
    return min;
  }

  /**
   * @param at Point at which split block split happens.
   * @param slices The slices set to use.
   * @returns True if a marker was inserted, false if it was updated.
   */
  public splitAt(at: Point<T>, slices: EditorSlices<T> = this.saved): boolean {
    const [type, marker] = this.getBlockType(at);
    const prevMarker = marker ? this.getMarker(marker.start.copy((p) => p.halfstep(-1))) : void 0;
    if (marker && prevMarker) {
      const rangeFromMarker = this.txt.range(marker.start, at);
      const noLeadingText = rangeFromMarker.length() <= 1;
      if (noLeadingText) {
        const markerSteps = marker.typeSteps();
        const prevMarkerSteps = prevMarker.typeSteps();
        if (markerSteps.length > 1) {
          const areMarkerTypesEqual = stepsEqual(markerSteps, prevMarkerSteps);
          if (areMarkerTypesEqual) {
            const i = this.getDeepestCommonContainer(markerSteps, prevMarkerSteps);
            if (i >= 0) {
              const newType = [...markerSteps];
              const step = newType[i];
              const tag = Array.isArray(step) ? step[0] : step;
              const disc = Array.isArray(step) ? step[1] : 0;
              newType[i] = [tag, (disc + 1) % 8];
              marker.update({type: newType});
              return false;
            }
          }
        }
      }
    }
    const containerPath = this.getContainerPath(type);
    const newType = containerPath.concat([CommonSliceType.p]);
    slices.insMarker(newType);
    return true;
  }

  public split(
    type?: SliceType,
    data?: unknown,
    selection: Range<T>[] | IterableIterator<Range<T>> = this.cursors(),
    slices: EditorSlices<T> = this.saved,
  ): void {
    if (type === void 0) {
      for (const range of selection) {
        this.collapseCursor(range);
        const didInsertMarker = this.splitAt(range.start, slices);
        if (didInsertMarker && range instanceof Cursor) range.move(1);
      }
    } else {
      for (const range of selection) {
        this.collapseCursor(range);
        if (type === void 0) {
          // TODO: detect current block type
          type = CommonSliceType.p;
        }
        slices.insMarker(type, data);
        if (range instanceof Cursor) range.move(1);
      }
    }
  }

  public setStartMarker(type: SliceType, data?: unknown, slices: EditorSlices<T> = this.saved): MarkerSlice<T> {
    const after = this.txt.pointStart() ?? this.txt.pointAbsStart();
    after.refAfter();
    return slices.slices.insMarkerAfter(after.id, type, data);
  }

  public tglMarkerAt(
    point: Point<T>,
    type: SliceType,
    data?: unknown,
    slices: EditorSlices<T> = this.saved,
    def: SliceTypeStep = SliceTypeCon.p,
  ): void {
    const overlay = this.txt.overlay;
    const markerPoint = overlay.getOrNextLowerMarker(point);
    if (markerPoint) {
      const marker = markerPoint.marker;
      const tag = marker.tag();
      if (!Array.isArray(type)) type = [type];
      const typeTag = type[type.length - 1];
      if (tag === typeTag) type = [...type.slice(0, -1), def];
      if (Array.isArray(type) && type.length === 1) type = type[0];
      marker.update({type});
    } else this.setStartMarker(type, data, slices);
  }

  public updMarkerAt(point: Point<T>, type: SliceType, data?: unknown, slices: EditorSlices<T> = this.saved): void {
    const overlay = this.txt.overlay;
    const markerPoint = overlay.getOrNextLowerMarker(point);
    if (markerPoint) {
      const marker = markerPoint.marker;
      if (Array.isArray(type) && type.length === 1) type = type[0];
      marker.update({type});
    } else this.setStartMarker(type, data, slices);
  }

  /**
   * Toggle the type of a block split between the slice type and the default
   * (paragraph) block type.
   *
   * @param type Slice type to toggle.
   * @param data Custom data of the slice.
   */
  public tglMarker(
    type: SliceType,
    data?: unknown,
    selection: Range<T>[] | IterableIterator<Range<T>> = this.cursors(),
    slices: EditorSlices<T> = this.saved,
    def: SliceTypeStep = SliceTypeCon.p,
  ): void {
    for (const range of selection) this.tglMarkerAt(range.start, type, data, slices, def);
  }

  /**
   * Update the type of a block split at all cursor positions.
   *
   * @param type Slice type to set.
   * @param data Custom data of the slice.
   * @param slices The slices set to use, if new marker is inserted at the start
   *     of the document.
   */
  public updMarker(
    type: SliceType,
    data?: unknown,
    selection: Range<T>[] | IterableIterator<Range<T>> = this.cursors(),
    slices: EditorSlices<T> = this.saved,
  ): void {
    for (const range of selection) this.updMarkerAt(range.start, type, data, slices);
  }

  public delMarker(selection: Range<T>[] | IterableIterator<Range<T>> = this.cursors()): void {
    const markerPoints = new Set<MarkerOverlayPoint<T>>();
    for (const range of selection) {
      const markerPoint = this.txt.overlay.getOrNextLowerMarker(range.start);
      if (markerPoint) markerPoints.add(markerPoint);
    }
    for (const markerPoint of markerPoints) {
      const boundary = markerPoint.marker.boundary();
      this.delRange(boundary);
    }
  }

  // ---------------------------------------------------------- export / import

  public export(range: Range<T>): ViewRange {
    const r = range.range();
    r.start.refBefore();
    r.end.refAfter();
    const text = r.text();
    const offset = r.start.viewPos();
    const viewSlices: ViewSlice[] = [];
    const view: ViewRange = [text, offset, viewSlices];
    const txt = this.txt;
    const overlay = txt.overlay;
    const slices = overlay.findOverlapping(r);
    for (const slice of slices) {
      const isSavedSlice = slice.id.sid === txt.model.clock.sid;
      if (!isSavedSlice) continue;
      const stacking = slice.stacking;
      switch (stacking) {
        case SliceStacking.One:
        case SliceStacking.Many:
        case SliceStacking.Erase:
        case SliceStacking.Marker: {
          const {stacking, type, start, end} = slice;
          const header: number =
            (stacking << SliceHeaderShift.Stacking) +
            (start.anchor << SliceHeaderShift.X1Anchor) +
            (end.anchor << SliceHeaderShift.X2Anchor);
          const viewSlice: ViewSlice = [header, start.viewPos(), end.viewPos(), type];
          const data = slice.data();
          if (data !== void 0) viewSlice.push(data);
          viewSlices.push(viewSlice);
        }
      }
    }
    return view;
  }

  /**
   * "Copy formatting-only", copies inline formatting applied to the selected
   * range.
   *
   * @param range Range copy formatting from, normally a single visible character.
   * @returns A list of serializable inline formatting applied to the selected range.
   */
  public exportStyle(range: Range<T>): ViewStyle[] {
    const formatting: ViewStyle[] = [];
    const txt = this.txt;
    const overlay = txt.overlay;
    const slices = overlay.findOverlapping(range);
    for (const slice of slices) {
      const isSavedSlice = slice.id.sid === txt.model.clock.sid;
      if (!isSavedSlice) continue;
      if (!slice.contains(range)) continue;
      const stacking = slice.stacking;
      switch (stacking) {
        case SliceStacking.One:
        case SliceStacking.Many:
        case SliceStacking.Erase: {
          const sliceFormatting: ViewStyle = [stacking, slice.type];
          const data = slice.data();
          if (data !== void 0) sliceFormatting.push(data);
          formatting.push(sliceFormatting);
        }
      }
    }
    return formatting;
  }

  public import(pos: number, view: ViewRange): number {
    let [text, offset, slices] = view;
    const txt = this.txt;
    let removeFirstMarker = false;
    const firstSlice = slices[0];
    if (firstSlice) {
      const [header, x1, , type] = firstSlice;
      const stacking: SliceStacking = (header & SliceHeaderMask.Stacking) >>> SliceHeaderShift.Stacking;
      const isBlockSplitMarker = stacking === SliceStacking.Marker;
      if (isBlockSplitMarker) {
        const markerStartsAtZero = x1 - offset === 0;
        if (markerStartsAtZero) {
          const point = txt.pointAt(pos);
          const markerBefore = txt.overlay.getOrNextLowerMarker(point);
          if (markerBefore) {
            if (markerBefore.type() === type) removeFirstMarker = true;
          } else {
            if (type === CommonSliceType.p) removeFirstMarker = true;
          }
        }
      }
    }
    if (removeFirstMarker) {
      text = text.slice(1);
      offset += 1;
      slices = slices.slice(1);
    }
    const length = slices.length;
    const splits: ViewSlice[] = [];
    const annotations: ViewSlice[] = [];
    const texts: string[] = [];
    let curr = 0;
    for (let i = 0; i < length; i++) {
      const slice = slices[i];
      const [header, x1] = slice;
      const stacking: SliceStacking = (header & SliceHeaderMask.Stacking) >>> SliceHeaderShift.Stacking;
      const isBlockSplitMarker = stacking === SliceStacking.Marker;
      if (isBlockSplitMarker) {
        const end = x1 - offset;
        texts.push(text.slice(curr, end));
        curr = end + 1;
        splits.push(slice);
      } else annotations.push(slice);
    }
    const lastText = text.slice(curr);
    const splitLength = splits.length;
    curr = pos;
    for (let i = 0; i < splitLength; i++) {
      const str = texts[i];
      const split = splits[i];
      if (str) {
        txt.insAt(curr, str);
        curr += str.length;
      }
      if (split) {
        const [, , , type, data] = split;
        const after = txt.pointAt(curr);
        after.refAfter();
        txt.savedSlices.insMarkerAfter(after.id, type, data);
        curr += 1;
      }
    }
    if (lastText) {
      txt.insAt(curr, lastText);
      curr += lastText.length;
    }
    const annotationsLength = annotations.length;
    for (let i = 0; i < annotationsLength; i++) {
      const slice = annotations[i];
      const [header, x1, x2, type, data] = slice;
      const anchor1: Anchor = (header & SliceHeaderMask.X1Anchor) >>> SliceHeaderShift.X1Anchor;
      const anchor2: Anchor = (header & SliceHeaderMask.X2Anchor) >>> SliceHeaderShift.X2Anchor;
      const stacking: SliceStacking = (header & SliceHeaderMask.Stacking) >>> SliceHeaderShift.Stacking;
      const x1Src = x1 - offset;
      const x2Src = x2 - offset;
      const x1Capped = Math.max(0, x1Src);
      const x2Capped = Math.min(text.length, x2Src);
      const x1Dest = x1Capped + pos;
      const annotationLength = x2Capped - x1Capped;
      const range = txt.rangeAt(x1Dest, annotationLength);
      if (!!x1Dest && anchor1 === Anchor.After) range.start.refAfter();
      // else range.start.refBefore();
      if (anchor2 === Anchor.Before) range.end.refBefore();
      // else range.end.refAfter();
      if (range.end.isAbs()) range.end.refAfter();
      txt.savedSlices.ins(range, stacking, type, data);
    }
    return curr - pos;
  }

  public importStyle(range: Range<T>, formatting: ViewStyle[]): void {
    const txt = this.txt;
    const length = formatting.length;
    for (let i = 0; i < length; i++) {
      const [stacking, type, data] = formatting[i];
      txt.savedSlices.ins(range, stacking, type, data);
    }
  }

  // ------------------------------------------------------------------ various

  public pos2point(at: EditorPosition<T>): Point<T> {
    const txt = this.txt;
    return typeof at === 'number' ? txt.pointAt(at) : Array.isArray(at) ? txt.pointAt(at[0], at[1]) : at;
  }

  public sel2range(at: EditorSelection<T>): [range: Range<T>, anchor: CursorAnchor] {
    if (!Array.isArray(at)) return [at, CursorAnchor.End];
    const [pos1, pos2] = at;
    const p1 = this.pos2point(pos1);
    const txt = this.txt;
    if (pos2 === undefined) {
      p1.refAfter();
      return [txt.range(p1), CursorAnchor.End];
    }
    const p2 = this.pos2point(pos2);
    const range = txt.rangeFromPoints(p1, p2);
    const anchor: CursorAnchor = range.start === p1 ? CursorAnchor.Start : CursorAnchor.End;
    return [range, anchor];
  }

  public end(): Point<T> {
    const txt = this.txt;
    return txt.pointEnd() ?? txt.pointAbsEnd();
  }

  public start(): Point<T> {
    const txt = this.txt;
    return txt.pointStart() ?? txt.pointAbsStart();
  }

  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab: string = ''): string {
    const pending = this.pending.value;
    const pendingFormatted = {} as any;
    if (pending) for (const [type, data] of pending) pendingFormatted[formatType(type)] = data;
    return (
      'Editor' +
      printTree(tab, [
        (tab) =>
          'cursors' +
          printTree(
            tab,
            [...this.cursors()].map((cursor) => (tab) => cursor.toString(tab)),
          ),
        (tab) => this.getRegistry().toString(tab),
        pending ? () => `pending ${stringify(pendingFormatted)}` : null,
      ])
    );
  }
}
