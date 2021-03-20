import type {IJsonCrdtPatchOperation} from "./types";
import type {LogicalTimestamp} from '../../json-crdt/clock';

export class DeleteArrayElementsOperation implements IJsonCrdtPatchOperation {
  /**
   * 
   * @param id ID of this operation.
   * @param after First array element to delete.
   * @param span Number of elements to delete with sequentially increasing IDs.
   */
  constructor(public readonly id: LogicalTimestamp, public readonly after: LogicalTimestamp, public readonly span: number) {}

  public getSpan(): number {
    return this.span;
  }
}
