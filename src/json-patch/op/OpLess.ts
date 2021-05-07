import type {CompactLessOp} from '../codec/compact/types';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationLess} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from '../constants';
import {AbstractOp} from './AbstractOp';

/**
 * @category JSON Predicate
 */
export class OpLess extends AbstractPredicateOp<'less'> {
  constructor(path: Path, public readonly value: number) {
    super(path);
  }

  public op() {
    return 'less' as 'less';
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

  public toCompact(parent?: AbstractOp): CompactLessOp {
    return [OPCODE.less, this.path, this.value];
  }
}
