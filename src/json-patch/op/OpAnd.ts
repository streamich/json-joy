import {AbstractSecondOrderPredicateOp} from './AbstractSecondOrderPredicateOp';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationAnd, PredicateOperation} from '../types';
import {OPCODE} from '../constants';
import {Path, formatJsonPointer} from '../../json-pointer';
import {CompactAndOp} from '../compact';

/**
 * @category JSON Predicate
 */
export class OpAnd extends AbstractSecondOrderPredicateOp<'and'> {
  constructor(path: Path, public readonly ops: AbstractPredicateOp[]) {
    super('and', path, ops);
  }

  public test(doc: unknown): boolean {
    for (const op of this.ops) if (!op.test(doc)) return false;
    return true;
  }

  public toJson(): OperationAnd {
    const op: OperationAnd = {
      op: this.op,
      path: formatJsonPointer(this.path),
      apply: this.ops.map((op) => op.toJson()) as PredicateOperation[],
    };
    return op;
  }

  public toPacked(): CompactAndOp {
    return [OPCODE.and, this.path, this.ops.map((op) => op.toPacked())];
  }
}
