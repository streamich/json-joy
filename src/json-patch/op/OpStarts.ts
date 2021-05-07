import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationStarts} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from '../constants';
import {CompactStartsOp} from '../compact';

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

  public toPacked(): CompactStartsOp {
    const packed: CompactStartsOp = [OPCODE.starts, this.path, this.value];
    if (this.ignore_case) packed.push(1);
    return packed;
  }
}
