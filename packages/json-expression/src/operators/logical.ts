import {Expression, type ExpressionResult} from '../codegen-steps';
import type * as types from '../types';

export const logicalOperators: types.OperatorDefinition<any>[] = [
  [
    '&&',
    ['and'],
    -1,
    (expr: types.ExprAnd, ctx) => {
      return expr.slice(1).reduce((acc, e) => acc && ctx.eval(e, ctx), true);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprAnd>): ExpressionResult => {
      const js = ctx.operands.map((expr) => `(${expr})`).join('&&');
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprAnd>,

  [
    '||',
    ['or'],
    -1,
    (expr: types.ExprOr, ctx) => {
      return expr.slice(1).reduce((acc, e) => acc || ctx.eval(e, ctx), false);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprOr>): ExpressionResult => {
      const js = ctx.operands.map((expr) => `(${expr})`).join('||');
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprOr>,

  [
    '!',
    ['not'],
    1,
    (expr: types.ExprNot, ctx) => {
      return !ctx.eval(expr[1], ctx);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprNot>): ExpressionResult => {
      const js = `!(${ctx.operands[0]})`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprNot>,
];
