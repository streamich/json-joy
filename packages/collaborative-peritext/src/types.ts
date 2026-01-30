import type {ViewRange} from 'json-joy/lib/json-crdt-extensions/peritext/editor/types';
import type {Selection} from './Selection';

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
  set(content: ViewRange): void;

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

/**
 * Ephemeral data that is broadcasted about other peers in the editor.
 */
export type PeerData = [peerId: string, selections?: Record<DocumentId, Record<DocumentId, JsonCrdtSelection[]>>];

/**
 * Document ID, which is a globally unique identifier for a document.
 */
export type DocumentId = string;

/**
 * Location ID within the UI, in case some JSON CRDT is bound to multiple
 * places in the UI.
 */
export type UiLocationId = string;

export type JsonCrdtSelection = RgaSelection | AnySelection | ObjSelection | VecSelection;

export type NodeSelection<Type extends number> = [type: Type, nodeId: JsonCrdtId];

/** Selection within an RGA node, such as a "str", "arr", or "bin" nodes. */
export type RgaSelection = [...NodeSelection<0>, ...JsonCrdtCursor];

/** Selects a whole JSON CRDT node, any node. */
export type AnySelection = [...NodeSelection<1>];

/** Selects an "obj" node with ability to select a specific node. */
export type ObjSelection = [...NodeSelection<2>, key?: string];

/** Selects a "vec" node with ability to select a specific index. */
export type VecSelection = [...NodeSelection<3>, index?: number];

/**
 * The selection range of a peer. `anchor` is the starting point of the selection,
 * and `focus` is the ending point of the selection. If `focus` is not provided,
 * the selection is a caret (a single point).
 */
export type JsonCrdtCursor = [anchor: JsonCrdtRgaPoint, focus?: JsonCrdtRgaPoint];

export type JsonCrdtRgaPoint = [
  id: JsonCrdtIdShorthand,
  /** Zero means point is anchored to the left of the character, one means right. */
  anchor?: 0 | 1,
];

export type JsonCrdtId = [time: number, sid: number];
export type JsonCrdtIdShorthand = [time: number, sid?: number];
