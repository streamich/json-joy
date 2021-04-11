import {LogicalTimestamp} from '../clock';
import type {IJsonCrdtPatchOperation} from './types';

export class DeleteOperation implements IJsonCrdtPatchOperation {
  /**
   * @param id ID of this operation.
   * @param obj Object in which to delete something.
   * @param after ID of the first operation to be deleted.
   * @param span Number of operations to delete sequentially increasing IDs.
   */
  constructor(
    public readonly id: LogicalTimestamp,
    public readonly obj: LogicalTimestamp,
    public readonly after: LogicalTimestamp,
    public readonly length: number,
  ) {}

  public span(): number {
    return this.length;
  }

  public getMnemonic(): string {
    return 'del';
  }
}
