import {Timestamp} from '../clock';
import type {IJsonCrdtPatchOperation} from './types';

export class DeleteOperation implements IJsonCrdtPatchOperation {
  /**
   * @param id ID of this operation.
   * @param obj Object in which to delete something.
   * @param after ID of the first operation to be deleted.
   * @param span Number of operations to delete sequentially increasing IDs.
   */
  constructor(
    public readonly id: Timestamp,
    public readonly obj: Timestamp,
    public readonly after: Timestamp,
    public readonly length: number,
  ) {}

  public span(): number {
    return this.length;
  }

  public getMnemonic(): string {
    return 'del';
  }
}
