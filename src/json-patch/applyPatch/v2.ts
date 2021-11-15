import {deepClone} from '../util';
import {Operation} from '../types';
import {findByPointer} from '../../json-pointer/findByPointer/v6';
import { ApplyPatchOptions } from '..';

export interface OpResult {
  doc: unknown;
  old?: unknown;
}

export interface PatchResult {
  doc: unknown;
  res: readonly OpResult[];
}

function applyOp(doc: unknown, operation: Operation): OpResult {
  switch (operation.op) {
    case 'add': {
      const [obj, key] = findByPointer(operation.path as string, doc);
      switch (typeof key) {
        case 'number': {
          if (key > (obj as any).length) throw new Error('INVALID_INDEX');
          if (key === (obj as any).length) (obj as any).push(operation.value);
          else (obj as any).splice(key, 0, operation.value);
          break;
        }
        case 'string': {
          (obj as any)[key] = operation.value;
          break;
        }
        default: {
          doc = operation.value;
          break;
        }
      }
    }
  }
  return {doc};
}

export function applyPatch(doc: unknown, patch: readonly Operation[], options: ApplyPatchOptions): PatchResult {
  if (!options.mutate) doc = deepClone(doc);
  const res: OpResult[] = [];
  for (let i = 0; i < patch.length; i++) {
    const operation = patch[i];
    const operationResult = applyOp(doc, operation);
    res.push(operationResult);
    doc = operationResult.doc;
  }
  return {doc, res};
}
