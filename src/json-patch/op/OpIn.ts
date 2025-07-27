import type {CompactInOp, OPCODE_IN} from '../codec/compact/types';
import type {OperationIn} from '../types';
import {find, type Path, formatJsonPointer} from '@jsonjoy.com/json-pointer';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OPCODE} from '../constants';
import type {AbstractOp} from './AbstractOp';
import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';

/**
 * @category JSON Predicate
 */
export class OpIn extends AbstractPredicateOp<'in'> {
  constructor(
    path: Path,
    public readonly value: unknown[],
  ) {
    super(path);
  }

  public op() {
    return 'in' as const;
  }

  public code() {
    return OPCODE.in;
  }

  public test(doc: unknown) {
    const {val} = find(doc, this.path);
    for (const x of this.value) if (deepEqual(val, x)) return true;
    return false;
  }

  public toJson(parent?: AbstractOp): OperationIn {
    const op: OperationIn = {
      op: 'in',
      path: formatJsonPointer(parent ? this.path.slice(parent.path.length) : this.path),
      value: this.value,
    };
    return op;
  }

  public toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactInOp {
    const opcode: OPCODE_IN = verbose ? 'in' : OPCODE.in;
    return [opcode, parent ? this.path.slice(parent.path.length) : this.path, this.value];
  }
}
