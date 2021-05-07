import {Op, operationToOp} from "../../op";
import {Operation} from "./types";

export function decode(patch: Operation[]): Op[] {
  const ops: Op[] = [];
  const length = patch.length;
  for (let i = 0; i < length; i++) {
    const op = operationToOp(patch[i]);
    ops.push(op);
  }
  return ops;
}
