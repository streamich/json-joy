import {deepClone} from '../util';
import {Operation} from '../types';
import {find, isArrayReference, isObjectReference, parseJsonPointer} from '../../json-pointer';

export interface OpResult {
  doc: unknown;
  old?: unknown;
}

export interface PatchResult {
  doc: unknown;
  res: readonly OpResult[];
}

export function applyPatch(doc: unknown, patch: readonly Operation[], mutate: boolean): PatchResult {
  if (!mutate) doc = deepClone(doc);
  const res: OpResult[] = [];
  for (let i = 0; i < patch.length; i++) {
    const operation = patch[i];
    const path = parseJsonPointer(operation.path as string);
    switch (operation.op) {
      case 'add': {
        const ref = find(doc, path);
        if (isObjectReference(ref)) ref.obj[ref.key] = operation.value;
        else if (isArrayReference(ref)) {
          if (ref.key > ref.obj.length) throw new Error('OUT_OF_BOUNDS');
          if (ref.key === ref.obj.length) ref.obj.push(operation.value);
          else ref.obj.splice(ref.key, 0, operation.value);
        } else doc = operation.value;
        res.push({doc, old: ref.val});
        break;
      }
    }
  }
  return {doc, res};
}
