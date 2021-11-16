import {$test} from './ops/test';
import {$starts} from './ops/starts';
import type {Op, OpTest, OpStarts} from '../op';
import type {ApplyFn} from './types';

export const codegenOp = (op: Op): ApplyFn => {
  switch  (op.op()) {
    case 'test': return $test(op as OpTest);
    case 'starts': return $starts(op as OpStarts);
    default: return doc => op.apply(doc).doc;
  }
};
