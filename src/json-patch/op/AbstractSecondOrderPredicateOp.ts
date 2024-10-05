import type {OpType} from '../opcodes';
import type {Path} from '@jsonjoy.com/json-pointer';
import {AbstractPredicateOp} from './AbstractPredicateOp';

export abstract class AbstractSecondOrderPredicateOp<O extends OpType = OpType> extends AbstractPredicateOp<O> {
  constructor(
    path: Path,
    public readonly ops: AbstractPredicateOp[],
  ) {
    super(path);
  }
}
