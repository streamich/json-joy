import {get, toPath, validateJsonPointer} from '../../json-pointer';
import {Expression, ExpressionResult} from '../codegen-steps';
import * as util from '../util';
import type * as types from '../types';

export const inputOperators: types.OperatorDefinition<any>[] = [
  [
    '=',
    ['get'],
    0,
    (expr: types.ExprGet, ctx) => {
      const varname = ctx.eval(expr[1], ctx);
      if (typeof varname !== 'string') throw new Error('Invalid varname.');
      const [name, pointer] = util.parseVar(varname);
      validateJsonPointer(pointer);
      const data = !name ? ctx.data : {};
      const path = toPath(pointer);
      return util.throwOnUndef(get(data, path), undefined);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprGet>): ExpressionResult => {
      const js = ctx.operands.map((expr) => `(${expr})`).join('&&');
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprGet>,
];
