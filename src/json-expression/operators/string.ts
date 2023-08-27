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

  [
    'contains',
    [],
    2,
    (expr: types.ExprContains, ctx) => {
      const outer = ctx.eval(expr[1], ctx);
      const inner = ctx.eval(expr[2], ctx);
      return util.contains(outer, inner);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprContains>): ExpressionResult => {
      ctx.link('contains', util.contains);
      const js = `contains(${ctx.operands[0]},${ctx.operands[1]})`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprContains>,
];
