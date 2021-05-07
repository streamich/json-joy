import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationEnds} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from '../constants';
import {CompactEndsOp} from '../compact';

/**
 * @category JSON Predicate
 */
export class OpEnds extends AbstractPredicateOp<'ends'> {
  // tslint:disable-next-line variable-name
  constructor(path: Path, public readonly value: string, public readonly ignore_case: boolean) {
    super(path);
  }

  public op() {
    return 'ends' as 'ends';
  }

  public test(doc: unknown): boolean {
    const {val} = find(doc, this.path);
    if (typeof val !== 'string') return false;
    const outer = this.ignore_case ? val.toLowerCase() : val;
    const inner = this.ignore_case ? this.value.toLowerCase() : this.value;
    const test = outer.endsWith(inner);
    return test;
  }

  public toJson(): OperationEnds {
    const op: OperationEnds = {
      op: 'ends',
      path: formatJsonPointer(this.path),
      value: this.value,
    };
    if (this.ignore_case) (op as any).ignore_case = this.ignore_case;
    return op;
  }

  public toPacked(): CompactEndsOp {
    const packed: CompactEndsOp = [OPCODE.ends, this.path, this.value];
    if (this.ignore_case) packed.push(1);
    return packed;
  }
}
