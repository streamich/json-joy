import type {LogicalTimestamp} from '../clock';
import type {ICrdtOperation} from './types';

/**
 * Writes a value to LWW Register.
 */
export class CrdtLWWRegisterWriteOperation implements ICrdtOperation {
  constructor(public readonly id: LogicalTimestamp, value: LogicalTimestamp) {}
}
