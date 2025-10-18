import type {OpAdd} from '../../op';
import {type JavaScriptLinked, compileClosure, type JavaScript} from '@jsonjoy.com/codegen';
import type {ApplyFn} from '../types';
import {$findRef} from '@jsonjoy.com/json-pointer/lib/codegen/findRef';

export const $$add = (op: OpAdd): JavaScriptLinked<ApplyFn> => {
  const find = $findRef(op.path);
  const js = /* js */ `
(function(find, path){
  return function(doc){
    var value = ${JSON.stringify(op.value)};
    var f = find(doc);
    var obj = f.obj, key = f.key, val = f.val;
    if (!obj) doc = value;
    else if (typeof key === 'string') obj[key] = value;
    else {
      var length = obj.length;
      if (key < length) obj.splice(key, 0, value);
      else if (key > length) throw new Error('INVALID_INDEX');
      else obj.push(value);
    }
    return doc;
  };
})`;

  return {
    deps: [find, op.path] as unknown[],
    js: js as JavaScript<(...deps: unknown[]) => ApplyFn>,
  };
};

export const $add = (op: OpAdd): ApplyFn => compileClosure($$add(op));
