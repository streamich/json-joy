import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationUndefined} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from '../constants';
import {CompactUndefinedOp} from '../compact';

/**
 * @category JSON Predicate
 */
export class OpUndefined extends AbstractPredicateOp<'undefined'> {
  constructor(path: Path) {
    super(path);
  }

  public op() {
    return 'undefined' as 'undefined';
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
      op: 'undefined',
      path: formatJsonPointer(this.path),
    };
    return op;
  }

  public toPacked(): CompactUndefinedOp {
    return [OPCODE.undefined, this.path];
  }
}
