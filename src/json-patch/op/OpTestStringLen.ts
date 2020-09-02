import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationTestStringLen} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from './constants';

export type PackedTestStringLenOp = [OPCODE.test_string_len, string | Path, {l: number; n?: 1}];

export class OpTestStringLen extends AbstractPredicateOp<'test_string_len'> {
  constructor(path: Path, public readonly len: number, public readonly not: boolean) {
    super('test_string_len', path);
  }

  public test(doc: unknown): boolean {
    const {val} = find(doc, this.path);
    if (typeof val !== 'string') return false;
    const length = (val as string).length;
    const test = val.length >= this.len;
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

  public toPacked(): PackedTestStringLenOp {
    const packed: PackedTestStringLenOp = [OPCODE.test_string_len, this.path, {l: this.len}];
    if (this.not) packed[2].n = 1;
    return packed;
  }
}
