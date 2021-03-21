import {LogicalTimestamp} from "../clock";
import type {IJsonCrdtPatchOperation} from "./types";

export class DeleteOperation implements IJsonCrdtPatchOperation {
  /**
   * @param id ID of this operation.
   * @param after ID of the first operation to be deleted.
   * @param span Number of operations to delete sequentially increasing IDs.
   */
  constructor(public readonly id: LogicalTimestamp, public readonly after: LogicalTimestamp, public readonly span: number) {}

  public getSpan(): number {
    return this.span;
  }

  public getMnemonic(): string {
    return 'del';
  }
}
