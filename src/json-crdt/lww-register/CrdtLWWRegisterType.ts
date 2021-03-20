import type {CrdtType} from '../types';
import {LogicalTimestamp} from '../clock';
import {DoublyLinkedList} from '../doubly-linked-list';
import {UNDEFINED_ID} from '../constants';
import {CrdtLWWRegisterWriteOperation} from './CrdtLWWRegisterWriteOperation';

export class CrdtLWWRegisterType implements DoublyLinkedList<CrdtLWWRegisterWriteOperation> {
  /**
   * The current value of the of the register. When undefined, means the value
   * has not been set yet, or was already deleted.
   */
  public value: LogicalTimestamp = UNDEFINED_ID;


  private start: null | CrdtLWWRegisterWriteOperation = null;
  private end: null | CrdtLWWRegisterWriteOperation = null;

  constructor(public readonly id: LogicalTimestamp) {}

  public insert(op: CrdtLWWRegisterWriteOperation, afterOp?: CrdtLWWRegisterWriteOperation): void {
    op.type = this;
    if (!afterOp) {
      this.start = this.end = op;
      this.value = op.value;
      return;
    }
    while (afterOp.right && (op.id.compare((afterOp.right as CrdtLWWRegisterWriteOperation).id) >= 0)) 
      afterOp = afterOp.right as CrdtLWWRegisterWriteOperation;
    const isEndInsertion = this.end === afterOp;
    if (isEndInsertion) {
      this.value = op.value;
      this.end = op;
      op.right = null;
    } else {
      op.right = afterOp.right;
      afterOp.right!.left = op;
    }
    afterOp.right = op;
    op.left = afterOp;
    return undefined;
  }

  public merge(type: CrdtLWWRegisterType): void {}

  public makeWriteOperation(id: LogicalTimestamp, value: LogicalTimestamp): CrdtLWWRegisterWriteOperation {
    const {end} = this;
    const after = end ? end.id : this.id;
    const op = new CrdtLWWRegisterWriteOperation(id, after, value);
    return op;
  }

  public toValue(): LogicalTimestamp {
    const {value, doc} = this;
    if (value === UNDEFINED_ID) return undefined;
    const operation = doc.ops.get(value) as CrdtType;
    return operation.toJson();
  }
}
