import {OpTest} from '../../op';
import {$$find} from "../../../json-pointer/codegen/$$find";
import {$$deepEqual} from "../../../json-equal/$$deepEqual";
import {compile, CompiledFunction, JavaScript} from "../../../util/codegen";
import {predicateOpWrapper} from '../util';

export const $$test = (op: OpTest): CompiledFunction<(doc: unknown) => unknown> => {
  const js = /* js */ `
(function(wrapper){
  var find = ${$$find(op.path)};
  var deepEqual = ${$$deepEqual(op.value)};
  return wrapper(doc, function(doc){
    var val = find(doc);
    if (val === undefined) return ${op.not ? 'true' : 'false'};
    return ${op.not ? '!' : ''}deepEqual(val);
  });
})`;

  return {
    deps: [predicateOpWrapper] as unknown[],
    js: js as JavaScript<(...deps: unknown[]) => (doc: unknown) => unknown>,
  };
};

export const $test = (op: OpTest): (doc: unknown) => unknown => {
  const fn = $$test(op);
  const compiled = compile(fn.js)(...fn.deps);
  return compiled;
};
