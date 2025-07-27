import type {CompactDefinedOp, OPCODE_DEFINED} from '../codec/compact/types';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import type {OperationDefined} from '../types';
import {find, type Path, formatJsonPointer} from '@jsonjoy.com/json-pointer';
import {OPCODE} from '../constants';
import type {AbstractOp} from './AbstractOp';

/**
 * @category JSON Predicate
 */
export class OpDefined extends AbstractPredicateOp<'defined'> {
  public op() {
    return 'defined' as const;
  }

  public code() {
    return OPCODE.defined;
  }

  public test(doc: unknown) {
    const {val} = find(doc, this.path);
    const test = val !== undefined;
    return test;
  }

  public toJson(parent?: AbstractOp): OperationDefined {
    const op: OperationDefined = {
      op: 'defined',
      path: formatJsonPointer(parent ? this.path.slice(parent.path.length) : this.path),
    };
    return op;
  }

  public toCompact(parent: undefined | AbstractOp, verbose: boolean): CompactDefinedOp {
    const opcode: OPCODE_DEFINED = verbose ? 'defined' : OPCODE.defined;
    return [opcode, parent ? this.path.slice(parent.path.length) : this.path];
  }
}
