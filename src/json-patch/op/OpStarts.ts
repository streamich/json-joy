import type {CompactStartsOp} from '../codec/compact/types';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationStarts} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from '../constants';
import {AbstractOp} from './AbstractOp';
import {IMessagePackEncoder} from '../../json-pack/Encoder/types';

/**
 * @category JSON Predicate
 */
export class OpStarts extends AbstractPredicateOp<'starts'> {
  // tslint:disable-next-line variable-name
  constructor(path: Path, public readonly value: string, public readonly ignore_case: boolean) {
    super(path);
  }

  public op() {
    return 'starts' as 'starts';
  }

  public test(doc: unknown): boolean {
    const {val} = find(doc, this.path);
    if (typeof val !== 'string') return false;
    const outer = this.ignore_case ? val.toLowerCase() : val;
    const inner = this.ignore_case ? this.value.toLowerCase() : this.value;
    const test = outer.startsWith(inner);
    return test;
  }

  public toJson(parent?: AbstractOp): OperationStarts {
    const op: OperationStarts = {
      op: 'starts',
      path: formatJsonPointer(parent ? this.path.slice(parent.path.length) : this.path),
      value: this.value,
    };
    if (this.ignore_case) (op as any).ignore_case = this.ignore_case;
    return op;
  }

  public toCompact(parent?: AbstractOp): CompactStartsOp {
    return this.ignore_case
      ? [OPCODE.starts, parent ? this.path.slice(parent.path.length) : this.path, this.value, 1]
      : [OPCODE.starts, parent ? this.path.slice(parent.path.length) : this.path, this.value];
  }

  public encode(encoder: IMessagePackEncoder, parent?: AbstractOp) {
    const ignoreCase = this.ignore_case;
    encoder.encodeArrayHeader(ignoreCase ? 4 : 3);
    encoder.u8(OPCODE.starts);
    encoder.encodeArray(parent ? this.path.slice(parent.path.length) : this.path as unknown[]);
    encoder.encodeString(this.value);
    if (ignoreCase) encoder.u8(1);
  }
}
