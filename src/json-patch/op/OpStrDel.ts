import type {CompactStrDelOp, OPCODE_STR_DEL} from '../codec/compact/types';
import {AbstractOp} from './AbstractOp';
import {OperationStrDel} from '../types';
import {find, Path, formatJsonPointer} from '@jsonjoy.com/json-pointer';
import {OPCODE} from '../constants';
import type {IMessagePackEncoder} from '@jsonjoy.com/json-pack/lib/msgpack';

/**
 * @category JSON Patch Extended
 */
export class OpStrDel extends AbstractOp<'str_del'> {
  constructor(
    path: Path,
    public readonly pos: number,
    public readonly str: string | undefined,
    public readonly len: number | undefined,
  ) {
    super(path);
  }

  public op() {
    return 'str_del' as 'str_del';
  }

  public code() {
    return OPCODE.str_del;
  }

  public deleteLength(): number {
    return typeof this.str === 'string' ? this.str.length : this.len!;
  }

  public apply(doc: unknown) {
    const {val, key, obj} = find(doc, this.path);
    if (typeof val !== 'string') throw new Error('NOT_A_STRING');
    const length = val.length;
    const pos = Math.min(this.pos, val.length);
    const start = Math.min(pos, length);
    const deletionLength: number = this.str !== undefined ? this.str.length : this.len!;
    const end = Math.min(pos + deletionLength, length);
    const before = val.slice(0, start);
    const after = val.substr(end);
    const result = before + after;
    if (obj) (obj as any)[key as any] = result;
    else doc = result;
    return {doc, old: val};
  }

  public toJson(parent?: AbstractOp): OperationStrDel {
    if (typeof this.str === 'string') {
      return {
        op: 'str_del',
        path: formatJsonPointer(this.path),
        pos: this.pos,
        str: this.str,
      };
    }
    return {
      op: 'str_del',
      path: formatJsonPointer(this.path),
      pos: this.pos,
      len: this.len,
    };
  }

  public toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactStrDelOp {
    const opcode: OPCODE_STR_DEL = verbose ? 'str_del' : OPCODE.str_del;
    return typeof this.str === 'string'
      ? [opcode, this.path, this.pos, this.str]
      : ([opcode, this.path, this.pos, 0, this.len] as CompactStrDelOp);
  }

  public encode(encoder: IMessagePackEncoder, parent?: AbstractOp) {
    const hasStr = typeof this.str === 'string';
    encoder.encodeArrayHeader(hasStr ? 4 : 5);
    encoder.writer.u8(OPCODE.str_del);
    encoder.encodeArray(this.path as unknown[]);
    encoder.encodeNumber(this.pos);
    if (hasStr) {
      encoder.encodeString(this.str as string);
    } else {
      encoder.writer.u8(0);
      encoder.encodeNumber(this.len!);
    }
  }
}
