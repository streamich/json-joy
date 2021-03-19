import type {CrdtType, JsonNode} from '../types';
import type {Document} from '../document';
import {LogicalTimestamp} from '../clock';
import {DoublyLinkedList} from '../doubly-linked-list';
import {UNDEFINED_ID} from '../constants';
import {CrdtLWWRegisterWriteOperation} from './CrdtLWWRegisterWriteOperation';
import {ICrdtOperation} from '../operations/types';

export class CrdtLWWRegisterType extends DoublyLinkedList<CrdtLWWRegisterWriteOperation> implements JsonNode, CrdtType {
  /**
   * The current value of the of the register. When undefined, means the value
   * has not been set yet, or was already deleted.
   */
  public value: LogicalTimestamp = UNDEFINED_ID;

  constructor(private readonly doc: Document, public readonly id: LogicalTimestamp) {
    super();
  }

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

  public makeWriteOperation(value: LogicalTimestamp): CrdtLWWRegisterWriteOperation {
    const {doc, end} = this;
    const id = doc.clock.tick(1);
    const after = end ? end.id : this.id;
    const op = new CrdtLWWRegisterWriteOperation(id, after, value);
    return op;
  }

  public toJson(): unknown {
    const {value, doc} = this;
    if (value === UNDEFINED_ID) return undefined;
    const operation = doc.ops.get(value) as CrdtType;
    return operation.toJson();
  }
}
