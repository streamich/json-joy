import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationUndefined} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from './constants';

/**
 * @category JSON Predicate
 */
export type PackedUndefinedOp = [OPCODE.undefined, string | Path];

/**
 * @category JSON Predicate
 */
export class OpUndefined extends AbstractPredicateOp<'undefined'> {
  constructor(path: Path) {
    super('undefined', path);
  }

  public test(doc: unknown) {
    try {
      const {val} = find(doc, this.path);
      const test = val === undefined;
      return test;
    } catch (error) {
      if (error.message === 'NOT_FOUND') return true;
      throw error;
    }
  }

  public toJson(): OperationUndefined {
    const op: OperationUndefined = {
      op: this.op,
      path: formatJsonPointer(this.path),
    };
    return op;
  }

  public toPacked(): PackedUndefinedOp {
    const packed: PackedUndefinedOp = [OPCODE.undefined, this.path];
    return packed;
  }
}
