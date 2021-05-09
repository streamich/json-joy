import type {CompactFlipOp} from '../codec/compact/types';
import {AbstractOp} from './AbstractOp';
import {OperationFlip} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from '../constants';
import {IMessagePackEncoder} from '../../json-pack/Encoder/types';

/**
 * @category JSON Patch Extended
 */
export class OpFlip extends AbstractOp<'flip'> {
  constructor(path: Path) {
    super(path);
  }

  public op() {
    return 'flip' as 'flip';
  }

  public apply(doc: unknown) {
    const ref = find(doc, this.path);
    if (ref.obj) (ref as any).obj[(ref as any).key] = !ref.val;
    else doc = !ref.val;
    return {doc, old: ref.val};
  }

  public toJson(parent?: AbstractOp): OperationFlip {
    const op: OperationFlip = {
      op: 'flip',
      path: formatJsonPointer(this.path),
    };
    return op;
  }

  public toCompact(parent?: AbstractOp): CompactFlipOp {
    return [OPCODE.flip, this.path];
  }

  public encode(encoder: IMessagePackEncoder, parent?: AbstractOp) {
    encoder.encodeArrayHeader(2);
    encoder.u8(OPCODE.flip);
    encoder.encodeArray(this.path as unknown[]);
  }
}
