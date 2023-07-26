import type {ITimestampStruct} from './clock';
import type {Identifiable} from './Identifiable';

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
  name(): string;

  toString(tab?: string): string;
}

export interface IJsonCrdtPatchEditOperation extends IJsonCrdtPatchOperation {
  /**
   * Object which is being edited.
   */
  obj: ITimestampStruct;
}
