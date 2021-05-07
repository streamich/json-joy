import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationContains} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from '../constants';
import type {CompactContainsOp} from '../compact';

/**
 * @category JSON Predicate
 */
export class OpContains extends AbstractPredicateOp<'contains'> {
  // tslint:disable-next-line variable-name
  constructor(path: Path, public readonly value: string, public readonly ignore_case: boolean) {
    super('contains', path);
  }

  public test(doc: unknown): boolean {
    const {val} = find(doc, this.path);
    if (typeof val !== 'string') return false;
    const testValue = this.ignore_case ? val.toLowerCase() : val;
    const testString = this.ignore_case ? this.value.toLowerCase() : this.value;
    const test = testValue.indexOf(testString) > -1;
    return test;
  }

  public toJson(): OperationContains {
    const op: OperationContains = {
      op: this.op,
      path: formatJsonPointer(this.path),
      value: this.value,
    };
    if (this.ignore_case) (op as any).ignore_case = this.ignore_case;
    return op;
  }

  public toPacked(): CompactContainsOp {
    const compact: CompactContainsOp = [OPCODE.contains, this.path, this.value];
    if (this.ignore_case) compact.push(1);
    return compact;
  }
}
