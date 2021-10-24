import type {CompactTestStringLenOp} from '../codec/compact/types';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationTestStringLen} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from '../constants';
import {AbstractOp} from './AbstractOp';
import {IMessagePackEncoder} from '../../json-pack/Encoder/types';

/**
 * @category JSON Patch Extended
 */
export class OpTestStringLen extends AbstractPredicateOp<'test_string_len'> {
  constructor(path: Path, public readonly len: number, public readonly not: boolean) {
    super(path);
  }

  public op() {
    return 'test_string_len' as 'test_string_len';
  }

  public test(doc: unknown): boolean {
    const {val} = find(doc, this.path);
    if (typeof val !== 'string') return false;
    const length = (val as string).length;
    const test = length >= this.len;
    return this.not ? !test : test;
  }

  public toJson(parent?: AbstractOp): OperationTestStringLen {
    const op: OperationTestStringLen = {
      op: 'test_string_len',
      path: formatJsonPointer(parent ? this.path.slice(parent.path.length) : this.path),
      len: this.len,
    };
    if (this.not) (op as any).not = this.not;
    return op;
  }

  public toCompact(parent?: AbstractOp): CompactTestStringLenOp {
    const path = parent ? this.path.slice(parent.path.length) : this.path;
    return this.not ? [OPCODE.test_string_len, path, this.len, 1] : [OPCODE.test_string_len, path, this.len];
  }

  public encode(encoder: IMessagePackEncoder, parent?: AbstractOp) {
    encoder.encodeArrayHeader(this.not ? 4 : 3);
    encoder.u8(OPCODE.test_string_len);
    encoder.encodeArray(parent ? this.path.slice(parent.path.length) : (this.path as unknown[]));
    encoder.encodeNumber(this.len);
    if (this.not) encoder.u8(1);
  }
}
