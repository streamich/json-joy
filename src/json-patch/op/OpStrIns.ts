import {AbstractOp} from './AbstractOp';
import {OperationStrIns} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from './constants';

export type PackedStrInsOp = [OPCODE.str_ins, string | Path, {i: number; s: string}];

export class OpStrIns extends AbstractOp<'str_ins'> {
  constructor(path: Path, public readonly pos: number, public readonly str: string) {
    super('str_ins', path);
  }

  public apply(doc: unknown) {
    const {val, key, obj} = find(doc, this.path);
    if (typeof val !== 'string') {
      if (val !== undefined) throw new Error('NOT_A_STRING');
      if (this.pos !== 0) throw new Error('POS');
    }
    const str: string = typeof val === 'string' ? val : '';
    const pos = Math.min(this.pos, str.length);
    const before = str.slice(0, pos);
    const after = str.slice(pos);
    const result = before + this.str + after;
    if (obj) (obj as any)[key as any] = result;
    else doc = result;
    return {doc, old: val};
  }

  public toJson(): OperationStrIns {
    const op: OperationStrIns = {
      op: this.op,
      path: formatJsonPointer(this.path),
      pos: this.pos,
      str: this.str,
    };
    return op;
  }

  public toPacked(): PackedStrInsOp {
    const packed: PackedStrInsOp = [OPCODE.str_ins, this.path, {i: this.pos, s: this.str}];
    return packed;
  }
}
