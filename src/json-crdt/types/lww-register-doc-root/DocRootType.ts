import type {LogicalTimestamp} from '../../../json-crdt-patch/clock';
import {SetRootOperation} from '../../../json-crdt-patch/operations/SetRootOperation';
import {UNDEFINED_ID} from '../../../json-crdt-patch/constants';

export class DocRootType {
  public last: SetRootOperation | null = null;

  constructor(public readonly id: LogicalTimestamp) {}

  /**
   * @returns Previous value, if any.
   */
  public insert(op: SetRootOperation): null | LogicalTimestamp {
    if (!this.last) {
      this.last = op;
      return null;
    }
    if (op.id.compare(this.last.id) > 0) {
      const lastValue = this.last.value;
      this.last = op;
      return lastValue;
    }
    return null;
  }

  public toValue(): LogicalTimestamp {
    const {last} = this;
    return last ? last.value : UNDEFINED_ID;
  }
}
