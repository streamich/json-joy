import type {OpStarts} from '../../op';
import {$$find} from '@jsonjoy.com/json-pointer/lib/codegen/find';
import {type JavaScriptLinked, compileClosure, type JavaScript} from '@jsonjoy.com/codegen';
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
    var outer = ${op.ignore_case ? /* js */ 'val.toLowerCase()' : 'val'};
    return outer.indexOf(${JSON.stringify(compareValue)}) === 0;
  });
})`;

  return {
    deps: [predicateOpWrapper] as unknown[],
    js: js as JavaScript<(...deps: unknown[]) => ApplyFn>,
  };
};

export const $starts = (op: OpStarts): ApplyFn => compileClosure($$starts(op));
