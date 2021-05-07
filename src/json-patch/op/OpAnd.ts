import type {CompactAndOp} from '../codec/compact/types';
import {AbstractSecondOrderPredicateOp} from './AbstractSecondOrderPredicateOp';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationAnd, PredicateOperation} from '../types';
import {OPCODE} from '../constants';
import {Path, formatJsonPointer} from '../../json-pointer';

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

  public toJson(): OperationAnd {
    const op: OperationAnd = {
      op: 'and',
      path: formatJsonPointer(this.path),
      apply: this.ops.map((op) => op.toJson()) as PredicateOperation[],
    };
    return op;
  }

  public toPacked(): CompactAndOp {
    return [OPCODE.and, this.path, this.ops.map((op) => op.toPacked())];
  }
}
