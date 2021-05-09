import type {CompactTypeOp} from '../codec/compact/types';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationType, JsonPatchTypes} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from '../constants';
import {AbstractOp} from './AbstractOp';
import {IMessagePackEncoder} from '../../json-pack/Encoder/types';

const {isArray} = Array;

/**
 * @category JSON Predicate
 */
export class OpType extends AbstractPredicateOp<'type'> {
  constructor(path: Path, public readonly value: JsonPatchTypes) {
    super(path);
  }

  public op() {
    return 'type' as 'type';
  }

  public test(doc: unknown): boolean {
    const {val} = find(doc, this.path);
    if (val === null) return this.value === 'null';
    if (isArray(val)) return this.value === 'array';
    if (typeof val === this.value) return true;
    if (typeof val === 'number' && val === Math.round(val) && this.value === 'integer') return true;
    return false;
  }

  public toJson(parent?: AbstractOp): OperationType {
    const op: OperationType = {
      op: 'type',
      path: formatJsonPointer(parent ? this.path.slice(parent.path.length) : this.path),
      value: this.value,
    };
    return op;
  }

  public toCompact(parent?: AbstractOp): CompactTypeOp {
    return [OPCODE.type, parent ? this.path.slice(parent.path.length) : this.path, this.value];
  }

  public encode(encoder: IMessagePackEncoder, parent?: AbstractOp) {
    encoder.encodeArrayHeader(3);
    encoder.u8(OPCODE.type);
    encoder.encodeArray(parent ? this.path.slice(parent.path.length) : this.path as unknown[]);
    encoder.encodeString(this.value);
  }
}
