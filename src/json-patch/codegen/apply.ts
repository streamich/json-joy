import {clone as deepClone} from '@jsonjoy.com/util/lib/json-clone/clone';
import type {Operation} from '../types';
import {operationToOp} from '../codec/json';
import {AbstractPredicateOp} from '../op';
import type {ApplyPatchOptions} from '../applyPatch/types';
import type {JsonPatchOptions} from '..';
import type {ApplyFn} from './types';
import {compile, type JavaScriptLinked, type JavaScript} from '@jsonjoy.com/util/lib/codegen';
import {codegenOp} from './codegenOp';

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
};

export const $$apply = (
  operations: readonly Operation[],
  applyOptions: ApplyPatchOptions,
): JavaScriptLinked<ApplyFn> => {
  const {mutate, createMatcher} = applyOptions;
  const operationOptions: JsonPatchOptions = {createMatcher};
  const fns: ApplyFn[] = [];
  const length = operations.length;

  let hasNonPredicateOperations = false;

  for (let i = 0; i < length; i++) {
    const op = operationToOp(operations[i], operationOptions);
    const isPredicateOp = op instanceof AbstractPredicateOp;
    if (!isPredicateOp) hasNonPredicateOperations = true;
    fns.push(codegenOp(op));
  }

  const needsToClone = !mutate && hasNonPredicateOperations;

  const deps: unknown[] = [];
  const depNames: string[] = [];

  if (needsToClone) {
    deps.push(deepClone);
    depNames.push('clone');
  }

  let resultExpression = 'doc';

  for (let i = 0; i < fns.length; i++) {
    const fn = fns[i];
    const depName = `fn${i}`;
    deps.push(fn);
    depNames.push(depName);
    resultExpression = `${depName}(${resultExpression})`;
  }

  const js = /* js */ `
(function(${depNames.join(',')}) {
  return function(doc){
    ${needsToClone ? /* js */ 'doc = clone(doc);' : ''}
    return ${resultExpression};
  };
})`;

  return {
    deps,
    js: js as JavaScript<(...deps: unknown[]) => ApplyFn>,
  };
};

export const $apply = (operations: readonly Operation[], applyOptions: ApplyPatchOptions): ApplyFn => {
  const fn = $$apply(operations, applyOptions);
  const compiled = compile(fn.js)(...fn.deps);
  return compiled;
};
