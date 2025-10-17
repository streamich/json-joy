import type {CompactTestOp, OPCODE_TEST} from '../codec/compact/types';
import type {OperationTest} from '../types';
import {find, type Path, formatJsonPointer} from '@jsonjoy.com/json-pointer';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OPCODE} from '../constants';
import type {AbstractOp} from './AbstractOp';
import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';

/**
 * @category JSON Patch
 * @category JSON Predicate
 */
export class OpTest extends AbstractPredicateOp<'test'> {
  constructor(
    path: Path,
    public readonly value: unknown,
    public readonly not: boolean,
  ) {
    super(path);
  }

  public op() {
    return 'test' as const;
  }

  public code() {
    return OPCODE.test;
  }

  public test(doc: unknown) {
    const {val} = find(doc, this.path);
    if (val === undefined) return !!this.not;
    const test = deepEqual(val, this.value);
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

  public toCompact(parent: AbstractOp | undefined, verbose: boolean): CompactTestOp {
    const path = parent ? this.path.slice(parent.path.length) : this.path;
    const opcode: OPCODE_TEST = verbose ? 'test' : OPCODE.test;
    return this.not ? [opcode, path, this.value, 1] : [opcode, path, this.value];
  }
}
