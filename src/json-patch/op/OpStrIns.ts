import type {CompactStrInsOp} from '../codec/compact/types';
import {AbstractOp} from './AbstractOp';
import {OperationStrIns} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from '../constants';

/**
 * @category JSON Patch Extended
 */
export class OpStrIns extends AbstractOp<'str_ins'> {
  constructor(path: Path, public readonly pos: number, public readonly str: string) {
    super(path);
  }

  public op() {
    return 'str_ins' as 'str_ins';
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

  public toJson(parent?: AbstractOp): OperationStrIns {
    const op: OperationStrIns = {
      op: 'str_ins',
      path: formatJsonPointer(this.path),
      pos: this.pos,
      str: this.str,
    };
    return op;
  }

  public toPacked(): CompactStrInsOp {
    return [OPCODE.str_ins, this.path, this.pos, this.str];
  }
}
