import type {CompactRemoveOp, OPCODE_REMOVE} from '../codec/compact/types';
import {AbstractOp} from './AbstractOp';
import type {OperationRemove} from '../types';
import {find, isObjectReference, isArrayReference, type Path, formatJsonPointer} from '@jsonjoy.com/json-pointer';
import {OPCODE} from '../constants';

/**
 * @category JSON Patch
 */
export class OpRemove extends AbstractOp<'remove'> {
  constructor(
    path: Path,
    public readonly oldValue: unknown,
  ) {
    super(path);
  }

  public op() {
    return 'remove' as const;
  }

  public code() {
    return OPCODE.remove;
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

  public toJson(parent?: AbstractOp): OperationRemove {
    const json: OperationRemove = {
      op: 'remove',
      path: formatJsonPointer(this.path),
    };
    if (this.oldValue !== undefined) (json as any).oldValue = this.oldValue;
    return json;
  }

  public toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactRemoveOp {
    const opcode: OPCODE_REMOVE = verbose ? 'remove' : OPCODE.remove;
    return this.oldValue === undefined
      ? ([opcode, this.path] as CompactRemoveOp)
      : ([opcode, this.path, this.oldValue] as CompactRemoveOp);
  }
}
