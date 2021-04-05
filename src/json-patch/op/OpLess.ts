import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationLess} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from './constants';

/**
 * @category JSON Predicate
 */
export type PackedLessOp = [OPCODE.less, string | Path, {v: number}];

/**
 * @category JSON Predicate
 */
export class OpLess extends AbstractPredicateOp<'less'> {
  constructor(path: Path, public readonly value: number) {
    super('less', path);
  }

  public test(doc: unknown): boolean {
    const {val} = find(doc, this.path);
    if (typeof val !== 'number') return false;
    const test = val < this.value;
    return test;
  }

  public toJson(): OperationLess {
    const op: OperationLess = {
      op: this.op,
      path: formatJsonPointer(this.path),
      value: this.value,
    };
    return op;
  }

  public toPacked(): PackedLessOp {
    const packed: PackedLessOp = [OPCODE.less, this.path, {v: this.value}];
    return packed;
  }
}
