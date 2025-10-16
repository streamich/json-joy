import type {CompactUndefinedOp, OPCODE_UNDEFINED} from '../codec/compact/types';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import type {OperationUndefined} from '../types';
import {find, type Path, formatJsonPointer} from '@jsonjoy.com/json-pointer';
import {OPCODE} from '../constants';
import type {AbstractOp} from './AbstractOp';

/**
 * @category JSON Predicate
 */
export class OpUndefined extends AbstractPredicateOp<'undefined'> {
  public op() {
    return 'undefined' as const;
  }

  public code() {
    return OPCODE.undefined;
  }

  public test(doc: unknown) {
    try {
      const {val} = find(doc, this.path);
      const test = val === undefined;
      return test;
    } catch (error) {
      if ((error as Error).message === 'NOT_FOUND') return true;
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

  public toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactUndefinedOp {
    const opcode: OPCODE_UNDEFINED = verbose ? 'undefined' : OPCODE.undefined;
    return [opcode, parent ? this.path.slice(parent.path.length) : this.path];
  }
}
