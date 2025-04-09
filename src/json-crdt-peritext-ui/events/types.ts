import type {Point} from '../../json-crdt-extensions/peritext/rga/Point';
import type {Position as EditorPosition} from '../../json-crdt-extensions/peritext/editor/types';
import type {SliceType} from '../../json-crdt-extensions/peritext/slice/types';
import type {Patch} from '../../json-crdt-patch';

/**
 * Dispatched every time any other event is dispatched.
 */
export interface ChangeDetail {
  ev?: CustomEvent<InsertDetail | DeleteDetail | CursorDetail | FormatDetail | MarkerDetail>;
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
   * - `'point'`: Moves by one Peritext anchor point. Each character has two
   *     anchor points, one from each side of the character.
   * - `'char'`: Moves by one character. Skips one visible character.
   * - `'word'`: Moves by one word. Skips all visible characters until the end
   *     of a word.
   * - `'line'`: Moves to the beginning or end of line. If UI API is provided,
   *     the line end is determined by a visual line wrap.
   * - `'vert'`: Moves cursor up or down by one line, works if UI
   *     API is provided. Determines the best position in the target line by
   *     finding the position which has the closest relative offset from the
   *     beginning of the line.
   * - `'block'`: Moves to the beginning or end of block, i.e. paragraph,
   *     blockequote, etc.
   * - `'all'`: Moves to the beginning or end of the document.
   *
   * @default 'char'
   */
  unit?: 'point' | 'char' | 'word' | 'line' | 'vert' | 'block' | 'all';

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
export interface FormatDetail {
  /**
   * Type of the annotation. The type is used to determine the visual style of
   * the annotation, for example, the type `'bold'` may render the text in bold.
   *
   * For common formatting use the {@link CommonSliceType} enum. It contains
   * a unique numeric value for each common formatting types. Numeric values
   * are best for performance and memory usage. Values in the rage -64 to 64 are
   * reserved for common formatting types.
   *
   * For custom formatting, you can use a string value, for example,
   * `'highlight'`. Or use an integer with absolute value greater than 64.
   *
   * Inline formatting types are restricted to a single string or integer value.
   * Nester formatting, say `['p', 'blockquote', 'h1']` is reserved for block
   * formatting, in which case a nested structure like
   * `<p><blockquote><h1>text</h1></blockquote></p>` is created.
   */
  type?: number | string;

  /**
   * Arbitrary data associated with the formatting. Usually, stored with
   * annotations of "stack" behavior, for example, an "<a>" tag annotation may
   * store the href attribute in this field.
   *
   * @default undefined
   */
  data?: unknown;

  /**
   * Specifies the behavior of the annotation. If `'many'`, the annotation of
   * this type will be stacked on top of each other, and all of them will be
   * applied to the text, with the last annotation on top. If `'one'`,
   * the annotation is not stacked, only one such annotation can be applied per
   * character. The `'erase'` behavior is used to remove the `'many`' or
   * `'one'` annotation from the the given range.
   *
   * The special `'clear'` behavior is used to remove all annotations
   * that intersect with any part of any of the cursors in the document. Usage:
   *
   * ```js
   * {type: 'clear'}
   * ```
   *
   * @default 'one'
   */
  behavior?: 'one' | 'many' | 'erase' | 'clear';

  /**
   * The slice set where the annotation will be stored. `'saved'` is the main
   * document, which is persisted and replicated across all clients. `'extra'`
   * is an ephemeral document, which is not persisted but can be replicated
   * across clients. `'local'` is a local document, which is accessible only to
   * the local client, for example, for storing cursor or selection information.
   *
   * @default 'saved'
   */
  store?: 'saved' | 'extra' | 'local';
}

/**
 * The "marker" event manages block marker insertion, removal, and update
 * actions. For example, inserting a marker in the middle of a paragraph
 * is a "split" action, it creates two new paragraph blocks from the original
 * block. Removing a marker results into a "join" action, which merges two
 * adjacent blocks into one.
 */
export interface MarkerDetail {
  /**
   * The action to perform.
   *
   * @default 'tog'
   */
  action?: 'tog' | 'ins' | 'del' | 'upd';

  /**
   * The type tag applied to the new block, if the action is `'ins'`. If the
   * action is `'upd'`, the type tag is used to update the block type.
   *
   * @default SliceType.Paragraph
   */
  type?: SliceType;

