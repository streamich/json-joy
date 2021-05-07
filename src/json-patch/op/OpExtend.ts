import {AbstractOp} from './AbstractOp';
import {OperationExtend} from '../types';
import {find, isArrayReference, isObjectReference, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from '../constants';
import {CompactExtendOp} from '../compact';

const {isArray} = Array;

/**
 * @category JSON Patch Extended
 */
export class OpExtend extends AbstractOp<'extend'> {
  constructor(path: Path, public readonly props: Record<string, unknown>, public readonly deleteNull: boolean) {
    super(path);
  }

  public op() {
    return 'extend' as 'extend';
  }

  public apply(doc: unknown) {
    const ref = find(doc, this.path);
    if (isArrayReference(ref)) {
      if (ref.val !== undefined) {
        ref.obj[ref.key] = this.extend(ref.val);
      }
    } else if (isObjectReference(ref)) {
      ref.obj[ref.key] = this.extend(ref.val);
    } else {
      doc = this.extend(doc);
    }
    return {doc};
  }

  private extend<T>(value: T): T {
    if (isArray(value)) return value;
    if (typeof value !== 'object') return value;
    if (!value) return value;
    for (const [key, v] of Object.entries(this.props)) {
      if (key === '__proto__') throw new Error('NO_PROTO');
      if (v === null && this.deleteNull) {
        delete (value as any)[key];
        continue;
      }
      (value as any)[key] = v;
    }
    return value;
  }

  public toJson(): OperationExtend {
    const op: OperationExtend = {
      op: 'extend',
      path: formatJsonPointer(this.path),
      props: this.props,
    };
    if (this.deleteNull) op.deleteNull = this.deleteNull;
    return op;
  }

  public toPacked(): CompactExtendOp {
    const packed: CompactExtendOp = [OPCODE.extend, this.path, this.props];
    if (this.deleteNull) packed.push(1);
    return packed;
  }
}
