import {AbstractOp} from './AbstractOp';
import {OperationMove} from '../types';
import {OpRemove} from './OpRemove';
import {OpAdd} from './OpAdd';
import {Path, toPath, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from './constants';

export type PackedMoveOp = [OPCODE.move, string | Path, {f: string | Path}];

/**
 * @category JSON Patch
 */
export class OpMove extends AbstractOp<'move'> {
  constructor(path: Path, public readonly from: Path) {
    super('move', path);
  }

  public apply(doc: unknown) {
    const remove = new OpRemove(toPath(this.from), undefined).apply(doc);
    const add = new OpAdd(this.path, remove.old).apply(remove.doc);
    return add;
  }

  public toJson(): OperationMove {
    return {
      op: this.op,
      path: formatJsonPointer(this.path),
      from: formatJsonPointer(this.from),
    };
  }

  public toPacked(): PackedMoveOp {
    const packed: PackedMoveOp = [OPCODE.move, this.path, {f: this.from}];
    return packed;
  }
}
