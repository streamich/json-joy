import type {Point} from '../../json-crdt-extensions/peritext/rga/Point';
import type {EditorPosition, EditorSelection} from '../../json-crdt-extensions/peritext/editor/types';
import type {SliceType} from '../../json-crdt-extensions/peritext/slice/types';
import type {Patch} from '../../json-crdt-patch';
import type {Cursor} from '../../json-crdt-extensions/peritext/editor/Cursor';
import type {Range} from '../../json-crdt-extensions/peritext/rga/Range';

/**
 * Dispatched every time any other event is dispatched.
 */
export interface ChangeDetail {
  ev?: CustomEvent<InsertDetail | DeleteDetail | CursorDetail | FormatDetail | MarkerDetail>;
}

/**
 * The {@link SelectionDetailPart} interface allows to specify a range of text
 * selection or a single caret position in the document.
 * 
 * If the `at` field is specified, the selection set will contain one selection,
 * the one created at the specified position. If the `at` field is not specified,
 * the selection set will contain all cursors in the document at their current
 * positions.
 */
export interface SelectionDetailPart {
  /**
   * Position in the document to create a selection over. If not specified, the
   * operation is applied over all cursors in the document at their current
   * positions. Or if operation is specified only for one cursor, it will be
   * applied to the first (main) cursor.
   * 
   * If specified, a new temporary selection is created which is used to perform
   * the operation on. Then, if specified, this selection is used to create a
   * new main cursor, while all other cursors are removed.
   * 
   * @default undefined
   */
  at?: Selection;
}

/**
 * The {@link SelectionMoveDetailPart} specified one or more selection
 * transformations, which are applied to the selection set. All move operations
 * are applied to each selection in the selection set.
 */
export interface SelectionMoveDetailPart {
  /**
   * A single operation or a list of operations to be applied to the selection
   * set. The operations are applied in the order they are specified. The
   * operations are applied to each selection in the selection set.
   */
  move?: SelectionMoveInstruction[];
}

/**
 * Specifies a single move operation to be applied to the selection set.
 */
export type SelectionMoveInstruction = [
  /**
   * Specifies the selection edge to perform the operation on.
   * 
   * - `'start'`: The start edge of the selection.
   * - `'end'`: The end edge of the selection.
   * - `'focus'`: The focus edge of the selection. If the selection does not have
   *   a focus edge (i.e. it is a {@link Range}, not a {@link Cursor}), the
   *   focus is assumed to be the `'end'` edge of the selection.
   * - `'anchor'`: The anchor edge of the selection. If the selection does not
   *    have an anchor edge (i.e. it is a {@link Range}, not a {@link Cursor}), the
   *    anchor is assumed to be the `'start'` edge of the selection.
   * 
   * @default 'focus'
   */
  edge: 'start' | 'end' | 'focus' | 'anchor',

  /**
   * Absolute position is specified using {@link Position} type. In which case
   * the next `len` field is ignored.
   *
   * The relative movement is specified using one of the string constants.
   * It specifies the unit of the movement. Possible movement units:
   *
   * - `'point'`: Moves by one Peritext anchor point. Each character has two
   *   anchor points, one from each side of the character.
   * - `'char'`: Moves by one character. Skips one visible character.
   * - `'word'`: Moves by one word. Skips all visible characters until the end
   *   of a word.
   * - `'line'`: Moves to the beginning or end of line. If UI API is provided,
   *   the line end is determined by a visual line wrap.
   * - `'vline'`: Moves to the beginning or end of "visual line", as the line
   *   is rendered on the screen, due to soft line breaks (line wrapping).
   * - `'vert'`: Moves cursor up or down by one line, works if UI
   *   API is provided. Determines the best position in the target line by
   *   finding the position which has the closest relative offset from the
   *   beginning of the line.
   * - `'block'`: Moves to the beginning or end of block, i.e. paragraph,
   *   blockquote, etc.
   * - `'all'`: Moves to the beginning or end of the document.
   * 
   * @todo Introduce 'vline', "visual line" - soft line break.
   */
  to: Position | 'point' | 'char' | 'word' | 'line' | 'vline' | 'vert' | 'block' | 'all',

  /**
   * Specify the length of the movement (the number of steps) in units
   * specified by the `to` field. If not specified, the default value is `0`,
   * which results in no movement. If the value is negative, the movement will
   * be backwards. If positive, the movement will be forwards.
   * 
   * @default 0
   */
  len?: number,

  /**
   * If `true`, the selection will be collapsed to a single point. The other
   * edge of the selection will be moved to the same position as the specified
   * edge.
   */
  collapse?: boolean,
];

