import {Expression, type ExpressionResult, Literal} from '../codegen-steps';
import type * as types from '../types';

export const branchingOperators: types.OperatorDefinition<any>[] = [
  [
    '?',
    ['if'],
    3,
    (expr: types.ExprIf, ctx) => {
      return ctx.eval(expr[1], ctx) ? ctx.eval(expr[2], ctx) : ctx.eval(expr[3], ctx);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprIf>): ExpressionResult => {
      const condition = ctx.operands[0];
      const then = ctx.operands[1];
      const otherwise = ctx.operands[2];
      if (condition instanceof Literal) return condition.val ? then : otherwise;
      return new Expression(`(${condition})?(${then}):(${otherwise})`);
    },
  ] as types.OperatorDefinition<types.ExprIf>,

  [
    'throw',
    [],
    1,
    (expr: types.ExprThrow, ctx) => {
      throw ctx.eval(expr[1], ctx);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprThrow>): ExpressionResult => {
      return new Expression(`(function(){throw (${ctx.operands[0]})})()`);
    },
  ] as types.OperatorDefinition<types.ExprThrow>,
];
