import {AbstractSecondOrderPredicateOp} from './AbstractSecondOrderPredicateOp';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationOr, PredicateOperation} from '../types';
import {OPCODE} from './constants';
import {PackedOp} from './AbstractOp';
import {Path, formatJsonPointer} from '../../json-pointer';

export type PackedOrOp = [OPCODE.or, string | Path, {o: PackedOp[]}];

export class OpOr extends AbstractSecondOrderPredicateOp<'or'> {
  constructor(path: Path, public readonly ops: AbstractPredicateOp[]) {
    super('or', path, ops);
  }

  public test(doc: unknown): boolean {
    for (const op of this.ops) if (op.test(doc)) return true;
    return false;
  }

  public toJson(): OperationOr {
    const op: OperationOr = {
      op: this.op,
      path: formatJsonPointer(this.path),
      apply: this.ops.map((op) => op.toJson()) as PredicateOperation[],
    };
    return op;
  }

  public toPacked(): PackedOrOp {
    const packed: PackedOrOp = [OPCODE.or, this.path, {o: this.ops.map((op) => op.toPacked())}];
    return packed;
  }
}
