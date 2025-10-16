import {clone as deepClone} from '@jsonjoy.com/util/lib/json-clone/clone';
import type {Operation} from '../types';
import type {Op} from '../op';
import {operationToOp} from '../codec/json';
import type {ApplyPatchOptions, OpResult, PatchResult} from './types';

export function applyOp(doc: unknown, op: Op, mutate: boolean): OpResult {
  if (!mutate) doc = deepClone(doc);
  return op.apply(doc);
}

export function applyOps(doc: unknown, ops: readonly Op[], mutate: boolean): PatchResult {
  if (!mutate) doc = deepClone(doc);
  const res: OpResult[] = [];
  const length = ops.length;
  for (let i = 0; i < length; i++) {
    const opResult = ops[i].apply(doc);
    doc = opResult.doc;
    res.push(opResult);
  }
  return {doc, res};
}

export function applyPatch(doc: unknown, patch: readonly Operation[], options: ApplyPatchOptions): PatchResult {
  if (!options.mutate) doc = deepClone(doc);
  const res: OpResult[] = [];
  const length = patch.length;
  for (let i = 0; i < length; i++) {
    const op = operationToOp(patch[i], options);
    const opResult = op.apply(doc);
    doc = opResult.doc;
    res.push(opResult);
  }
  return {doc, res};
}
