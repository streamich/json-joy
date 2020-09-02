import {OperationTest} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OPCODE} from './constants';
const isEqual = require('fast-deep-equal');

export type PackedTestOp = [OPCODE.test, string | Path, {v: unknown; n?: 1}];

export class OpTest extends AbstractPredicateOp<'test'> {
  constructor(path: Path, public readonly value: unknown, public readonly not: boolean) {
    super('test', path);
  }

  public test(doc: unknown) {
    const {val} = find(doc, this.path);
    if (val === undefined) return !!this.not;
    const test = isEqual(val, this.value);
    return this.not ? !test : test;
  }

  public toJson(): OperationTest {
    const op: OperationTest = {
      op: this.op,
      path: formatJsonPointer(this.path),
      value: this.value,
    };
    if (this.not) (op as any).not = this.not;
    return op;
  }

  public toPacked(): PackedTestOp {
    const packed: PackedTestOp = [OPCODE.test, this.path, {v: this.value}];
    if (this.not) packed[2].n = 1;
    return packed;
  }
}
