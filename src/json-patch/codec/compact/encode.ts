import type {Op} from '../../op';
import type {CompactOp, EncoderOptions} from './types';

export function encode(ops: Op[], {stringOpcode = false}: EncoderOptions = {}): CompactOp[] {
  const operations: CompactOp[] = [];
  const length = ops.length;
  for (let i = 0; i < length; i++) operations.push(ops[i].toCompact(undefined, stringOpcode));
  return operations;
}
