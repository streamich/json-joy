import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationStarts} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from './constants';

/**
 * @category JSON Predicate
 */
export type PackedStartsOp = [OPCODE.starts, string | Path, {v: string; i?: 1}];

/**
 * @category JSON Predicate
 */
export class OpStarts extends AbstractPredicateOp<'starts'> {
  // tslint:disable-next-line variable-name
  constructor(path: Path, public readonly value: string, public readonly ignore_case: boolean) {
    super('starts', path);
  }

  public test(doc: unknown): boolean {
    const {val} = find(doc, this.path);
    if (typeof val !== 'string') return false;
    const outer = this.ignore_case ? val.toLowerCase() : val;
    const inner = this.ignore_case ? this.value.toLowerCase() : this.value;
    const test = outer.startsWith(inner);
    return test;
  }

  public toJson(): OperationStarts {
    const op: OperationStarts = {
      op: this.op,
      path: formatJsonPointer(this.path),
      value: this.value,
    };
    if (this.ignore_case) (op as any).ignore_case = this.ignore_case;
    return op;
  }

  public toPacked(): PackedStartsOp {
    const packed: PackedStartsOp = [OPCODE.starts, this.path, {v: this.value}];
    if (this.ignore_case) packed[2].i = 1;
    return packed;
  }
}
