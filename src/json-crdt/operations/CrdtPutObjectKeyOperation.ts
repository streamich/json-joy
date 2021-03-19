import type {LogicalTimestamp} from '../clock';
import type {ICrdtOperation} from './types';

/**
 * This operation sets or deletes an 
 */
export class CrdtPutObjectKeyOperation implements ICrdtOperation {
  /**
   * The delete operation is always a single operation. However, this single deletion
   * operation can delete a range of operations, that range is recorded in the
   * `deletionSpan` property.
   */
  public readonly span = 1;

  constructor(public readonly id: LogicalTimestamp, public readonly deleteStartId: LogicalTimestamp, public readonly deletionSpan: number) {}
}
