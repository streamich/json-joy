import type {CompactTypeOp, OPCODE_TYPE} from '../codec/compact/types';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import type {OperationType, JsonPatchTypes} from '../types';
import {find, type Path, formatJsonPointer} from '@jsonjoy.com/json-pointer';
import {OPCODE} from '../constants';
import type {AbstractOp} from './AbstractOp';

const {isArray} = Array;

/**
 * @category JSON Predicate
 */
export class OpType extends AbstractPredicateOp<'type'> {
  constructor(
    path: Path,
    public readonly value: JsonPatchTypes,
  ) {
    super(path);
  }

  public op() {
    return 'type' as const;
  }

  public code() {
    return OPCODE.type;
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

  public toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactTypeOp {
    const opcode: OPCODE_TYPE = verbose ? 'type' : OPCODE.type;
    return [opcode, parent ? this.path.slice(parent.path.length) : this.path, this.value];
  }
}
