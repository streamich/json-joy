import {OpType} from '../types';
import {AbstractPredicateOp} from './AbstractPredicateOp';
import {Path} from '../../json-pointer';

export abstract class AbstractSecondOrderPredicateOp<O extends OpType = OpType> extends AbstractPredicateOp<O> {
  constructor(public readonly op: O, path: Path, public readonly ops: AbstractPredicateOp[]) {
    super(op, path);
  }
}
