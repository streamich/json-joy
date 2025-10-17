import type {Reference} from '../find';
import type {Path} from '../types';
import {type JavaScriptLinked, compileClosure} from '@jsonjoy.com/util/lib/codegen';
import {hasOwnProperty as has} from '@jsonjoy.com/util/lib/hasOwnProperty';

type Fn = (val: unknown) => Reference;

export const $$findRef = (path: Path): JavaScriptLinked<Fn> => {
  if (!path.length) {
    return {
      deps: [] as unknown[],
      js: /* js */ `(function(){return function(val){return {val:val}}})`,
    } as JavaScriptLinked<Fn>;
  }

  let loop = '';
  for (let i = 0; i < path.length; i++) {
    const key = JSON.stringify(path[i]);
    loop += /* js */ `
      obj = val;
      key = ${key};
      if (obj instanceof Array) {
        var length = obj.length;
        if (key === '-') key = length;
        else {
          var key2 = ${~~path[i]};
          ${String(~~path[i]) !== String(path[i]) ? `if ('' + key2 !== key) throw new Error('INVALID_INDEX');` : ''}
          ${~~path[i] < 0 ? `throw new Error('INVALID_INDEX');` : ''}
          key = key2;
        }
        val = obj[key];
      } else if (typeof obj === 'object' && !!obj) {
        val = has(obj, key) ? obj[key] : undefined;
      } else throw new Error('NOT_FOUND');
    `;
  }

  const js = /* js */ `(function(has, path){
    return function(val) {
      var obj, key;
      ${loop}
      return {val:val, obj:obj, key:key};
    };
  })`;

  return {
    deps: [has, path] as unknown[],
    js,
  } as JavaScriptLinked<Fn>;
};

export const $findRef = (path: Path): Fn => compileClosure($$findRef(path));
