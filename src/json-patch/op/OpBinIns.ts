import {AbstractOp} from './AbstractOp';
import {OPCODE} from '../constants';
import {find, type Path, formatJsonPointer} from '@jsonjoy.com/json-pointer';
import type {CompactBinInsOp, OPCODE_BIN_INS} from '../codec/compact/types';
import type {OperationBinIns} from '../types';
import type {IMessagePackEncoder} from '@jsonjoy.com/json-pack/lib/msgpack';

/**
 * @category JSON Patch Extended
 */
export class OpBinIns extends AbstractOp<'bin_ins'> {
  constructor(
    path: Path,
    public readonly pos: number,
    public readonly bin: Uint8Array,
  ) {
    super(path);
  }

  public op() {
    return 'bin_ins' as const;
  }

  public code() {
    return OPCODE.bin_ins;
  }

  public apply(doc: unknown) {
    const {val, key, obj} = find(doc, this.path);
    if (!(val instanceof Uint8Array)) {
      if (val !== undefined) throw new Error('NOT_BIN');
      if (this.pos !== 0) throw new Error('POS');
    }
    const bin: Uint8Array = val instanceof Uint8Array ? val : new Uint8Array(0);
    const pos = Math.min(this.pos, bin.length);
    const result = new Uint8Array(bin.length + this.bin.length);
    result.set(bin.slice(0, pos), 0);
    result.set(this.bin, pos);
    result.set(bin.slice(pos), pos + this.bin.length);
    if (obj) (obj as any)[key as any] = result;
    else doc = result;
    return {doc, old: val};
  }

  public toJson(parent?: AbstractOp): OperationBinIns {
    const op: OperationBinIns = {
      op: 'bin_ins',
      path: formatJsonPointer(this.path),
      pos: this.pos,
      bin: this.bin,
    };
    return op;
  }

  public toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactBinInsOp {
    const opcode: OPCODE_BIN_INS = verbose ? 'bin_ins' : OPCODE.bin_ins;
    return [opcode, this.path, this.pos, this.bin];
  }

  public encode(encoder: IMessagePackEncoder, parent?: AbstractOp) {
    throw new Error('Not implemented');
  }
}
