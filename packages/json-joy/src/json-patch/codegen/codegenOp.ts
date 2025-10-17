import {$test} from './ops/test';
import {$starts} from './ops/starts';
import {$add} from './ops/add';
import type {Op, OpTest, OpStarts, OpAdd} from '../op';
import type {ApplyFn} from './types';

export const codegenOp = (op: Op): ApplyFn => {
  switch (op.op()) {
    case 'add':
      return $add(op as OpAdd);
    case 'test':
      return $test(op as OpTest);
    case 'starts':
      return $starts(op as OpStarts);
    default:
      return (doc) => op.apply(doc).doc;
  }
};
