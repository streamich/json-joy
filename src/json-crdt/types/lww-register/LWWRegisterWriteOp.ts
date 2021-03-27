import {LogicalTimestamp} from "../../../json-crdt-patch/clock";

/**
 * Writes a value to LWW Register.
 */
export class LWWRegisterWriteOp {
  constructor(public readonly id: LogicalTimestamp, public readonly value: LogicalTimestamp) {}
}
