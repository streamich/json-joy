import {deepClone} from '../util';
import {Operation} from '../types';
import {operationToOp} from '../codec/json';
import {AbstractPredicateOp, OpTest} from '../op';
import {ApplyPatchOptions} from '../applyPatch/types';
import type {JsonPatchOptions} from '..';
import {$test} from './ops/test';
import type { ApplyFn } from './types';

export const apply = (patch: readonly Operation[], applyOptions: ApplyPatchOptions, doc: unknown): unknown => {
  const {mutate, createMatcher} = applyOptions;
  if (!mutate) doc = deepClone(doc);
  const length = patch.length;
  const opts: JsonPatchOptions = {createMatcher};
  for (let i = 0; i < length; i++) {
    const op = operationToOp(patch[i], opts);
    const opResult = op.apply(doc);
    doc = opResult.doc;
  }
  return doc;
}

export const $apply = (operations: readonly Operation[], applyOptions: ApplyPatchOptions): ApplyFn => {
  const {mutate, createMatcher} = applyOptions;
  const operationOptions: JsonPatchOptions = {createMatcher};
  const ops: ApplyFn[] = [];
  const length = operations.length;

  let hasNonPredicateOperations = false;

  for (let i = 0; i < length; i++) {
    const op = operationToOp(operations[i], operationOptions);
    const isPredicateOp = op instanceof AbstractPredicateOp;
    if (!isPredicateOp) hasNonPredicateOperations = true;
    if (op.op() === 'test') {
      ops.push($test(op as OpTest));
    } else {
      ops.push(doc => op.apply(doc).doc);
    }
  }

  return (doc: unknown): unknown => {
    if (!mutate && hasNonPredicateOperations) doc = deepClone(doc);
    for (let i = 0; i < length; i++) doc = ops[i](doc);
    return doc;
  };
};
