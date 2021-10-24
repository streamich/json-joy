import type {CompactNotOp} from '../codec/compact/types';
import {AbstractSecondOrderPredicateOp} from './AbstractSecondOrderPredicateOp';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationNot, PredicateOperation} from '../types';
import {OPCODE} from '../constants';
import {Path, formatJsonPointer} from '../../json-pointer';
import {AbstractOp} from './AbstractOp';
import {IMessagePackEncoder} from '../../json-pack/Encoder/types';

/**
 * @category JSON Predicate
 */
export class OpNot extends AbstractSecondOrderPredicateOp<'not'> {
  constructor(path: Path, public readonly ops: AbstractPredicateOp[]) {
    super(path, ops);
  }

  public op() {
    return 'not' as 'not';
  }

  public test(doc: unknown): boolean {
    for (const op of this.ops) if (op.test(doc)) return false;
    return true;
  }

  public toJson(parent?: AbstractOp): OperationNot {
    const op: OperationNot = {
      op: 'not',
      path: formatJsonPointer(parent ? this.path.slice(parent.path.length) : this.path),
      apply: this.ops.map((op) => op.toJson(this)) as PredicateOperation[],
    };
    return op;
  }

  public toCompact(parent?: AbstractOp): CompactNotOp {
    return [
      OPCODE.not,
      parent ? this.path.slice(parent.path.length) : this.path,
      this.ops.map((op) => op.toCompact(this)),
    ];
  }

  public encode(encoder: IMessagePackEncoder, parent?: AbstractOp) {
    encoder.encodeArrayHeader(3);
    encoder.u8(OPCODE.not);
    encoder.encodeArray(parent ? this.path.slice(parent.path.length) : (this.path as unknown[]));
    const length = this.ops.length;
    encoder.encodeArrayHeader(length);
    for (let i = 0; i < length; i++) this.ops[i].encode(encoder, this);
  }
}
