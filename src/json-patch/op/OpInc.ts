import {AbstractOp} from './AbstractOp';
import {OperationInc} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from './constants';

/**
 * @category JSON Patch Extended
 */
export type PackedIncOp = [OPCODE.inc, string | Path, {v: number}];

/**
 * @category JSON Patch Extended
 */
export class OpInc extends AbstractOp<'inc'> {
  constructor(path: Path, public readonly inc: number) {
    super('inc', path);
  }

  public apply(doc: unknown) {
    const ref = find(doc, this.path);
    const result = this.inc + Number(ref.val);
    if (ref.obj) (ref as any).obj[(ref as any).key] = result;
    else doc = result;
    return {doc, old: ref.val};
  }

  public toJson(): OperationInc {
    const op: OperationInc = {
      op: this.op,
      path: formatJsonPointer(this.path),
      inc: this.inc,
    };
    return op;
  }

  public toPacked(): PackedIncOp {
    const packed: PackedIncOp = [OPCODE.inc, this.path, {v: this.inc}];
    return packed;
  }
}
