import {Op} from '../../op';
import {Operation} from './types';

export function encode(ops: Op[]): Operation[] {
  const operations: Operation[] = [];
  const length = ops.length;
  for (let i = 0; i < length; i++) operations.push(ops[i].toJson());
  return operations;
}
