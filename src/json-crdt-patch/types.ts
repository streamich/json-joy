import type {ITimestampStruct} from './clock';
import type {JsonCrdtPatchMnemonic} from './codec/verbose';

/**
 * Something in the document that can be identified by ID. All operations have
 * IDs and operations result into JSON nodes and chunks, which also have IDs.
 */
export interface Identifiable {
  /**
   * Unique ID within a document.
   */
  id: ITimestampStruct;

  /**
   * Sometimes an Identifiable can be a compound entity, which holds multiple
   * entries with sequentially growing timestamps. In this case `span` represents
   * the number of entries.
   */
  span?(): number;

  /**
   * Used for debugging.
   */
  toString(tab?: string): string;
}

/**
 * Represents a common interface for all JSON CRDT patch operations.
 */
export interface IJsonCrdtPatchOperation extends Identifiable {
  /**
   * Unique ID of that operation within the document, Lamport timestamp.
   */
  id: ITimestampStruct;

  /**
   * Some operations, such as array and string insert/delete operations are
   * compound a single operation instance effectively represents multiple
   * operations (one per character or array element).
   *
   * This method returns the effective number of operations.
   */
  span(): number;

  /**
   * User friendly name of the operation.
   */
  name(): JsonCrdtPatchMnemonic;

  /**
   * Returns a textual human-readable representation of the operation.
   *
   * @param tab String to use for indentation.
   */
  toString(tab?: string): string;
}

/**
 * Represents a JSON CRDT patch operation which edits an existing object.
 */
export interface IJsonCrdtPatchEditOperation extends IJsonCrdtPatchOperation {
  /**
   * Object which is being edited.
   */
  obj: ITimestampStruct;
}
