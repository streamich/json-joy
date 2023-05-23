import type {CompactOrOp, OPCODE_OR} from '../codec/compact/types';
import {AbstractSecondOrderPredicateOp} from './AbstractSecondOrderPredicateOp';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationOr, PredicateOperation} from '../types';
import {OPCODE} from '../constants';
import {Path, formatJsonPointer} from '../../json-pointer';
import {AbstractOp} from './AbstractOp';
import type {IMessagePackEncoder} from '../../json-pack/msgpack';

/**
 * @category JSON Predicate
 */
export class OpOr extends AbstractSecondOrderPredicateOp<'or'> {
  constructor(path: Path, public readonly ops: AbstractPredicateOp[]) {
    super(path, ops);
  }

  public op() {
    return 'or' as 'or';
  }

  public code() {
    return OPCODE.or;
  }

  public test(doc: unknown): boolean {
    for (const op of this.ops) if (op.test(doc)) return true;
    return false;
  }

  public toJson(parent?: AbstractOp): OperationOr {
    const op: OperationOr = {
      op: 'or',
      path: formatJsonPointer(parent ? this.path.slice(parent.path.length) : this.path),
      apply: this.ops.map((op) => op.toJson(this)) as PredicateOperation[],
    };
    return op;
  }

  public toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactOrOp {
    const opcode: OPCODE_OR = verbose ? 'or' : OPCODE.or;
    return [
      opcode,
      parent ? this.path.slice(parent.path.length) : this.path,
      this.ops.map((op) => op.toCompact(this, verbose)),
    ];
  }

  public encode(encoder: IMessagePackEncoder, parent?: AbstractOp) {
    encoder.encodeArrayHeader(3);
    encoder.writer.u8(OPCODE.or);
    encoder.encodeArray(parent ? this.path.slice(parent.path.length) : (this.path as unknown[]));
    const length = this.ops.length;
    encoder.encodeArrayHeader(length);
    for (let i = 0; i < length; i++) this.ops[i].encode(encoder, this);
  }
}
