import type {UndEndNext} from '../../../util/iterator';
import type {Point} from '../rga/Point';
import type {Range} from '../rga/Range';
import type {SliceType} from '../slice';
import type {SliceStacking} from '../slice/constants';
import type {ChunkSlice} from '../util/ChunkSlice';

export type CharIterator<T> = UndEndNext<ChunkSlice<T>>;
export type CharPredicate<T> = (char: T) => boolean;

export type EditorPosition<T = string> = Point<T> | number | [at: number, anchor: 0 | 1];
export type EditorSelection<T = string> = Range<T> | [start: EditorPosition<T>, end?: EditorPosition<T>];

export type TextRangeUnit = 'point' | 'char' | 'word' | 'line' | 'vline' | 'vert' | 'block' | 'all';

/**
 * Represents an exported view of any selected range (fragment) of the document.
 *
 * @todo Rename to `PeritextView`.
 */
export type ViewRange = [
  /**
   * The total text of the exported fragment.
   */
  text: string,
  /**
   * The start position of the exported fragment in the document text. The `x1`
   * and `x2` range values in slices are also absolute positions as they are
   * stored in the document. To compute the positions relative to the fragment
   * `text`, subtract this value from them.
   */
  textPosition: number,
  /**
   * List of all formattings and block splits in the exported fragment.
   */
  slices: ViewSlice[],
];

/**
 * Represents and exported view of a single rich-text formatting annotation or
 * a block split in the document.
 */
export type ViewSlice = [
  /** Contains the behavior and edge anchor point selections. */
  header: number,
  /**
   * Start character position of the formatting, or the newline character `\n`
   * position if this slice is a block split. The position is absolute to the
   * document text, use the `textPosition` field from the {@link ViewRange}
   * interface to compute the relative position.
   */
  x1: number,
  /**
   * End character position of the formatting, or the newline character `\n`
   * position if this slice is a block split. The position is absolute to the
   * document text, use the `textPosition` field from the {@link ViewRange}
   * interface to compute the relative position.
   *
   * @todo Maybe remove this field in `Marker` slices, as it is always equal
   *     to `x1` in such cases. Even `x1` could be stored in `header` as well.
   *     Or store `x1` anchor point as the lowest bit in `x1` and that way
   *     `header` would be purely a behavior field. Actually, best encoding
   *     would be: `[header, type, x1, x2?, data?]` for formatting slices and
   *    `[header, type, x1, data?]` for marker slices. This way the head
   *     `[header, type, x1]` is always the same. Also, the `x2` should be
   *     `length` instead, this way it will consume less space when serialized
   *     to JSON, so formatting: `[header, type, pos, length, data?]`. And
   *     markers: `[header, type, pos, data?]`.
   */
  x2: number,
  /**
   * The user selected type of the slice. In case of an inline formattting,
   * this is the tag name, such as "bold", "italic", etc., expressed as a
   * string or a number. In case of a block split, this can also be an
   * array of nesting *steps* that describe the block type. Each step is either
   * a string or a number, or a 3-tuple of the form `[tag, discriminant, data]`.
   */
  type: SliceType,
  /**
   * Additional data associated with the slice when it is an inline
   * formatting. Usually this is an object.
   */
  data?: unknown,
];

export type ViewStyle = [stacking: SliceStacking, type: SliceType, data?: unknown];

/**
 * UI API which can be injected during various methods of the editor. Used to
 * perform editor function while taking into account the visual representation
 * of the document, such as word wrapping.
 */
export interface EditorUi<T = string> {
  /**
   * Visually skips to the end or beginning of the line. Visually as in, it will
   * respect the visual line breaks created by word wrapping.
   *
   * Skips just one line, regardless of the magnitude of the `steps` parameter.
   *
   * @param point The point from which to start skipping.
   * @param steps The direction to skip. Positive for forward, negative for
   *     backward. Does not respect the magnitude of the steps, always performs
   *     one step.
   * @returns The point after skipping the specified number of lines, or
   *     undefined if no such point exists.
   */
  eol?(point: Point<T>, steps: number): Point<T> | undefined;

  /**
   * Used when user presses "ArrowUp" or "ArrowDown" keys. It will skip to the
   * position in the next visual line, while trying to preserve the horizontal
   * offset from the beginning of the line.
   *
   * @param point The point from which to start skipping.
   * @param steps Number of lines to skip.
   * @returns The point after skipping the specified number of lines, or
   *     undefined if no such point exists.
   */
  vert?(point: Point<T>, steps: number): Point<T> | undefined;
}

export type MarkerUpdateTarget = 'type' | ['tag', index?: number] | ['data', index?: number];