  /**
   * Block-specific custom data. For example, a paragraph block may store
   * the alignment and indentation information in this field.
   *
   * @default undefined
   */
  data?: unknown;
}

/**
 * The "buffer" event manages clipboard buffer actions: cut, copy, and paste. It
 * can be used to cut/copy the current selection or a custom range to clipboard.
 * It can cut/copy the contents in various formats, such as native Peritext
 * format, HTML, Markdown, plain text, and other miscellaneous formats.
 */
export interface BufferDetail {
  /**
   * The action to perform. The `'cut'` and `'copy'` actions generally work
   * the same way, the only difference is that the `'cut'` action removes the
   * text from the current selection and collapses the cursor.
   */
  action: 'cut' | 'copy' | 'paste';

  /**
   * The format in which the data is stored or retrieved from the clipboard.
   *
   * - `auto`: Automatically determine the format based on the data in the
   *   clipboard.
   * - `json`: Specifies the default Peritext {@link Editor} export/import
   *   format in JSON POJO format.
   * - `jsonml`: HTML markup in JSONML format.
   * - `hast`: HTML markup in HAST format.
   * - `text`: Plain text format. Copy and paste text only.
   * - `html`: HTML format. Will copy a range of text with formatting
   *   information in HTML format.
   * - `mdast`: Specifies MDAST (Markdown Abstract Syntax Tree) format.
   * - `markdown`: Markdown format. Will copy a range of text with formatting
   *   information in Markdown format.
   * - `style`: Formatting only. Used to copy and paste formatting information
   *   only, without the text content.
   *
   * @default 'auto'
   */
  format?: 'auto' | 'text' | 'json' | 'jsonml' | 'hast' | 'html' | 'mdast' | 'md' | 'fragment' | 'style';

  /**
   * The range of text to cut or copy. If not specified, the first selection of
   * the current cursor is used. If not specified and there is no cursor, the
   * whole document is used.
   * 
   * When multiple cursors are present, the range is calculated by using the
   * first cursor.
   * 
   * Below is a description of the possible values:
   * 
   * - `cursor`: The current cursor selection.
   * - `word`: The word at the current cursor position. Left and right edges of
   *   the selection are moved to the beginning and end of the word.
   * - `line`: The line at the current cursor caret or focus position.
   * - `block`: The block at the current cursor caret or focus position.
   * - `all`: The whole document.
   * - `[start, end]`: A specific range of text to cut or copy.
   * 
   * @default 'cursor'
   */
  // unit?: [start: Position, end: Position] | 'cursor' | 'word' | 'line' | 'block' | 'all';
  unit?: [start: Position, end: Position];

  /**
   * The data to paste into the document, when `action` is `"paste"`. If not
   * specified, an attempt is made to retrieve the data from the clipboard.
   */
  data?: {
    text?: string;
    html?: string;
  };
}

/**
 * The "annals" event manages undo and redo actions, typically triggered by
 * common keyboard shortcuts like `Ctrl+Z` and `Ctrl+Shift+Z`.
 */
export interface AnnalsDetail {
  /** The action to perform. */
  action: 'undo' | 'redo';

  /**
   * The list of {@link Patch} that will be applied to the document to undo or
   * redo the action, unless the action is cancelled.
   */
  batch: Patch[];
}

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

/**
 * A map of all Peritext rendering surface event types and their corresponding
 * detail types.
 */
export type PeritextEventDetailMap = {
  change: ChangeDetail;
  insert: InsertDetail;
  delete: DeleteDetail;
  cursor: CursorDetail;
  format: FormatDetail;
  marker: MarkerDetail;
  buffer: BufferDetail;
  annals: AnnalsDetail;
};

export type PeritextChangeEvent = CustomEvent<ChangeDetail>;
export type PeritextInsertEvent = CustomEvent<InsertDetail>;
export type PeritextDeleteEvent = CustomEvent<DeleteDetail>;
export type PeritextCursorEvent = CustomEvent<CursorDetail>;
export type PeritextFormatEvent = CustomEvent<FormatDetail>;
export type PeritextMarkerEvent = CustomEvent<MarkerDetail>;
export type PeritextBufferEvent = CustomEvent<BufferDetail>;
export type PeritextAnnalsEvent = CustomEvent<AnnalsDetail>;
