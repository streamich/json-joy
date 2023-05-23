import type {CompactMoveOp, OPCODE_MOVE} from '../codec/compact/types';
import {AbstractOp} from './AbstractOp';
import {OperationMove} from '../types';
import {OpRemove} from './OpRemove';
import {OpAdd} from './OpAdd';
import {Path, toPath, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from '../constants';
import type {IMessagePackEncoder} from '../../json-pack/msgpack';

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

  public code() {
    return OPCODE.move;
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

  public toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactMoveOp {
    const opcode: OPCODE_MOVE = verbose ? 'move' : OPCODE.move;
    return [opcode, this.path, this.from];
  }

  public encode(encoder: IMessagePackEncoder, parent?: AbstractOp) {
    encoder.encodeArrayHeader(3);
    encoder.writer.u8(OPCODE.move);
    encoder.encodeArray(this.path as unknown[]);
    encoder.encodeArray(this.from as unknown[]);
  }
}
