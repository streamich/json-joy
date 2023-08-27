import {Expression, ExpressionResult, Literal} from '../codegen-steps';
import {deepEqual} from '../../json-equal/deepEqual';
import {$$deepEqual} from '../../json-equal/$$deepEqual';
import type * as types from "../types";

const eqLitVsExpr = (literal: Literal, expression: Expression, ctx: types.OperatorCodegenCtx<types.ExprEquals>, not?: boolean): ExpressionResult => {
  const fn = $$deepEqual(literal.val);
  const d = ctx.const(fn);
  return new Expression(`${not ? '!' : ''}${d}(${expression})`);
}

export const comparisonOperators: types.OperatorDefinition<any>[] = [
  [
    '==',
    ['eq'],
    2,
    (expr: types.ExprEquals, ctx) => {
      const left = ctx.eval(expr[1], ctx);
      const right = ctx.eval(expr[2], ctx);
      return deepEqual(left, right);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprEquals>): ExpressionResult => {
      const a = ctx.operands[0];
      const b = ctx.operands[1];
      if (a instanceof Literal && b instanceof Expression) return eqLitVsExpr(a, b, ctx);
      if (b instanceof Literal && a instanceof Expression) return eqLitVsExpr(b, a, ctx);
      ctx.link('deepEqual', deepEqual);
      return new Expression(`deepEqual(${a},${b})`);
    },
  ] as types.OperatorDefinition<types.ExprEquals>,

  [
    '!=',
    ['ne'],
    2,
    (expr: types.ExprEquals, ctx) => {
      const left = ctx.eval(expr[1], ctx);
      const right = ctx.eval(expr[2], ctx);
      return !deepEqual(left, right);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprEquals>): ExpressionResult => {
      const a = ctx.operands[0];
      const b = ctx.operands[1];
      if (a instanceof Literal && b instanceof Expression) return eqLitVsExpr(a, b, ctx, true);
      if (b instanceof Literal && a instanceof Expression) return eqLitVsExpr(b, a, ctx, true);
      ctx.link('deepEqual', deepEqual);
      return new Expression(`!deepEqual(${a},${b})`);
    },
  ] as types.OperatorDefinition<types.ExprEquals>,
];
