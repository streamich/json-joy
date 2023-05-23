import type {CompactCopyOp, OPCODE_COPY} from '../codec/compact/types';
import {AbstractOp} from './AbstractOp';
import {OperationCopy} from '../types';
import {Path, find, formatJsonPointer} from '../../json-pointer';
import {OpAdd} from './OpAdd';
import {clone as deepClone} from '../../json-clone/clone';
import {OPCODE} from '../constants';
import type {IMessagePackEncoder} from '../../json-pack/msgpack';

/**
 * @category JSON Patch
 */
export class OpCopy extends AbstractOp<'copy'> {
  constructor(path: Path, public readonly from: Path) {
    super(path);
  }

  public op() {
    return 'copy' as 'copy';
  }

  public code() {
    return OPCODE.copy;
  }

  public apply(doc: unknown) {
    const {val} = find(doc, this.from);
    if (val === undefined) throw new Error('NOT_FOUND');
    const add = new OpAdd(this.path, deepClone(val)).apply(doc);
    return add;
  }

  public toJson(parent?: AbstractOp): OperationCopy {
    return {
      op: 'copy',
      path: formatJsonPointer(this.path),
      from: formatJsonPointer(this.from),
    };
  }

  public toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactCopyOp {
    const opcode: OPCODE_COPY = verbose ? 'copy' : OPCODE.copy;
    return [opcode, this.path, this.from];
  }

  public encode(encoder: IMessagePackEncoder, parent?: AbstractOp) {
    encoder.encodeArrayHeader(3);
    encoder.writer.u8(OPCODE.copy);
    encoder.encodeArray(this.path as unknown[]);
    encoder.encodeArray(this.from as unknown[]);
  }
}
