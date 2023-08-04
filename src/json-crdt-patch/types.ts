import type {ITimestampStruct} from './clock';
import type {JsonCrdtPatchMnemonic} from './codec/verbose';
import type {Identifiable} from './Identifiable';

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
