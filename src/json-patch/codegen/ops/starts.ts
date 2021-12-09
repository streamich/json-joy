import {OpStarts} from '../../op';
import {$$find} from '../../../json-pointer/codegen/find';
import {JavaScriptLinked, compileClosure, JavaScript} from '../../../util/codegen';
import {predicateOpWrapper} from '../util';
import type {ApplyFn} from '../types';

export const $$starts = (op: OpStarts): JavaScriptLinked<ApplyFn> => {
  const compareValue = op.ignore_case ? op.value.toLowerCase() : op.value;
  const js = /* js */ `
(function(wrapper){
  var find = ${$$find(op.path)};
  return wrapper(function(doc){
    var val = find(doc);
    if (typeof val !== 'string') return false;
    var outer = ${op.ignore_case ? /* js */ `val.toLowerCase()` : `val`};
    return outer.indexOf(${JSON.stringify(compareValue)}) === 0;
  });
})`;

  return {
    deps: [predicateOpWrapper] as unknown[],
    js: js as JavaScript<(...deps: unknown[]) => ApplyFn>,
  };
};

export const $starts = (op: OpStarts): ApplyFn => compileClosure($$starts(op));
