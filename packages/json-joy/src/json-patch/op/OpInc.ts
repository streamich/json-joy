import type {CompactIncOp, OPCODE_INC} from '../codec/compact/types';
import {AbstractOp} from './AbstractOp';
import type {OperationInc} from '../types';
import {find, type Path, formatJsonPointer} from '@jsonjoy.com/json-pointer';
import {OPCODE} from '../constants';

/**
 * @category JSON Patch Extended
 */
export class OpInc extends AbstractOp<'inc'> {
  constructor(
    path: Path,
    public readonly inc: number,
  ) {
    super(path);
  }

  public op() {
    return 'inc' as const;
  }

  public code() {
    return OPCODE.inc;
  }

  public apply(doc: unknown) {
    const ref = find(doc, this.path);
    const result = this.inc + Number(ref.val);
    if (ref.obj) (ref as any).obj[(ref as any).key] = result;
    else doc = result;
    return {doc, old: ref.val};
  }

  public toJson(parent?: AbstractOp): OperationInc {
    const op: OperationInc = {
      op: 'inc',
      path: formatJsonPointer(this.path),
      inc: this.inc,
    };
    return op;
  }

  public toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactIncOp {
    const opcode: OPCODE_INC = verbose ? 'inc' : OPCODE.inc;
    return [opcode, this.path, this.inc];
  }
}
