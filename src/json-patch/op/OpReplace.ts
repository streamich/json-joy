import type {CompactReplaceOp, OPCODE_REPLACE} from '../codec/compact/types';
import {AbstractOp} from './AbstractOp';
import type {OperationReplace} from '../types';
import {find, isObjectReference, isArrayReference, type Path, formatJsonPointer} from '@jsonjoy.com/json-pointer';
import {OPCODE} from '../constants';
import {clone as deepClone} from '@jsonjoy.com/util/lib/json-clone/clone';

/**
 * @category JSON Patch
 */
export class OpReplace extends AbstractOp<'replace'> {
  constructor(
    path: Path,
    public readonly value: unknown,
    public readonly oldValue: unknown,
  ) {
    super(path);
  }

  public op() {
    return 'replace' as const;
  }

  public code() {
    return OPCODE.replace;
  }

  public apply(doc: unknown) {
    const ref = find(doc, this.path);
    if (ref.val === undefined) throw new Error('NOT_FOUND');
    const value = deepClone(this.value);
    if (isObjectReference(ref)) ref.obj[ref.key] = value;
    else if (isArrayReference(ref)) ref.obj[ref.key] = value;
    else doc = value;
    return {doc, old: ref.val};
  }

  public toJson(parent?: AbstractOp): OperationReplace {
    const json: OperationReplace = {
      op: 'replace',
      path: formatJsonPointer(this.path),
      value: this.value,
    };
    if (this.oldValue !== undefined) (json as any).oldValue = this.oldValue;
    return json;
  }

  public toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactReplaceOp {
    const opcode: OPCODE_REPLACE = verbose ? 'replace' : OPCODE.replace;
    return this.oldValue === undefined
      ? [opcode, this.path, this.value]
      : [opcode, this.path, this.value, this.oldValue];
  }
}
