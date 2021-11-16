import {Op, OpTest} from '../op';
import {$test} from './ops/test';
import type {ApplyFn} from './types';

export const codegenOp = (op: Op): ApplyFn => {
  switch  (op.op()) {
    case 'test': return $test(op as OpTest);
    default: return doc => op.apply(doc).doc;
  }
};
