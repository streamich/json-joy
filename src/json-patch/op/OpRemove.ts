import {AbstractOp} from './AbstractOp';
import {OperationRemove} from '../types';
import {find, isObjectReference, isArrayReference, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from './constants';

export type PackedRemoveOp = [OPCODE.remove, string | Path] | [OPCODE.remove, string | Path, {o: unknown}];


/**
 * @category JSON Patch
 */
export class OpRemove extends AbstractOp<'remove'> {
  constructor(path: Path, public readonly oldValue: unknown) {
    super('remove', path);
  }

  public apply(doc: unknown) {
    const ref = find(doc, this.path);
    if (ref.val === undefined) throw new Error('NOT_FOUND');
    if (isObjectReference(ref)) delete ref.obj[ref.key];
    else if (isArrayReference(ref)) {
      if (ref.val !== undefined) ref.obj.splice(ref.key, 1);
    } else doc = null;
    return {doc, old: ref.val};
  }

  public toJson(): OperationRemove {
    const json: OperationRemove = {
      op: this.op,
      path: formatJsonPointer(this.path),
    };
    if (this.oldValue !== undefined) (json as any).oldValue = this.oldValue;
    return json;
  }

  public toPacked(): PackedRemoveOp {
    const packed: PackedRemoveOp =
      this.oldValue !== undefined ? [OPCODE.remove, this.path] : [OPCODE.remove, this.path, {o: this.oldValue}];
    return packed;
  }
}
