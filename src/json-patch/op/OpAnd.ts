import type {CompactAndOp, OPCODE_AND} from '../codec/compact/types';
import {AbstractSecondOrderPredicateOp} from './AbstractSecondOrderPredicateOp';
import type {AbstractPredicateOp} from './AbstractPredicateOp';
import type {OperationAnd, PredicateOperation} from '../types';
import {OPCODE} from '../constants';
import {type Path, formatJsonPointer} from '@jsonjoy.com/json-pointer';
import type {AbstractOp} from './AbstractOp';

/**
 * @category JSON Predicate
 */
export class OpAnd extends AbstractSecondOrderPredicateOp<'and'> {
  constructor(
    path: Path,
    public readonly ops: AbstractPredicateOp[],
  ) {
    super(path, ops);
  }

  public op() {
    return 'and' as const;
  }

  public code() {
    return OPCODE.and;
  }

  public test(doc: unknown): boolean {
    for (const op of this.ops) if (!op.test(doc)) return false;
    return true;
  }

  public toJson(parent?: AbstractOp): OperationAnd {
    const op: OperationAnd = {
      op: 'and',
      path: formatJsonPointer(parent ? this.path.slice(parent.path.length) : this.path),
      apply: this.ops.map((op) => op.toJson(this)) as PredicateOperation[],
    };
    return op;
  }

  public toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactAndOp {
    const opcode: OPCODE_AND = verbose ? 'and' : OPCODE.and;
    return [
      opcode,
      parent ? this.path.slice(parent.path.length) : this.path,
      this.ops.map((op) => op.toCompact(this, verbose)),
    ];
  }
}
