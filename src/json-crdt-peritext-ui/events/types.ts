import type {Point} from '../../json-crdt-extensions/peritext/rga/Point';
import type {SliceType} from '../../json-crdt-extensions/peritext/slice/types';

/**
 * Dispatched every time any other event is dispatched.
 */
export interface ChangeDetail {
  ev?: CustomEvent<InsertDetail | DeleteDetail | CursorDetail | InlineDetail | MarkerDetail>;
}

export interface InsertDetail {
  text: string;
}

/**
 * Event dispatched to delete text from the document.
 */
export interface DeleteDetail {
  /**
   * Specifies the amount of text to delete. If the value is negative, the
   * deletion will be backwards. If positive, the deletion will be forwards.
   * If `0`, the deletion will execute in both directions.
   *
   * For example, if the cursor is in the middle of a word and the length is
   * set to `0`, the whole word will be deleted by expanding the selection
   * in both directions.
   *
   * ```js
   * {
   *   len: 0,
   *   unit: 'word',
   * }
   * ```
   *
   * Or, delete a single character forwards:
   *
   * ```js
   * {
   *   len: 1,
   * }
   * ```
   *
   * @default -1
   */
  len?: number;

  /**
   * Specifies the unit of the deletion. If `'char'`, the deletion will be
   * executed by `len` characters. If `'word'`, the deletion will be executed
   * by one word in the direction specified by `len`. If `'line'`, the deletion
   * will be executed to the beginning or end of line, in direction specified
   * by `len`.
   *
   * @default 'char'
   */
  unit?: 'char' | 'word' | 'line';
}

/**
 * The `cursor` event is emitted when caret or selection is changed. The event
 * is applied to all cursors in the document.
 *
 * ## Scenarios
 *
 * Move caret to a specific position in text:
 *
 * ```ts
 * {at: 10}
 * ```
 *
 * Move caret relative to current position:
 *
 * ```ts
 * {len: 5}
 * ```
 *
 * Move caret to the beginning of the word at a specific position:
 *
 * ```ts
 * {at: 10, len: -1, unit: 'word'}
 * ```
 *
 * Move caret to the end of word starting from the current position:
 *
 * ```ts
 * {len: 1, unit: 'word'}
 * ```
 *
 * Move *anchor* edge of the selection to the beginning of the current line:
 *
 * ```ts
 * {len: -1, unit: 'line', edge: 'anchor'}
 * ```
 *
 * Move *focus* edge of the selection to the end of a block at a specific position:
 *
 * ```ts
 * {at: 10, len: 1, unit: 'block', edge: 'focus'}
 * ```
 *
 * Select the whole document:
 *
 * ```ts
 * {unit: 'all'}
 * ```
 */
export interface CursorDetail {
  /**
   * Position in the document to move the cursor to. If `-1` or undefined, the
   * current cursor position will be used as the starting point and `len` will
   * be used to determine the new position.
   *
   * If 2-tuple is provided, the first element is the character index and the
   * second `0 | 1` member specifies the anchor point of the character: `0`
   * for the beginning of the character and `1` for the end of the character.
   */
  at?: number | [at: number, anchor: 0 | 1] | Point;

  /**
   * Specify the length of the movement or selection in units specified by the
   * `unit` field. If the `at` field is set, the `at` field specifies the
   * absolute selection position and the `len` field specifies the length of
   * the selection. If the `at` field is not set, the `len` field specifies
   * the relative movement of the cursor.
   */
  len?: number;

  /**
   * Specifies the unit of the movement. If `'char'`, the cursor will be
   * moved by `len` characters. If `'word'`, the cursor will be moved by
   * one word in the direction specified by `len`. If `'line'`, the cursor
   * will be moved to the beginning or end of line, in direction specified
   * by `len`.
   *
   * Defaults to `'char'`.
   */
  unit?: 'char' | 'word' | 'line' | 'block' | 'all';

  /**
   * Specifies which edge of the selection to move. If `'focus'`, the focus
   * edge will be moved. If `'anchor'`, the anchor edge will be moved. If
   * `'both'`, the whole selection will be moved. Defaults to `'both'`.
   *
   * When the value is set to `'new'`, a new cursor will be created at the
   * position specified by the `at` field.
   */
  edge?: 'focus' | 'anchor' | 'both' | 'new';
}

/**
 * Event dispatched to insert an inline rich-text annotation into the document.
 */
export interface InlineDetail {
  type: SliceType;
  data?: unknown;
  behavior?: 'stack' | 'overwrite' | 'erase';
  store?: 'saved' | 'extra' | 'local';
  pos?: [start: number, end: number][];
}

// biome-ignore lint: empty interface is expected
export type MarkerDetail = {};

export type PeritextEventMap = {
  change: ChangeDetail;
  insert: InsertDetail;
  delete: DeleteDetail;
  cursor: CursorDetail;
  inline: InlineDetail;
  marker: MarkerDetail;
};
