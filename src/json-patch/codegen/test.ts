import { deepEqual } from "../../json-equal/deepEqual";
import { find, Path } from "../../json-pointer";
import { JavaScript } from "../../util/codegen";

export const $$test = (path: Path, value: unknown, not: boolean): JavaScript<(doc: unknown) => boolean> => {
  const find = 1; //$$find(path);
  const isEqual = 2; //$$deepEqual(path);

  let js = /* js */ `(function(){
    var find = ${find};
    var isEqual = ${isEqual};
    return function(doc){
      const val = find(doc);
      if (val === undefined) return ${JSON.stringify(not)};
      const test = isEqual(val);
      return ${not ? '!test' : 'test'};
    };
  })()`;

  return js as JavaScript<(doc: unknown) => boolean>;
};
