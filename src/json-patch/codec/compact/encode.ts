import {Op} from "../../op";
import {CompactOp} from "./types";

export function encode(ops: Op[]): CompactOp[] {
  const operations: CompactOp[] = [];
  const length = ops.length;
  for (let i = 0; i < length; i++) operations.push(ops[i].toCompact());
  return operations;
}
