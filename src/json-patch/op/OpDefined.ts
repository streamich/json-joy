import type {CompactDefinedOp, OPCODE_DEFINED} from '../codec/compact/types';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationDefined} from '../types';
import {find, Path, formatJsonPointer} from '@jsonjoy.com/json-pointer';
import {OPCODE} from '../constants';
import {AbstractOp} from './AbstractOp';
import type {IMessagePackEncoder} from '@jsonjoy.com/json-pack/lib/msgpack';

/**
 * @category JSON Predicate
 */
export class OpDefined extends AbstractPredicateOp<'defined'> {
  constructor(path: Path) {
    super(path);
  }

  public op() {
    return 'defined' as 'defined';
  }

  public code() {
    return OPCODE.defined;
  }

  public test(doc: unknown) {
    const {val} = find(doc, this.path);
    const test = val !== undefined;
    return test;
  }

  public toJson(parent?: AbstractOp): OperationDefined {
    const op: OperationDefined = {
      op: 'defined',
      path: formatJsonPointer(parent ? this.path.slice(parent.path.length) : this.path),
    };
    return op;
  }

  public toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactDefinedOp {
    const opcode: OPCODE_DEFINED = verbose ? 'defined' : OPCODE.defined;
    return [opcode, parent ? this.path.slice(parent.path.length) : this.path];
  }

  public encode(encoder: IMessagePackEncoder, parent?: AbstractOp) {
    encoder.encodeArrayHeader(2);
    encoder.writer.u8(OPCODE.defined);
    encoder.encodeArray(parent ? this.path.slice(parent.path.length) : (this.path as unknown[]));
  }
}
