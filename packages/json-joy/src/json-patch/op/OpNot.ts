import type {CompactNotOp, OPCODE_NOT} from '../codec/compact/types';
import {AbstractSecondOrderPredicateOp} from './AbstractSecondOrderPredicateOp';
import type {AbstractPredicateOp} from './AbstractPredicateOp';
import type {OperationNot, PredicateOperation} from '../types';
import {OPCODE} from '../constants';
import {type Path, formatJsonPointer} from '@jsonjoy.com/json-pointer';
import type {AbstractOp} from './AbstractOp';

/**
 * @category JSON Predicate
 */
export class OpNot extends AbstractSecondOrderPredicateOp<'not'> {
  constructor(
    path: Path,
    public readonly ops: AbstractPredicateOp[],
  ) {
    super(path, ops);
  }

  public op() {
    return 'not' as const;
  }

  public code() {
    return OPCODE.not;
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

  public toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactNotOp {
    const opcode: OPCODE_NOT = verbose ? 'not' : OPCODE.not;
    return [
      opcode,
      parent ? this.path.slice(parent.path.length) : this.path,
      this.ops.map((op) => op.toCompact(this, verbose)),
    ];
  }
}
