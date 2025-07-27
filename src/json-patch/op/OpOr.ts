import type {CompactOrOp, OPCODE_OR} from '../codec/compact/types';
import {AbstractSecondOrderPredicateOp} from './AbstractSecondOrderPredicateOp';
import type {AbstractPredicateOp} from './AbstractPredicateOp';
import type {OperationOr, PredicateOperation} from '../types';
import {OPCODE} from '../constants';
import {type Path, formatJsonPointer} from '@jsonjoy.com/json-pointer';
import type {AbstractOp} from './AbstractOp';

/**
 * @category JSON Predicate
 */
export class OpOr extends AbstractSecondOrderPredicateOp<'or'> {
  constructor(
    path: Path,
    public readonly ops: AbstractPredicateOp[],
  ) {
    super(path, ops);
  }

  public op() {
    return 'or' as const;
  }

  public code() {
    return OPCODE.or;
  }

  public test(doc: unknown): boolean {
    for (const op of this.ops) if (op.test(doc)) return true;
    return false;
  }

  public toJson(parent?: AbstractOp): OperationOr {
    const op: OperationOr = {
      op: 'or',
      path: formatJsonPointer(parent ? this.path.slice(parent.path.length) : this.path),
      apply: this.ops.map((op) => op.toJson(this)) as PredicateOperation[],
    };
    return op;
  }

  public toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactOrOp {
    const opcode: OPCODE_OR = verbose ? 'or' : OPCODE.or;
    return [
      opcode,
      parent ? this.path.slice(parent.path.length) : this.path,
      this.ops.map((op) => op.toCompact(this, verbose)),
    ];
  }
}
