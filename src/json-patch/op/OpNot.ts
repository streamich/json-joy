import {AbstractSecondOrderPredicateOp} from './AbstractSecondOrderPredicateOp';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationNot, PredicateOperation} from '../types';
import {OPCODE} from './constants';
import {PackedOp} from './AbstractOp';
import {Path, formatJsonPointer} from '../../json-pointer';

export type PackedNotOp = [OPCODE.not, string | Path, {o: PackedOp[]}];

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

  public toPacked(): PackedNotOp {
    const packed: PackedNotOp = [OPCODE.not, this.path, {o: this.ops.map((op) => op.toPacked())}];
    return packed;
  }
}
