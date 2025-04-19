import type {ObjApi} from '../../../json-crdt/model';
import type {ObjNode} from '../../../json-crdt/nodes';
import type {UndefIterator} from '../../../util/iterator';
import type {SliceRegistryEntry} from '../registry/SliceRegistryEntry';
import type {Point} from '../rga/Point';
import type {Range} from '../rga/Range';
import type {SliceType} from '../slice';
import type {SliceBehavior} from '../slice/constants';
import type {ChunkSlice} from '../util/ChunkSlice';

export type CharIterator<T> = UndefIterator<ChunkSlice<T>>;
export type CharPredicate<T> = (char: T) => boolean;

export type EditorPosition<T = string> = Point<T> | number | [at: number, anchor: 0 | 1];
export type EditorSelection<T = string> = Range<T> | [start: EditorPosition<T>, end?: EditorPosition<T>];

export type TextRangeUnit = 'point' | 'char' | 'word' | 'line' | 'vline' | 'vert' | 'block' | 'all';

export type ViewRange = [text: string, textPosition: number, slices: ViewSlice[]];

export type ViewSlice = [header: number, x1: number, x2: number, type: SliceType, data?: unknown];

export type ViewStyle = [behavior: SliceBehavior, type: SliceType, data?: unknown];

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

/**
 * Transient UI configuration state of a slice. Used to render to the user
 * slice configuration UI, such as popups, modals, etc.
 */
export interface SliceConfigState<Node extends ObjNode = ObjNode> {
  /** Slice definition in the registry. */
  def: SliceRegistryEntry;

  /**
   * An object representing the actual configuration of this slice instance.
   * This object is either already stored in the document, or will be stored
   * when the user commits the changes.
   */
  conf(): ObjApi<Node>;
}
