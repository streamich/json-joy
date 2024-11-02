import {OpRemove, type Op} from '../../json-patch/op';
import {isRoot, isValidIndex, formatJsonPointer, isPathEqual} from '@jsonjoy.com/json-pointer';
import {lowerArrayPath} from './util';
import type {Operation} from '../../json-patch/types';
import {operationToOp} from '../../json-patch/codec/json';

export const xRemove = (add: OpRemove, op: Op): null | Op => {
  if (isRoot(add.path)) return null;
  if (isRoot(op.path)) return op;

  const lastIndex = add.path.length - 1;
  const lastStep = add.path[lastIndex];
  const isLastStepNumberLike = isValidIndex(lastStep);

  if (op instanceof OpRemove && isPathEqual(add.path, op.path) && isLastStepNumberLike) return null;

  if (isLastStepNumberLike) {
    const newPath = lowerArrayPath(add.path, op.path);
    const newFrom = op.from ? lowerArrayPath(add.path, op.from) : undefined;
    if (newPath || newFrom) {
      const operation: Operation = {
        ...op.toJson(),
        path: newPath ? formatJsonPointer(newPath) : op.path,
      };
      if (newFrom) (operation as any).from = newFrom;
      return operationToOp(operation, {});
    }
  }

  return op;
};
