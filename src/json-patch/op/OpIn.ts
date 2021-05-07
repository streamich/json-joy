import {OperationIn} from '../types';
import {find, Path, formatJsonPointer} from '../../json-pointer';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {OPCODE} from '../constants';
import {CompactInOp} from '../compact';
const isEqual = require('fast-deep-equal');

/**
 * @category JSON Predicate
 */
export class OpIn extends AbstractPredicateOp<'in'> {
  constructor(path: Path, public readonly value: unknown[]) {
    super('in', path);
  }

  public test(doc: unknown) {
    const {val} = find(doc, this.path);
    for (const x of this.value) if (isEqual(val, x)) return true;
    return false;
  }

  public toJson(): OperationIn {
    const op: OperationIn = {
      op: this.op,
      path: formatJsonPointer(this.path),
      value: this.value,
    };
    return op;
  }

  public toPacked(): CompactInOp {
    return [OPCODE.in, this.path, this.value];
  }
}
