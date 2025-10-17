import type {CompactCopyOp, OPCODE_COPY} from '../codec/compact/types';
import {AbstractOp} from './AbstractOp';
import type {OperationCopy} from '../types';
import {type Path, find, formatJsonPointer} from '@jsonjoy.com/json-pointer';
import {OpAdd} from './OpAdd';
import {clone as deepClone} from '@jsonjoy.com/util/lib/json-clone/clone';
import {OPCODE} from '../constants';

/**
 * @category JSON Patch
 */
export class OpCopy extends AbstractOp<'copy'> {
  constructor(
    path: Path,
    public readonly from: Path,
  ) {
    super(path);
  }

  public op() {
    return 'copy' as const;
  }

  public code() {
    return OPCODE.copy;
  }

  public apply(doc: unknown) {
    const {val} = find(doc, this.from);
    if (val === undefined) throw new Error('NOT_FOUND');
    const add = new OpAdd(this.path, deepClone(val)).apply(doc);
    return add;
  }

  public toJson(parent?: AbstractOp): OperationCopy {
    return {
      op: 'copy',
      path: formatJsonPointer(this.path),
      from: formatJsonPointer(this.from),
    };
  }

  public toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactCopyOp {
    const opcode: OPCODE_COPY = verbose ? 'copy' : OPCODE.copy;
    return [opcode, this.path, this.from];
  }
}
