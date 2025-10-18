import {Expression, type ExpressionResult} from '../codegen-steps';
import type * as types from '../types';
import {toPath} from '@jsonjoy.com/json-pointer/lib/util';
import type {Path} from '@jsonjoy.com/json-pointer/lib/types';
import {type JavaScript, type JavaScriptLinked, compileClosure} from '@jsonjoy.com/codegen';
import {$findRef} from '@jsonjoy.com/json-pointer/lib/codegen/findRef';
import {find} from '@jsonjoy.com/json-pointer/lib/find';

const validateAddOperandCount = (count: number) => {
  if (count < 3) {
    throw new Error('Not enough operands for "jp.add" operand.');
  }
  if (count % 2 !== 0) {
    throw new Error('Invalid number of operands for "jp.add" operand.');
  }
};

const validateAddPath = (path: unknown) => {
  if (typeof path !== 'string') {
    throw new Error('The "path" argument for "jp.add" must be a const string.');
  }
};

type AddFn = (doc: unknown, value: unknown) => unknown;

export const $$add = (path: Path): JavaScriptLinked<AddFn> => {
  const find = $findRef(path);
  const js = /* js */ `
(function(find, path){
  return function(doc, value){
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
    deps: [find] as unknown[],
    js: js as JavaScript<(...deps: unknown[]) => AddFn>,
  };
};

export const $add = (path: Path): AddFn => compileClosure($$add(path));

export const patchOperators: types.OperatorDefinition<any>[] = [
  [
    'jp.add',
    [],
    -1,
    /**
     * Applies JSON Patch "add" operations to the input value.
     *
     * ```
     * ['add', {},
     *   '/a', 1,
     *   '/b', ['+', 2, 3],
     * ]
     * ```
     *
     * Results in:
     *
     * ```
     * {
     *   a: 1,
     *   b: 5,
     * }
     * ```
     */
    (expr: types.JsonPatchAdd, ctx) => {
      let i = 1;
      const length = expr.length;
      validateAddOperandCount(length);
      let doc = ctx.eval(expr[i++], ctx);
      while (i < length) {
        const path = expr[i++];
        validateAddPath(path);
        const value = ctx.eval(expr[i++], ctx);
        const {obj, key} = find(doc, toPath(path));
        if (!obj) doc = value;
        else if (typeof key === 'string') (obj as any)[key] = value;
        else if (obj instanceof Array) {
          const length = obj.length;
          if ((key as number) < length) obj.splice(key as number, 0, value);
          else if ((key as number) > length) throw new Error('INVALID_INDEX');
          else obj.push(value);
        }
      }
      return doc;
    },
    (ctx: types.OperatorCodegenCtx<types.JsonPatchAdd>): ExpressionResult => {
      const expr = ctx.expr;
      const length = ctx.operands.length;
      validateAddOperandCount(length + 1);
      let i = 0;
      let curr = ctx.operands[i++];
      while (i < length) {
        const path = expr[1 + i++];
        validateAddPath(path);
        const value = ctx.operands[i++];
        const addCompiled = $add(toPath(path));
        const dAdd = ctx.link(addCompiled);
        curr = new Expression(`${dAdd}(${curr}, ${value})`);
      }
      return curr;
    },
  ] as types.OperatorDefinition<types.JsonPatchAdd>,
];
