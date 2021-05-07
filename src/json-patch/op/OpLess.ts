import type {CompactLessOp} from '../codec/compact/types';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationLess} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from '../constants';

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

  public toJson(): OperationLess {
    const op: OperationLess = {
      op: 'less',
      path: formatJsonPointer(this.path),
      value: this.value,
    };
    return op;
  }

  public toPacked(): CompactLessOp {
    return [OPCODE.less, this.path, this.value];
  }
}
