import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationTestString} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from './constants';

export type PackedTestStringOp = [OPCODE.test_string, string | Path, {i: number; s: string; n?: 1}];

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

  public toPacked(): PackedTestStringOp {
    const packed: PackedTestStringOp = [OPCODE.test_string, this.path, {i: this.pos, s: this.str}];
    if (this.not) packed[2].n = 1;
    return packed;
  }
}
