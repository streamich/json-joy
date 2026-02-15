import type {StrApi} from 'json-joy/lib/json-crdt';
import type {Selection} from './Selection';

/**
 * Represents a single change in the editor. It is a 3-tuple of `[position,
 * remove, insert]`, where `position` is the position of the change, `remove`
 * is the number of characters removed, and `insert` is the string inserted.
 */
export type SimpleChange = [position: number, remove: number, insert: string];

/**
 * A 3-tuple of `[position, remove, insert]`, which represents a single range or
 * caret selection in the editor. Where `start` and `end` are character offsets
 * in the text, and `direction` is either `-1`, `0`, or `1`, where `-1`
 * indicates that the selection is backwards, `1` indicates that the
 * selection is forwards, and `0` is used for all other cases.
 */
export type EditorSelection = [start: number, end: number, direction: -1 | 0 | 1];

/**
 * A facade for the editor, which is used by the binding to communicate with
 * the editor. The editor can be any plain text editor, such as a textarea
 * or an input element, or a code editor, such as CodeMirror or Monaco.
 * 
 * The more methods are implemented, the more granular the binding can be when
 * syncing changes between the model and the editor. The minimal implementation
 * only requires the `get` and `set` methods implemented, which will make the
 * collaborative editing binding work in a basic way.
 */
export interface EditorFacade {
  // ----------------------------------------------------------------- Contents

  /**
   * Returns the text content of the editor.
   */
  get(): string;

  /**
   * Overwrites the editor content with the given text.
   * @param text Raw text to set.
   */
  set(text: string): void;

  /**
   * Inserts text at the given position. When implemented, this method is used
   * for granular model-to-editor sync of remote changes.
   * @param position Position to insert text at.
   * @param text Raw text to insert.
   */
  ins?(position: number, text: string): void;

  /**
   * Deletes text at the given position. When implemented, this method is used
   * for granular model-to-editor sync of remote changes.
   * @param position Position to delete text at.
   * @param length Number of characters to delete.
   */
  del?(position: number, length: number): void;

  /**
   * Emits a change event when the text changes. The event is emitted with
   * a `SimpleChange` tuple, which is a tuple of `[position, remove, insert]`,
   * where `position` is the position of the change, `remove` is the number
   * of characters removed, and `insert` is the string inserted.
   *
   * If a change happened, but it is too complex or impossible to represent by
   * the `SimpleChange` tuple, the `void` value can be emitted instead. For the
   * most basic implementation, one can always emit `null` on every change.
   */
  onchange?: (change: SimpleChange[] | void, verify?: boolean) => void;

  /**
   * Length of text. Should return the same result as `.get().length`,
   * but it is possible to implement length retrieval in a more efficient way
   * here.
   */
  getLength?(): number;

  // ---------------------------------------------------------------- Selection

  /**
   * Called when the selection changes.
   */
  onselection?: () => void;

  /**
   * Returns the current selection.
   */
  getSelection?(): EditorSelection | null;

  /**
   * Sets the editor selection.
   */
  setSelection?(start: number, end: number, direction: -1 | 0 | 1): void;

  /**
   * This property does not have to be set, it is set by the binding once it is
   * created. It store the last know selection, which can be used to generate
   * `SimpleChange` events.
   */
  selection?: Selection;

  // ---------------------------------------------------------------- Lifecycle

  /**
   * Binding calls this method when it is no longer needed. This method should
   * clean up any allocated resources, such as event listeners.
   */
  dispose?(): void;
}

/**
 * Represents the model of a collaborative (JSON CRDT) string.
 */
export type CollaborativeStr = Pick<StrApi, 'view' | 'ins' | 'del' | 'findId' | 'findPos'> & {
  api: Pick<StrApi['api'], 'transaction'> & {
    onChange: {
      listen: (callback: () => void) => () => void;
    };
    model: {tick: number};
  };
};
