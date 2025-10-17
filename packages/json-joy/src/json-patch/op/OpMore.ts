import type {CompactMoreOp, OPCODE_MORE} from '../codec/compact/types';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import type {OperationMore} from '../types';
import {find, type Path, formatJsonPointer} from '@jsonjoy.com/json-pointer';
import {OPCODE} from '../constants';
import type {AbstractOp} from './AbstractOp';

/**
 * @category JSON Predicate
 */
export class OpMore extends AbstractPredicateOp<'more'> {
  constructor(
    path: Path,
    public readonly value: number,
  ) {
    super(path);
  }

  public op() {
    return 'more' as const;
  }

  public code() {
    return OPCODE.more;
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

  public toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactMoreOp {
    const opcode: OPCODE_MORE = verbose ? 'more' : OPCODE.more;
    return [opcode, parent ? this.path.slice(parent.path.length) : this.path, this.value];
  }
}
