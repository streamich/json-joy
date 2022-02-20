import type {CompactInOp, OPCODE_IN} from '../codec/compact/types';
import {OperationIn} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OPCODE} from '../constants';
import {AbstractOp} from './AbstractOp';
import {IMessagePackEncoder} from '../../json-pack/Encoder/types';
import {deepEqual} from '../../json-equal/deepEqual';

/**
 * @category JSON Predicate
 */
export class OpIn extends AbstractPredicateOp<'in'> {
  constructor(path: Path, public readonly value: unknown[]) {
    super(path);
  }

  public op() {
    return 'in' as 'in';
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

  public encode(encoder: IMessagePackEncoder, parent?: AbstractOp) {
    encoder.encodeArrayHeader(3);
    encoder.u8(OPCODE.in);
    encoder.encodeArray(parent ? this.path.slice(parent.path.length) : (this.path as unknown[]));
    encoder.encodeArray(this.value);
  }
}
