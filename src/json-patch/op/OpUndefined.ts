import type {CompactUndefinedOp} from '../codec/compact/types';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OperationUndefined} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {OPCODE} from '../constants';
import {AbstractOp} from './AbstractOp';

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

  public toJson(parent?: AbstractOp): OperationUndefined {
    const op: OperationUndefined = {
      op: 'undefined',
      path: formatJsonPointer(parent ? this.path.slice(parent.path.length) : this.path),
    };
    return op;
  }

  public toCompact(parent?: AbstractOp): CompactUndefinedOp {
    return [OPCODE.undefined, this.path];
  }
}
