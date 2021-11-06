import { Path } from '../types';

export const codegenSelector = (path: Path) => {
  let fn = '(function(o){var k,u=undefined,h="hasOwnProperty";try{';
  for (let i = 0; i < path.length; i++) {
    fn += 'k=' + JSON.stringify(path[i]) + ';';
    fn += 'if(!o[h](k))return u;o=o[k];';
  }
  fn += 'return o}catch(e){return u}})';
  return eval(fn);
};
