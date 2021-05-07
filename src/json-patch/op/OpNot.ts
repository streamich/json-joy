import type {CompactNotOp} from '../codec/compact/types';
import {AbstractSecondOrderPredicateOp} from './AbstractSecondOrderPredicateOp';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationNot, PredicateOperation} from '../types';
import {OPCODE} from '../constants';
import {Path, formatJsonPointer} from '../../json-pointer';

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

  public toJson(): OperationNot {
    const op: OperationNot = {
      op: 'not',
      path: formatJsonPointer(this.path),
      apply: this.ops.map((op) => op.toJson()) as PredicateOperation[],
    };
    return op;
  }

  public toPacked(): CompactNotOp {
    return [OPCODE.not, this.path, this.ops.map((op) => op.toPacked())];
  }
}
