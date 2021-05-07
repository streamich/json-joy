import type {CompactAndOp} from '../codec/compact/types';
import {AbstractSecondOrderPredicateOp} from './AbstractSecondOrderPredicateOp';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationAnd, PredicateOperation} from '../types';
import {OPCODE} from '../constants';
import {Path, formatJsonPointer} from '../../json-pointer';
import {AbstractOp} from './AbstractOp';
import {IMessagePackEncoder} from '../../json-pack/Encoder/types';

/**
 * @category JSON Predicate
 */
export class OpAnd extends AbstractSecondOrderPredicateOp<'and'> {
  constructor(path: Path, public readonly ops: AbstractPredicateOp[]) {
    super(path, ops);
  }

  public op() {
    return 'and' as 'and';
  }

  public test(doc: unknown): boolean {
    for (const op of this.ops) if (!op.test(doc)) return false;
    return true;
  }

  public toJson(parent?: AbstractOp): OperationAnd {
    const op: OperationAnd = {
      op: 'and',
      path: formatJsonPointer(parent ? this.path.slice(parent.path.length) : this.path),
      apply: this.ops.map((op) => op.toJson(this)) as PredicateOperation[],
    };
    return op;
  }

  public toCompact(parent?: AbstractOp): CompactAndOp {
    return [OPCODE.and, parent ? this.path.slice(parent.path.length) : this.path, this.ops.map((op) => op.toCompact(this))];
  }

  public encode(encoder: IMessagePackEncoder, parent?: AbstractOp) {
    const path = parent ? this.path.slice(parent.path.length) : this.path;
    encoder.encodeArrayHeader(3);
    encoder.u8(OPCODE.and);
    encoder.encodeArray(path as unknown[]);
    const length = this.ops.length;
    encoder.encodeArrayHeader(length);
    for (let i = 0; i < length; i++) this.ops[i].encode(encoder, this);
  }
}
