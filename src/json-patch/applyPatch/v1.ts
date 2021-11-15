import {deepClone} from '../util';
import {Operation} from '../types';
import {Op} from '../op';
import {decode} from '../codec/json';
import type {JsonPatchOptions} from '../types';
import { ApplyPatchOptions } from '..';

export interface OpResult {
  doc: unknown;
  old?: unknown;
}

export interface PatchResult {
  doc: unknown;
  res: readonly OpResult[];
}

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
  const result = applyOps(doc, decode(patch, options), options.mutate);
  return result;
}
