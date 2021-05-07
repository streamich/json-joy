import type {CompactCopyOp} from '../codec/compact/types';
import {AbstractOp} from './AbstractOp';
import {OperationCopy} from '../types';
import {Path, find, formatJsonPointer} from '../../json-pointer';
import {OpAdd} from './OpAdd';
import {deepClone} from '../util';
import {OPCODE} from '../constants';

/**
 * @category JSON Patch
 */
export class OpCopy extends AbstractOp<'copy'> {
  constructor(path: Path, public readonly from: Path) {
    super(path);
  }

  public op() {
    return 'copy' as 'copy';
  }

  public apply(doc: unknown) {
    const {val} = find(doc, this.from);
    if (val === undefined) throw new Error('NOT_FOUND');
    const add = new OpAdd(this.path, deepClone(val)).apply(doc);
    return add;
  }

  public toJson(): OperationCopy {
    return {
      op: 'copy',
      path: formatJsonPointer(this.path),
      from: formatJsonPointer(this.from),
    };
  }

  public toPacked(): CompactCopyOp {
    return [OPCODE.copy, this.path, this.from];
  }
}
