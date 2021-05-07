import {AbstractSecondOrderPredicateOp} from './AbstractSecondOrderPredicateOp';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationNot, PredicateOperation} from '../types';
import {OPCODE} from '../constants';
import {Path, formatJsonPointer} from '../../json-pointer';
import {CompactNotOp} from '../compact';

/**
 * @category JSON Predicate
 */
export class OpNot extends AbstractSecondOrderPredicateOp<'not'> {
  constructor(path: Path, public readonly ops: AbstractPredicateOp[]) {
    super('not', path, ops);
  }

  public test(doc: unknown): boolean {
    for (const op of this.ops) if (op.test(doc)) return false;
    return true;
  }

  public toJson(): OperationNot {
    const op: OperationNot = {
      op: this.op,
      path: formatJsonPointer(this.path),
      apply: this.ops.map((op) => op.toJson()) as PredicateOperation[],
    };
    return op;
  }

  public toPacked(): CompactNotOp {
    return [OPCODE.not, this.path, this.ops.map((op) => op.toPacked())];
  }
}
