import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationTestStringLen} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from '../constants';
import {CompactTestStringLenOp} from '../compact';

/**
 * @category JSON Patch Extended
 */
export class OpTestStringLen extends AbstractPredicateOp<'test_string_len'> {
  constructor(path: Path, public readonly len: number, public readonly not: boolean) {
    super('test_string_len', path);
  }

  public test(doc: unknown): boolean {
    const {val} = find(doc, this.path);
    if (typeof val !== 'string') return false;
    const length = (val as string).length;
    const test = length >= this.len;
    return this.not ? !test : test;
  }

  public toJson(): OperationTestStringLen {
    const op: OperationTestStringLen = {
      op: this.op,
      path: formatJsonPointer(this.path),
      len: this.len,
    };
    if (this.not) (op as any).not = this.not;
    return op;
  }

  public toPacked(): CompactTestStringLenOp {
    return this.not
      ? [OPCODE.test_string_len, this.path, this.len, 1]
      : [OPCODE.test_string_len, this.path, this.len];
  }
}