/**
 * Event dispatched to insert text into the document.
 */
export interface InsertDetail extends SelectionDetailPart, SelectionMoveDetailPart {
  text: string;
}

/**
 * Event dispatched to delete text from the document. The deletion happens by
 * collapsing all selections to a single point and deleting the text and any
 * annotations contained in the selections. If all selections are already
 * collapsed, the moves specified in `move` are performed and all selections
 * are collapsed to a single point, while deleting all text and any annotations
 * contained in the selections.
 */
export interface DeleteDetail extends SelectionDetailPart, SelectionMoveDetailPart {}

/**
 * The `cursor` event is emitted when caret or selection is changed. The event
 * is applied to all cursors in the document. If the `at` field is specified,
 * a new cursor is created at that position, and all other cursors are removed.
 * 
 * The `at` field allows to insert a new cursors at a specified location in the
 * document and remove all other cursors. The `move` fields allows to perform
 * one or more move operations to all cursors in the document.
 *
 * ## Scenarios
 *
 * Move caret to a specific position in text:
 *
 * ```ts
 * {at: [10]}
 * ```
 *
 * Move caret relative to current position by 10 characters forwards:
 *
 * ```ts
 * {move: [['focus', 'char', 10, true]]}
 * ```
 *
 * Move caret only the focus edge of selections by 10 characters backwards:
 *
 * ```ts
 * {move: [['focus', 'char', -10]]}
 * ```
 *
 * Move caret to the beginning of the word at a specific position:
 *
 * ```ts
 * {at: [10], move: [['focus', 'word', -1, true]]}
 * ```
 *
 * Move caret to the end of word starting from the current position:
 *
 * ```ts
 * {move: [['focus', 'word', 1, true]]}
 * ```
 *
 * Move *anchor* edge of the selection to the beginning of the current line:
 *
 * ```ts
 * {move: [['anchor', 'line', -1]]}
 * ```
 * 
 * Move *anchor* edge of the selection exactly to after the second character in
 * the document:
 * 
 * ```ts
 * {move: [['anchor', 2]]}
 * ```
 *
 * Move *focus* edge of the selection to the end of a block at a specific position:
 *
 * ```ts
 * {at: [10], move: [['focus', 'block', 1]]}
 * ```
 *
 * Select the whole document:
 *
 * ```ts
 * {at: [0], move: [['focus', 'all', 1]]}
 * ```
 * 
 * or
 * 
 * ```ts
 * {move: [
 *   ['start', 'all', -1],
 *   ['end', 'all', 1],
 * ]}
 * ```
 *
 * The editor supports multiple cursors. To insert a new cursor at a specific
 * position, specify the `add` flag in addition to the `at` field. For example,
 * insert a new cursor at position 10:
 *
 * ```ts
 * {at: [10], add: true}
 * ```
 */
export interface CursorDetail extends SelectionDetailPart, SelectionMoveDetailPart {
  /**
   * If `true`, the selection will be added to the current selection set, i.e.
   * a new cursor will be inserted at the specified position into the document.
   * Otherwise, the selection specified by the `at` field will be used to
   * replace all other cursors in the document.
   * 
   * @default false
   */
  add?: boolean;
}

/**
 * Event dispatched to insert an inline rich-text annotation into the document.
 */
export interface FormatDetail extends SelectionDetailPart, SelectionMoveDetailPart {
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
export interface MarkerDetail extends SelectionDetailPart, SelectionMoveDetailPart {
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
 * Selection represents a range of text in the document. The selection is
 * represented as {@link Range}, or constructed from as a 2-tuple of
 * {@link Position} instances.
 */
export type Selection = EditorSelection<string>;

/**
 * A list of selection on top of which actions are performed.
 */
export type SelectionSet = IterableIterator<Range | Cursor> | Array<Range | Cursor>;

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
