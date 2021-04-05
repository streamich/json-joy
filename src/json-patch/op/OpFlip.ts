import {AbstractOp} from './AbstractOp';
import {OperationFlip} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from './constants';

/**
 * @category JSON Patch Extended
 */
export type PackedFlipOp = [OPCODE.flip, string | Path];

/**
 * @category JSON Patch Extended
 */
export class OpFlip extends AbstractOp<'flip'> {
  constructor(path: Path) {
    super('flip', path);
  }

  public apply(doc: unknown) {
    const ref = find(doc, this.path);
    if (ref.obj) (ref as any).obj[(ref as any).key] = !ref.val;
    else doc = !ref.val;
    return {doc, old: ref.val};
  }

  public toJson(): OperationFlip {
    const op: OperationFlip = {
      op: this.op,
      path: formatJsonPointer(this.path),
    };
    return op;
  }

  public toPacked(): PackedFlipOp {
    const packed: PackedFlipOp = [OPCODE.flip, this.path];
    return packed;
  }
}
