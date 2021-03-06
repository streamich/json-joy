import type {CompactIncOp} from '../codec/compact/types';
import {AbstractOp} from './AbstractOp';
import {OperationInc} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from '../constants';
import {IMessagePackEncoder} from '../../json-pack/Encoder/types';

/**
 * @category JSON Patch Extended
 */
export class OpInc extends AbstractOp<'inc'> {
  constructor(path: Path, public readonly inc: number) {
    super(path);
  }

  public op() {
    return 'inc' as 'inc';
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

  public toCompact(parent?: AbstractOp): CompactIncOp {
    return [OPCODE.inc, this.path, this.inc];
  }

  public encode(encoder: IMessagePackEncoder, parent?: AbstractOp) {
    encoder.encodeArrayHeader(3);
    encoder.u8(OPCODE.inc);
    encoder.encodeArray(this.path as unknown[]);
    encoder.encodeNumber(this.inc);
  }
}
