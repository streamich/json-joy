import {deepClone} from '../util';
import {Operation} from '../types';
import {operationToOp} from '../codec/json';
import {AbstractPredicateOp, OpTest} from '../op';
import {ApplyPatchOptions} from '../applyPatch/types';
import type {JsonPatchOptions} from '..';
import {$test} from './ops/test';
import type {ApplyFn} from './types';
import {compile, CompiledFunction, JavaScript} from '../../util/codegen';

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

export const $$apply = (operations: readonly Operation[], applyOptions: ApplyPatchOptions): CompiledFunction<ApplyFn> => {
  const {mutate, createMatcher} = applyOptions;
  const operationOptions: JsonPatchOptions = {createMatcher};
  const fns: ApplyFn[] = [];
  const length = operations.length;

  let hasNonPredicateOperations = false;

  for (let i = 0; i < length; i++) {
    const op = operationToOp(operations[i], operationOptions);
    const isPredicateOp = op instanceof AbstractPredicateOp;
    if (!isPredicateOp) hasNonPredicateOperations = true;
    if (op.op() === 'test') {
      fns.push($test(op as OpTest));
    } else {
      fns.push(doc => op.apply(doc).doc);
    }
  }

  const js = /* js */ `
(function(deepClone, fns) {
  return function(doc){
    ${!mutate && hasNonPredicateOperations ? /* js */ `doc = deepClone(doc);` : ''};
    for (var i = 0; i < ${length}; i++) {
      doc = fns[i](doc);
    }
    return doc;
  };
})`;

  return {
    deps: [deepClone, fns],
    js: js as JavaScript<(...deps: unknown[]) => ApplyFn>,
  };
};

export const $apply = (operations: readonly Operation[], applyOptions: ApplyPatchOptions): ApplyFn => {
  const fn = $$apply(operations, applyOptions);
  const compiled = compile(fn.js)(...fn.deps);
  return compiled;
};
