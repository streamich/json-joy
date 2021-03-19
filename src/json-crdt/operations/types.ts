import type {LogicalTimestamp} from '../clock';

export interface ICrdtOperation {
  /**
   * Unique ID of this operation.
   */
  id: LogicalTimestamp;

  /**
   * The "length" of this operation. When possible we group multiple consecutive
   * operations into a single operation to optimize space and performance. For
   * example, if user inserts in one go three characters, we represent then by
   * a single operation which spans a length of 3, but implicitly those are
   * three separate insert operations.
   * 
   * The first operation ID is the timestamp in the `id` field. IDs of all
   * subsequent operations can be found by incrementing the timestamp by one
   * tick for every operation, respectively.
   */
  span?: number;

  /**
   * ID of some other operation after which this operation should be inserted in
   * the linked list. This is the ID of the operation our current operations "depends"
   * on. Some operations don't depend on other operations, those are the ones
   * that construct new data types (containers, JSON nodes).
   */
  after?: LogicalTimestamp;

  /**
   * Whether this operation was deleted by a subsequent delete operation. Or if
   * a subsequent operation delete one of the parents of this operation, which
   * effectively means that this operation is deleted as well.
   */
  deleted?: boolean;
}
