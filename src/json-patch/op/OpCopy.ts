import {AbstractOp} from './AbstractOp';
import {OperationCopy} from '../types';
import {Path, find, formatJsonPointer} from '../../json-pointer';
import {OpAdd} from './OpAdd';
import {deepClone} from '../util';
import {OPCODE} from './constants';

export type PackedCopyOp = [OPCODE.copy, string | Path, {f: string | Path}];

/**
 * @category JSON Patch
 */
export class OpCopy extends AbstractOp<'copy'> {
  constructor(path: Path, public readonly from: Path) {
    super('copy', path);
  }

  public apply(doc: unknown) {
    const {val} = find(doc, this.from);
    if (val === undefined) throw new Error('NOT_FOUND');
    const add = new OpAdd(this.path, deepClone(val)).apply(doc);
    return add;
  }

  public toJson(): OperationCopy {
    return {
      op: this.op,
      path: formatJsonPointer(this.path),
      from: formatJsonPointer(this.from),
    };
  }

  public toPacked(): PackedCopyOp {
    const packed: PackedCopyOp = [OPCODE.copy, this.path, {f: this.from}];
    return packed;
  }
}
