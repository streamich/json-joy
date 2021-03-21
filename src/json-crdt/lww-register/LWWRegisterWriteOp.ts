import type {LogicalTimestamp} from '../clock';

/**
 * Writes a value to LWW Register.
 */
export class LWWRegisterWriteOp {
  public prev: LWWRegisterWriteOp | null = null;

  constructor(public readonly id: LogicalTimestamp, public readonly value: LogicalTimestamp) {}
}
