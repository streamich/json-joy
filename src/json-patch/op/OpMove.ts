import type {CompactMoveOp} from '../codec/compact/types';
import {AbstractOp} from './AbstractOp';
import {OperationMove} from '../types';
import {OpRemove} from './OpRemove';
import {OpAdd} from './OpAdd';
import {Path, toPath, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from '../constants';
import {IMessagePackEncoder} from '../../json-pack/Encoder/types';

/**
 * @category JSON Patch
 */
export class OpMove extends AbstractOp<'move'> {
  constructor(path: Path, public readonly from: Path) {
    super(path);
  }

  public op() {
    return 'move' as 'move';
  }

  public apply(doc: unknown) {
    const remove = new OpRemove(toPath(this.from), undefined).apply(doc);
    const add = new OpAdd(this.path, remove.old).apply(remove.doc);
    return add;
  }

  public toJson(parent?: AbstractOp): OperationMove {
    return {
      op: 'move',
      path: formatJsonPointer(this.path),
      from: formatJsonPointer(this.from),
    };
  }

  public toCompact(parent?: AbstractOp): CompactMoveOp {
    return [OPCODE.move, this.path, this.from];
  }

  public encode(encoder: IMessagePackEncoder, parent?: AbstractOp) {
    encoder.encodeArrayHeader(3);
    encoder.u8(OPCODE.move);
    encoder.encodeArray(this.path as unknown[]);
    encoder.encodeArray(this.from as unknown[]);
  }
}
