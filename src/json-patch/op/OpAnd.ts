import {AbstractSecondOrderPredicateOp} from './AbstractSecondOrderPredicateOp';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {PackedOp} from './AbstractOp';
import {OperationAnd, PredicateOperation} from '../types';
import {OPCODE} from './constants';
import {Path, formatJsonPointer} from '../../json-pointer';

export type PackedAndOp = [OPCODE.and, string | Path, {o: PackedOp[]}];

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

  public toPacked(): PackedAndOp {
    return [OPCODE.and, this.path, {o: this.ops.map((op) => op.toPacked())}];
  }
}
