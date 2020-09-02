import {AbstractOp} from './AbstractOp';
import {OperationAdd} from '../types';
import {find, isObjectReference, isArrayReference, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from './constants';

export type PackedAddOp = [OPCODE.add, string | Path, {v: unknown}];

export class OpAdd extends AbstractOp<'add'> {
  constructor(path: Path, public readonly value: unknown) {
    super('add', path);
  }

  public apply(doc: unknown) {
    const ref = find(doc, this.path);
    if (isObjectReference(ref)) ref.obj[ref.key] = this.value;
    else if (isArrayReference(ref)) {
      if (ref.key > ref.obj.length) throw new Error('OUT_OF_BOUNDS');
      if (ref.key === ref.obj.length) ref.obj.push(this.value);
      else ref.obj.splice(ref.key, 0, this.value);
    } else doc = this.value;
    return {doc, old: ref.val};
  }

  public toJson(): OperationAdd {
    return {
      op: this.op,
      path: formatJsonPointer(this.path),
      value: this.value,
    };
  }

  public toPacked(): PackedAddOp {
    return [OPCODE.add, this.path, {v: this.value}];
  }
}
