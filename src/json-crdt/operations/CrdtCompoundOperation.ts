import type {LogicalTimestamp} from '../clock';
import type {ICrdtOperation} from './types';

/**
 * A compound operation may contain multiple atomic operations. Effectively
 * each operation withing the compound operation is still a separate atomic
 * operation, however, they are stored in a single object for efficiency. `span`
 * field contains the number of operations.
 */
export class CrdtCompoundOperation implements ICrdtOperation {
  constructor(public readonly id: LogicalTimestamp, public readonly span: number) {}
}
