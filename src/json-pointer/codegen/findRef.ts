import type {Reference} from "../find";
import type {Path} from "../types";
import {CompiledFunction, compileFn} from "../../util/codegen";
import {hasOwnProperty} from "..";

type Fn = (val: unknown) => Reference;

export const $$findRef = (path: Path): CompiledFunction<Fn> => {
  if (!path.length) {
    return {
      deps: [] as unknown[],
      js: /* js */ `(function(){return function(val){return {val:val}}})`,
    } as CompiledFunction<Fn>;  
  }

  let js = /* js */ `(function(hasOwnProperty, path){
    return function(val) {
      var obj, key, i;
      for (i = 0; i < ${path.length}; i++) {
        obj = val;
        key = path[i];
        if (obj instanceof Array) {
          var length = obj.length;
          if (key === '-') key = length;
          else {
            var key2 = ~~key;
            if ('' + key2 !== key) throw new Error('INVALID_INDEX');
            key = key2;
            if (key < 0) throw new Error('INVALID_INDEX');
          }
          val = obj[key];
        } else if (typeof obj === 'object' && !!obj) {
          val = hasOwnProperty(obj, key) ? obj[key] : undefined;
        } else throw new Error('NOT_FOUND');
      }
      return {val:val, obj:obj, key:key};
    };
  })`;

  return {
    deps: [hasOwnProperty, path] as unknown[],
    js,
  } as CompiledFunction<Fn>
};

export const $findRef = (path: Path): Fn => compileFn($$findRef(path));
