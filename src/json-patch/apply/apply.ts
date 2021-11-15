import {deepClone} from '../util';
import {Operation} from '../types';
import {operationToOp} from '../codec/json';
import type {JsonPatchApplyOptions} from './types';
import type {JsonPatchOptions} from '..';
import {AbstractPredicateOp, Op} from '../op';

export interface OpResult {
  doc: unknown;
  old?: unknown;
}

export interface PatchResult {
  doc: unknown;
  res: readonly OpResult[];
}

export function apply(patch: readonly Operation[], applyOptions: JsonPatchApplyOptions, doc: unknown): unknown {
  const {mutate, createMatcher} = applyOptions;
  if (!mutate) doc = deepClone(doc);
  const res: OpResult[] = [];
  const length = patch.length;
  const opts: JsonPatchOptions = {createMatcher};
  for (let i = 0; i < length; i++) {
    const op = operationToOp(patch[i], opts);
    const opResult = op.apply(doc);
    doc = opResult.doc;
    res.push(opResult);
  }
  return {doc, res};
}

export type ApplyPatch = (doc: unknown) => unknown;

export const createApplyPatch = (operations: readonly Operation[], applyOptions: JsonPatchApplyOptions): ApplyPatch => {
  const {mutate, createMatcher} = applyOptions;
  const operationOptions: JsonPatchOptions = {createMatcher};
  const ops: Op[] = [];

  let hasNonPredicateOperations = false;

  for (let i = 0; i < operations.length; i++) {
    const op = operationToOp(operations[i], operationOptions);
    const isPredicateOp = op instanceof AbstractPredicateOp;
    if (!isPredicateOp) hasNonPredicateOperations = true;
    ops.push(op);
  }

  return (doc: unknown): unknown => {
    if (!mutate && hasNonPredicateOperations) doc = deepClone(doc);
    const length = operations.length;
    for (let i = 0; i < length; i++) {
      const op = operationToOp(operations[i], operationOptions);
      const opResult = op.apply(doc);
      doc = opResult.doc;
    }
    return doc;
  };
};
