import {AbstractOp} from './AbstractOp';
import {OperationRemove} from '../types';
import {find, isObjectReference, isArrayReference, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from '../constants';
import {CompactRemoveOp} from '../compact';

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

  public toPacked(): CompactRemoveOp {
    return this.oldValue !== undefined
      ? [OPCODE.remove, this.path] as CompactRemoveOp
      : [OPCODE.remove, this.path, this.oldValue] as CompactRemoveOp;
  }
}
