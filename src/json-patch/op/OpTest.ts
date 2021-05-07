import type {CompactTestOp} from '../codec/compact/types';
import {OperationTest} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OPCODE} from '../constants';
import {AbstractOp} from './AbstractOp';
const isEqual = require('fast-deep-equal');

/**
 * @category JSON Patch
 * @category JSON Predicate
 */
export class OpTest extends AbstractPredicateOp<'test'> {
  constructor(path: Path, public readonly value: unknown, public readonly not: boolean) {
    super(path);
  }

  public op() {
    return 'test' as 'test';
  }

  public test(doc: unknown) {
    const {val} = find(doc, this.path);
    if (val === undefined) return !!this.not;
    const test = isEqual(val, this.value);
    return this.not ? !test : test;
  }

  public toJson(parent?: AbstractOp): OperationTest {
    const op: OperationTest = {
      op: 'test',
      path: formatJsonPointer(parent ? this.path.slice(parent.path.length) : this.path),
      value: this.value,
    };
    if (this.not) (op as any).not = this.not;
    return op;
  }

  public toCompact(parent?: AbstractOp): CompactTestOp {
    const path = parent ? this.path.slice(parent.path.length) : this.path;
    return this.not
      ? [OPCODE.test, path, this.value, 1]
      : [OPCODE.test, path, this.value];
  }
}
