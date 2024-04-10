import {JavaScript} from '@jsonjoy.com/util/lib/codegen';
import {Path} from '../types';

export const $$find = (path: Path): JavaScript<(doc: unknown) => unknown> => {
  if (path.length === 0) return '(function(x){return x})' as JavaScript<(doc: unknown) => unknown>;
  let fn = '(function(){var h=Object.prototype.hasOwnProperty;return(function(o){var k,u=void 0;try{';
  for (let i = 0; i < path.length; i++) {
    fn += 'k=' + JSON.stringify(path[i]) + ';';
    fn += 'if(!h.call(o,k))return u;o=o[k];';
  }
  fn += 'return o}catch(e){return u}})})()';
  return fn as JavaScript<(doc: unknown) => unknown>;
};
