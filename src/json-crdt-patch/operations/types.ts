import {LogicalTimestamp} from "../clock";
import {Identifiable} from "../types";

export interface IJsonCrdtPatchOperation extends Identifiable {
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

  /**
   * User friendly name of the operation.
   */
  getMnemonic(): string;
}
