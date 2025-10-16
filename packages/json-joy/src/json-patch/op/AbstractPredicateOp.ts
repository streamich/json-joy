import type {OpType} from '../opcodes';
import {AbstractOp} from './AbstractOp';

export abstract class AbstractPredicateOp<O extends OpType = OpType> extends AbstractOp<O> {
  public apply(doc: unknown) {
    const test = this.test(doc);
    if (!test) throw new Error('TEST');
    return {doc};
  }

  abstract test(doc: unknown): boolean;
}
