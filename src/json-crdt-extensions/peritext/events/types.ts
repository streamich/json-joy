import type {Point} from '../../../json-crdt-extensions/peritext/rga/Point';
import type {EditorPosition, EditorSelection} from '../../../json-crdt-extensions/peritext/editor/types';
import type {SliceTypeSteps, TypeTag} from '../../../json-crdt-extensions/peritext/slice/types';
import type {ITimestampStruct, Patch} from '../../../json-crdt-patch';
import type {Cursor} from '../../../json-crdt-extensions/peritext/editor/Cursor';
import type {Range} from '../../../json-crdt-extensions/peritext/rga/Range';
import type {PersistedSlice} from '../slice/PersistedSlice';

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
 * Specifies the concrete slice to be used
 */
export interface SliceDetailPart {
  /**
   * An instance of {@link PersistedSlice} or its ID {@link ITimestampStruct} used
   * to retrieve the slice from the document.
   */
  slice?: PersistedSlice | ITimestampStruct;
}

/**
 * The {@link RangeEventDetail} base interface is used by events
 * which apply change to a range (selection) of text in the document. Usually,
 * the events will apply changes to all ranges in the selection, some event may
 * use only the first range in the selection (like the "buffer" event).
 *
 * Selection-based events work by first constructing a *selection set*, which
 * is a list of {@link Range} or {@link Cursor} instances. They then apply the
 * event to each selection in the selection set.
 *
 * The selection set is constructed by using the `at` field to specify a single
 * {@link Range} or, if not specified, all {@link Cursor} instances in the
 * document are used. Then the `move` field is used to specify one or more move
 * operations to be applied to each range in the selection set.
 */
export interface RangeEventDetail extends SelectionDetailPart, SelectionMoveDetailPart {}

/**
 * Event dispatched to insert text into the document.
 */
export interface InsertDetail extends RangeEventDetail {
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
export interface DeleteDetail extends RangeEventDetail {
  /**
   * If true and `at` is specified, the resulting `at` range will be set
   * as the document cursor.
   */
  add?: boolean;
}

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
export interface CursorDetail extends RangeEventDetail {
  /**
   * If `true`, the selection will be added to the current selection set, i.e.
   * a new cursor will be inserted at the specified position into the document.
   * Otherwise, the selection specified by the `at` field will be used to
   * replace all other cursors in the document.
   *
   * @default false
   */
  add?: boolean;

  /**
   * Swap cursor anchor and focus points. Performed after the move operations
   * are applied to the selection set. The flip is applied only to the existing
   * cursors in the selection set, not to the new cursor created by the `at`
   * field.
   */
  flip?: boolean;

  /**
   * If `true`, all cursors in the document will be removed.
   */
  clear?: boolean;
}

/**
 * Event dispatched to insert an inline rich-text annotation into the document.
 */
export interface FormatDetail extends RangeEventDetail, SliceDetailPart {
  /**
   * The action to perform.
   *
   * - The `'ins'` action inserts a new annotation into the document.
   * - The `'tog'` action toggles the annotation on or off, for annotations of
   *   stack behavior `'one'`. For other annotations, it works the same as
   *   the `'ins'` action.
   * - The `'del'` action removes all annotations that intersect with
   *   any part of the selection set. If action is `'del'`, and the `slice` field
   *   is specified, only that slice will be deleted.
   * - The `'erase'` action tries to "erase" all annotations that intersect with
   *   any part of the selection set. It works by deleting all annotations which
   *   are contained. For annotations, which partially intersect with the
   *   selection set, a corresponding slice with "erase" stacking behavior is
   *   inserted, which logically removes the annotation from the document.
   * - The `'upd'` action updates the formatting data using a diff with the
   *   current value. If the `slice` field is specified, the annotation will be
   *   updated to the specified slice. If the `slice` field is not specified,
   *   the `data` will be updated on the first annotation in the selection set
   *   with the same `type`.
   * - The `'set'` action ovewrites the formatting data of the slice specified
   *   by the `slice` field with the `data` field.
   */
  action: 'ins' | 'tog' | 'del' | 'erase' | 'upd' | 'set';

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
   * Specifies the stacking behavior of the annotation.
   *
   * - If `'many'`, the annotation of this type will be stacked on top of each
   *   other, and all of them will be applied to the text, with the last
   *   annotation on top.
   * - If `'one'`, the annotation is not stacked, only one such annotation can
   *   be applied per character. The last annotation "wins", i.e. the last
   *   annotation in the document will be applied to the text.
   * - The `'erase'` behavior is used to logically remove the `'many`' or
   *   `'one'` annotation from the the given range. It works by logically
   *   "erasing" all `'many'` or `'one'` annotations with the same `type`,
   *   which were applied to the given range before.
   *
   * @default 'one'
   */
  stack?: 'one' | 'many' | 'erase';

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
 *
 * ## Scenarios
 *
 * To split a block (say, a paragraph) at a specific position, you simply insert
 * a new block marker at that position.
 *
 * ```ts
 * {action: 'ins', type: SliceTypeTag.p}
 * {action: 'ins', type: 'p'}
 * {action: 'ins', type: '<p>'}
 * {action: 'ins', type: ['p']}
 * {action: 'ins', type: [['p', 0, {indetation: 1}]]}
 * ```
 *
 * To remove all markers at the current selection, use the `'del'` action.
 *
 * ```ts
 * {action: 'del'}
 * ```
 *
 * To remove a specific marker identified by its {@link PersistedSlice} reference
 * pass the slice or its ID in the `slice` field:
 *
 * ```ts
 * {action: 'del', slice: slice}
 * {action: 'del', slice: slice.id}
 * ```
 *
 * To increase nesting level of a block, you have to insert new tags into an
 * existing block type:
 *
 * ```ts
 * {
 *   action: 'upd',
 *   select: 'type',
 *   ops: [
 *     ['add', '/1', [
 *       ['ul', 0, {type: 'task-list'}],
 *       ['li', 1, {checked: false}],
 *     ]],
 *   ],
 * }
 * ```
 *
 * ... delete tags:
 *
 * ```ts
 * {
 *   action: 'upd',
 *   select: 'type',
 *   ops: [
 *     ['remove', '/1', 2],
 *   ],
 * }
 * ```
 *
 * ... change discriminant at index:
 *
 * ```ts
 * {
 *   action: 'upd',
 *   select: ['tag', 0],
 *   ops: [
 *     ['replace', '/1', 1],
 *   ],
 * }
 * ```
 *
 * ... change tag data at index:
 *
 * ```ts
 * {
 *   action: 'upd',
 *   select: ['data', 1],
 *   ops: [
 *     ['replace', '/checked', true],
 *   ],
 * }
 * ```
 */
export interface MarkerDetail extends RangeEventDetail, SliceDetailPart {
  /**
   * The action to perform.
   */
  action: 'ins' | 'del' | 'upd';

  /**
   * The type tag applied to the new block, if the action is `'ins'`. If the
   * action is `'upd'`, the type tag is used to update the block type.
   *
   * @default SliceType.Paragraph
   */
  type?: TypeTag | SliceTypeSteps;

  /**
   * Custom data stored with the marker.
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
export interface BufferDetail extends RangeEventDetail {
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
export type SelectionSet = Array<Range | Cursor>;

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
