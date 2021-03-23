import type {LogicalTimestamp} from '../../json-crdt-patch/clock';
import {SetRootOperation} from '../../json-crdt-patch/operations/SetRootOperation';
import {UNDEFINED_ID} from '../../json-crdt-patch/constants';

export class DocRootType {
  public last: SetRootOperation | null = null;

  constructor(public readonly id: LogicalTimestamp) {}

  public insert(op: SetRootOperation) {
    if (!this.last) {
      this.last = op;
      return;
    }
    if (op.id.compare(this.last.id) > 0)
      this.last = op;
  }

  public toValue(): LogicalTimestamp {
    const {last} = this;
    return last ? last.value : UNDEFINED_ID;
  }
}
