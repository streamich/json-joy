import type {PeritextApi} from 'json-joy/lib/json-crdt-extensions';
import type {ViewRange} from 'json-joy/lib/json-crdt-extensions/peritext/editor/types';
import type {Fragment} from 'json-joy/lib/json-crdt-extensions/peritext/block/Fragment';
import type {Range} from 'json-joy/lib/json-crdt-extensions/peritext/rga/Range';

/**
 * Represents a single change in the editor. It is a 3-tuple of `[position,
 * remove, insert]`, where `position` is the position of the change, `remove`
 * is the number of characters removed, and `insert` is the string inserted.
 */
export type SimpleChange = [position: number, remove: number, insert: string];

// TODO: This should be a Peritext range view.
// /**
//  * A 3-tuple of `[position, remove, insert]`, which represents a single range or
//  * caret selection in the editor. Where `start` and `end` are character offsets
//  * in the text, and `direction` is either `-1`, `0`, or `1`, where `-1`
//  * indicates that the selection is backwards, `1` indicates that the
//  * selection is forwards, and `0` is used for all other cases.
//  */
// export type EditorSelection = [start: number, end: number, direction: -1 | 0 | 1];

export type PeritextRef = () => PeritextApi;

export type PeritextSelection = [range: Range<string>, startIsAnchor: boolean];

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

  // /**
  //  * Inserts text at the given position. When implemented, this method is used
  //  * for granular model-to-editor sync of remote changes.
  //  * @param position Position to insert text at.
  //  * @param text Raw text to insert.
  //  */
  // ins?(position: number, text: string): void;

  // /**
  //  * Deletes text at the given position. When implemented, this method is used
  //  * for granular model-to-editor sync of remote changes.
  //  * @param position Position to delete text at.
  //  * @param length Number of characters to delete.
  //  */
  // del?(position: number, length: number): void;

  /**
   * Emits a change event when content changes. The event is emitted with
   * a `SimpleChange` tuple, which is a tuple of `[position, remove, insert]`,
   * where `position` is the position of the change, `remove` is the number
   * of characters removed, and `insert` is the string inserted.
   *
   * If a change happened, but it is too complex or impossible to represent by
   * the `SimpleChange` tuple, the `void` value can be emitted instead. For the
   * most basic implementation, one can always emit `null` on every change.
   */
  onchange?: (change: SimpleChange[] | void, verify?: boolean) => (PeritextRef | void);

  // /**
  //  * Length of text. Should return the same result as `.get().length`,
  //  * but it is possible to implement length retrieval in a more efficient way
  //  * here.
  //  */
  // getLength?(): number;

  // ---------------------------------------------------------------- Selection

  /**
   * Called when the selection changes.
   */
  onselection?: () => void;

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
