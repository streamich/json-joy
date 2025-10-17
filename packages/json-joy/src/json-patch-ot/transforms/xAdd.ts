import type {OpAdd, Op} from '../../json-patch/op';
import {isRoot, isValidIndex, isChild, formatJsonPointer} from '@jsonjoy.com/json-pointer';
import type {Operation} from '../../json-patch/types';
import {bumpArrayPath} from './util';
import {operationToOp} from '../../json-patch/codec/json';

export const xAdd = (add: OpAdd, op: Op): null | Op => {
  if (isRoot(add.path)) return null;
  if (isRoot(op.path)) return op;

  const lastIndex = add.path.length - 1;
  const lastStep = add.path[lastIndex];
  const isLastStepNumberLike = isValidIndex(lastStep);

  if (isChild(add.path, op.path) && !isLastStepNumberLike) return null;

  if (isLastStepNumberLike) {
    const newPath = bumpArrayPath(add.path, op.path);
    const newFrom = op.from ? bumpArrayPath(add.path, op.from) : undefined;
    if (newPath || newFrom) {
      const operation: Operation = {
        ...op.toJson(),
        path: newPath ? formatJsonPointer(newPath) : op.path,
      };
      if (newFrom) (operation as any).from = formatJsonPointer(newFrom);
      // TODO: The second argument should not be {}
      return operationToOp(operation, {});
    }
  }

  return op;
};
