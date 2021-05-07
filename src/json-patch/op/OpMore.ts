import type {CompactMoreOp} from '../codec/compact/types';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationMore} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from '../constants';
import {AbstractOp} from './AbstractOp';

/**
 * @category JSON Predicate
 */
export class OpMore extends AbstractPredicateOp<'more'> {
  constructor(path: Path, public readonly value: number) {
    super(path);
  }

  public op() {
    return 'more' as 'more';
  }

  public test(doc: unknown): boolean {
    const {val} = find(doc, this.path);
    if (typeof val !== 'number') return false;
    const test = val > this.value;
    return test;
  }

  public toJson(parent?: AbstractOp): OperationMore {
    const op: OperationMore = {
      op: 'more',
      path: formatJsonPointer(parent ? this.path.slice(parent.path.length) : this.path),
      value: this.value,
    };
    return op;
  }

  public toCompact(parent?: AbstractOp): CompactMoreOp {
    return [OPCODE.more, this.path, this.value];
  }
}
