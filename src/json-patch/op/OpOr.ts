import {AbstractSecondOrderPredicateOp} from './AbstractSecondOrderPredicateOp';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationOr, PredicateOperation} from '../types';
import {OPCODE} from '../constants';
import {Path, formatJsonPointer} from '../../json-pointer';
import {CompactOrOp} from '../compact';

/**
 * @category JSON Predicate
 */
export class OpOr extends AbstractSecondOrderPredicateOp<'or'> {
  constructor(path: Path, public readonly ops: AbstractPredicateOp[]) {
    super(path, ops);
  }

  public op() {
    return 'or' as 'or';
  }

  public test(doc: unknown): boolean {
    for (const op of this.ops) if (op.test(doc)) return true;
    return false;
  }

  public toJson(): OperationOr {
    const op: OperationOr = {
      op: 'or',
      path: formatJsonPointer(this.path),
      apply: this.ops.map((op) => op.toJson()) as PredicateOperation[],
    };
    return op;
  }

  public toPacked(): CompactOrOp {
    return [OPCODE.or, this.path, this.ops.map((op) => op.toPacked())];
  }
}
