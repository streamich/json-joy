import type {LogicalTimestamp} from '../../json-crdt/clock';

export interface IJsonCrdtPatchOperation {
  /**
   * Unique ID of that operation within the document, Lamport timestamp.
   */
  id: LogicalTimestamp;

  /**
   * Some operations, such as array and string insert/delete operations are
   * compound a single operation instance effectively represents multiple
   * operations (one per character or array element).
   * 
   * This method returns the effective number of operations.
   */
  getSpan(): number;
}