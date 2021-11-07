import type {CompactTestOp} from '../codec/compact/types';
import {OperationTest} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OPCODE} from '../constants';
import {AbstractOp} from './AbstractOp';
import {IMessagePackEncoder} from '../../json-pack/Encoder/types';
import {deepEqual} from '../../json-equal/deepEqual';

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

  public toCompact(parent?: AbstractOp): CompactTestOp {
    const path = parent ? this.path.slice(parent.path.length) : this.path;
    return this.not ? [OPCODE.test, path, this.value, 1] : [OPCODE.test, path, this.value];
  }

  public encode(encoder: IMessagePackEncoder, parent?: AbstractOp) {
    encoder.encodeArrayHeader(this.not ? 4 : 3);
    encoder.u8(OPCODE.test);
    encoder.encodeArray(parent ? this.path.slice(parent.path.length) : (this.path as unknown[]));
    encoder.encodeAny(this.value);
    if (this.not) encoder.u8(1);
  }
}
