import type {OpTest} from '../../op';
import {$$find} from '@jsonjoy.com/json-pointer/lib/codegen/find';
import {deepEqualCodegen} from '@jsonjoy.com/util/lib/json-equal/deepEqualCodegen';
import {type JavaScriptLinked, compileClosure, type JavaScript} from '@jsonjoy.com/util/lib/codegen';
import {predicateOpWrapper} from '../util';
import type {ApplyFn} from '../types';

export const $$test = (op: OpTest): JavaScriptLinked<ApplyFn> => {
  const js = /* js */ `
(function(wrapper){
  var find = ${$$find(op.path)};
  var deepEqual = ${deepEqualCodegen(op.value)};
  return wrapper(function(doc){
    var val = find(doc);
    if (val === undefined) return ${op.not ? 'true' : 'false'};
    return ${op.not ? '!' : ''}deepEqual(val);
  });
})`;

  return {
    deps: [predicateOpWrapper] as unknown[],
    js: js as JavaScript<(...deps: unknown[]) => ApplyFn>,
  };
};

export const $test = (op: OpTest): ApplyFn => compileClosure($$test(op));
