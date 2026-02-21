import type {PeritextApi} from 'json-joy/lib/json-crdt-extensions';
import type {ViewRange} from 'json-joy/lib/json-crdt-extensions/peritext/editor/types';
import type {Fragment} from 'json-joy/lib/json-crdt-extensions/peritext/block/Fragment';
import type {Range} from 'json-joy/lib/json-crdt-extensions/peritext/rga/Range';

/** Reference to the Peritext JSON CRDT node which stores the rich-text document. */
export type PeritextRef = () => PeritextApi;

/**
 * A stable selection in CRDT-space, represented as a tuple of `[range,
 * startIsAnchor]`, where `range` is a `Range<string>` representing the selected
 * range in the CRDT, and `startIsAnchor` is a boolean indicating whether the
 * start of the range is the anchor (true) or the head (false).
 *
 * The `Range` (start, end) ends are always ordered such that start <= end,
 * regardless of the actual selection direction. To construct the
 * range with start/end correctly ordered use `Peritext.rangeFromPoints()`.
 */
export type PeritextSelection = [range: Range<string>, startIsAnchor: boolean];

/**
 * Represents a single change in the editor. It is a 3-tuple of `[position,
 * remove, insert]`, where `position` is the position of the change, `remove`
 * is the number of characters removed, and `insert` is the string inserted.
 */
export type PeritextOperation = [position: number, remove: number, insert: string];

/**
 * A facade for the rich-text editor, which is used by the binding to
 * communicate with the editor. The editor can be any rich-text editor that
 * implements this interface.
 *
 * The more methods are implemented, the more granular the binding can be when
 * syncing changes between the model and the editor.
 */
export interface RichtextEditorFacade {
  // ----------------------------------------------------------------- Contents

  /**
   * Returns the current rich-text content of the editor.
   */
  get(): ViewRange;

  /**
   * Overwrites the editor content with the given state.
   */
  set(fragment: Fragment<string>): void;

  /**
   * Emits a change event when content changes. The event is emitted with
   * a `PeritextOperation` tuple, which is a tuple of `[position, remove, insert]`,
   * where `position` is the position of the change, `remove` is the number
   * of characters removed, and `insert` is the string inserted.
   *
   * If a change happened, but it is too complex or impossible to represent by
   * the `PeritextOperation` tuple, the `void` value can be emitted instead. For the
   * most basic implementation, one can always emit `null` on every change.
   */
  onchange?: (change: PeritextOperation | void) => PeritextRef | void;

  // ---------------------------------------------------------------- Selection

  /**
   * Convert current ProseMirror selection to a stable Peritext selection in
   * CRDT-space.
   */
  getSelection?(peritext: PeritextApi): PeritextSelection | undefined;

  /**
   * Set ProseMirror selection from a stable Peritext CRDT-space selection.
   */
  setSelection?(peritext: PeritextApi, range: PeritextSelection[0], startIsAnchor: PeritextSelection[1]): void;

  // ---------------------------------------------------------------- Lifecycle

  /**
   * Binding calls this method when it is no longer needed. This method should
   * clean up any allocated resources, such as event listeners.
   */
  dispose?(): void;
}
