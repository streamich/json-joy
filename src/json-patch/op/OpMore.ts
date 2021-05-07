import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationMore} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from '../constants';
import {CompactMoreOp} from '../compact';

/**
 * @category JSON Predicate
 */
export class OpMore extends AbstractPredicateOp<'more'> {
  constructor(path: Path, public readonly value: number) {
    super('more', path);
  }

  public test(doc: unknown): boolean {
    const {val} = find(doc, this.path);
    if (typeof val !== 'number') return false;
    const test = val > this.value;
    return test;
  }

  public toJson(): OperationMore {
    const op: OperationMore = {
      op: this.op,
      path: formatJsonPointer(this.path),
      value: this.value,
    };
    return op;
  }

  public toPacked(): CompactMoreOp {
    return [OPCODE.more, this.path, this.value];
  }
}
