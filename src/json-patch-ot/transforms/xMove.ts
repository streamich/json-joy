import {operationToOp} from '../../json-patch/codec/json';
import type {OpMove, Op} from '../../json-patch/op';
import {isRoot, isChild} from '@jsonjoy.com/json-pointer';

export const xMove = (move: OpMove, op: Op): null | Op | Op[] => {
  if (isRoot(move.path)) return op;

  if (isChild(move.from, op.path)) {
    const pointer = [...move.path, ...op.path.slice(move.path.length)];
    const operation = op.toJson();
    (operation as any).path = pointer;
    return operationToOp(operation, {});
  }

  return op;
};
