import {Expression, ExpressionResult} from '../codegen-steps';
import * as util from "../util";
import type * as types from "../types";

export const stringOperators: types.OperatorDefinition<any>[] = [
  [
    '.',
    ['cat'],
    -1,
    (expr: types.ExprCat, ctx) => {
      return expr.slice(1).reduce((acc, e) => acc + util.str(ctx.eval(e, ctx)), '');
    },
    (ctx: types.OperatorCodegenCtx<types.ExprCat>): ExpressionResult => {
      ctx.link('str', util.str);
      const js = ctx.operands.map(expr => `str(${expr})`).join('+');
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprCat>,
];
