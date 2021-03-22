import type {LogicalTimestamp} from '../../json-crdt-patch/clock';
import {UNDEFINED_ID} from '../../json-crdt-patch/constants';
import {LWWRegisterWriteOp} from './LWWRegisterWriteOp';

export class LWWRegisterType {
  private last: LWWRegisterWriteOp | null = null;

  constructor(public readonly id: LogicalTimestamp) {}

  public insert(op: LWWRegisterWriteOp) {
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
