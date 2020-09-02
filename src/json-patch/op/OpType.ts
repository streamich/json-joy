import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationType, JsonPatchTypes} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from './constants';

const {isArray} = Array;

export type PackedTypeOp = [OPCODE.type, string | Path, {v: JsonPatchTypes}];

export class OpType extends AbstractPredicateOp<'type'> {
  constructor(path: Path, public readonly value: JsonPatchTypes) {
    super('type', path);
  }

  public test(doc: unknown): boolean {
    const {val} = find(doc, this.path);
    if (val === null) return this.value === 'null';
    if (isArray(val)) return this.value === 'array';
    if (typeof val === this.value) return true;
    if (typeof val === 'number' && val === Math.round(val) && this.value === 'integer') return true;
    return false;
  }

  public toJson(): OperationType {
    const op: OperationType = {
      op: this.op,
      path: formatJsonPointer(this.path),
      value: this.value,
    };
    return op;
  }

  public toPacked(): PackedTypeOp {
    const packed: PackedTypeOp = [OPCODE.type, this.path, {v: this.value}];
    return packed;
  }
}
