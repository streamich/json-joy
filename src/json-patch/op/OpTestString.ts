import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationTestString} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from '../constants';
import {CompactTestStringOp} from '../compact';

/**
 * @category JSON Patch Extended
 */
export class OpTestString extends AbstractPredicateOp<'test_string'> {
  constructor(path: Path, public readonly pos: number, public readonly str: string, public readonly not: boolean) {
    super('test_string', path);
  }

  public test(doc: unknown): boolean {
    const {val} = find(doc, this.path);
    if (typeof val !== 'string') return false;
    const length = (val as string).length;
    const start = Math.min(this.pos, length);
    const end = Math.min(this.pos + this.str.length, length);
    const test = (val as string).substring(start, end) === this.str;
    return this.not ? !test : test;
  }

  public toJson(): OperationTestString {
    const op: OperationTestString = {
      op: this.op,
      path: formatJsonPointer(this.path),
      pos: this.pos,
      str: this.str,
    };
    if (this.not) (op as any).not = this.not;
    return op;
  }

  public toPacked(): CompactTestStringOp {
    return this.not
      ? [OPCODE.test_string, this.path, this.pos, this.str, 1]
      : [OPCODE.test_string, this.path, this.pos, this.str];
  }
}
