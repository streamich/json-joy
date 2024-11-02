import type {CompactFlipOp, OPCODE_FLIP} from '../codec/compact/types';
import {AbstractOp} from './AbstractOp';
import type {OperationFlip} from '../types';
import {find, type Path, formatJsonPointer} from '@jsonjoy.com/json-pointer';
import {OPCODE} from '../constants';
import type {IMessagePackEncoder} from '@jsonjoy.com/json-pack/lib/msgpack';

/**
 * @category JSON Patch Extended
 */
export class OpFlip extends AbstractOp<'flip'> {

  public op() {
    return 'flip' as const;
  }

  public code() {
    return OPCODE.flip;
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

  public toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactFlipOp {
    const opcode: OPCODE_FLIP = verbose ? 'flip' : OPCODE.flip;
    return [opcode, this.path];
  }

  public encode(encoder: IMessagePackEncoder, parent?: AbstractOp) {
    encoder.encodeArrayHeader(2);
    encoder.writer.u8(OPCODE.flip);
    encoder.encodeArray(this.path as unknown[]);
  }
}
