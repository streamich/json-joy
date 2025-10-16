import type {CompactLessOp, OPCODE_LESS} from '../codec/compact/types';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import type {OperationLess} from '../types';
import {find, type Path, formatJsonPointer} from '@jsonjoy.com/json-pointer';
import {OPCODE} from '../constants';
import type {AbstractOp} from './AbstractOp';

/**
 * @category JSON Predicate
 */
export class OpLess extends AbstractPredicateOp<'less'> {
  constructor(
    path: Path,
    public readonly value: number,
  ) {
    super(path);
  }

  public op() {
    return 'less' as const;
  }

  public code() {
    return OPCODE.less;
  }

  public test(doc: unknown): boolean {
    const {val} = find(doc, this.path);
    if (typeof val !== 'number') return false;
    const test = val < this.value;
    return test;
  }

  public toJson(parent?: AbstractOp): OperationLess {
    const op: OperationLess = {
      op: 'less',
      path: formatJsonPointer(parent ? this.path.slice(parent.path.length) : this.path),
      value: this.value,
    };
    return op;
  }

  public toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactLessOp {
    const opcode: OPCODE_LESS = verbose ? 'less' : OPCODE.less;
    return [opcode, parent ? this.path.slice(parent.path.length) : this.path, this.value];
  }
}
