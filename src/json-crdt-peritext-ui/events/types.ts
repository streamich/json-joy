import type {Point} from '../../json-crdt-extensions/peritext/rga/Point';
import type {Position as EditorPosition} from '../../json-crdt-extensions/peritext/editor/types';
import type {SliceType} from '../../json-crdt-extensions/peritext/slice/types';

/**
 * Dispatched every time any other event is dispatched.
 */
export interface ChangeDetail {
  ev?: CustomEvent<InsertDetail | DeleteDetail | CursorDetail | InlineDetail | MarkerDetail>;
}

/**
 * Event dispatched to insert text into the document.
 */
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

  /**
   * Position in the document to start the deletion from. If not specified, the
   * deletion is executed for all cursors in the document at their current
   * positions. If specified, only one cursor will be placed at the specified
   * position and the deletion will be executed from that position (while all
   * other cursors will be removed).
   *
   * @default undefined
   */
  at?: Position;
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
 *
 * The editor supports multiple cursors. To create a new cursor, set the `edge`
 * field to `'new'`. The `at` field specifies the position of the new cursor.
 * The `len` field is ignored when the `edge` field is set to `'new'`. For
 * example:
 *
 * ```ts
 * {at: 10, edge: 'new'}
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
  at?: Position;

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
  pos?: [start: Position, end: Position][];
}

// biome-ignore lint: empty interface is expected
export type MarkerDetail = {};

/**
 * Position represents a caret position in the document. The position can either
 * be an instance of {@link Point} or a numeric position in the document, which
 * will be immediately converted to a {@link Point} instance.
 *
 * If a number is provided, the number represents the character index in the
 * document, where `0` is the beginning of the document and `1` is the position
 * right after the first character, etc.
 *
 * If 2-tuple is provided, the first element is the character index and the
 * second `0 | 1` member specifies the anchor point of the character: `0`
 * for the beginning of the character and `1` for the end of the character.
 */
export type Position = EditorPosition<string>;

export type PeritextEventMap = {
  change: ChangeDetail;
  insert: InsertDetail;
  delete: DeleteDetail;
  cursor: CursorDetail;
  inline: InlineDetail;
  marker: MarkerDetail;
};
