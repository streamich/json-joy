import {Expression, ExpressionResult, Literal} from '../codegen-steps';
import {deepEqual} from '../../json-equal/deepEqual';
import {$$deepEqual} from '../../json-equal/$$deepEqual';
import type * as types from "../types";

const eqLitVsExpr = (literal: Literal, expression: Expression, ctx: types.OperatorCodegenCtx<types.Expression>, not?: boolean): ExpressionResult => {
  const fn = $$deepEqual(literal.val);
  const d = ctx.const(fn);
  return new Expression(`${not ? '!' : ''}${d}(${expression})`);
}

const binaryOperands = (
  expr: types.BinaryExpression<any>,
  ctx: types.OperatorEvalCtx,
): [left: unknown, right: unknown] => {
  const left = ctx.eval(expr[1], ctx);
  const right = ctx.eval(expr[2], ctx);
  return [left, right];
};

export const comparisonOperators: types.OperatorDefinition<any>[] = [
  [
    '==',
    ['eq'],
    2,
    (expr: types.ExprEquals, ctx) => {
      const [left, right] = binaryOperands(expr, ctx);
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
    (expr: types.ExprNotEquals, ctx) => {
      const [left, right] = binaryOperands(expr, ctx);
      return !deepEqual(left, right);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprNotEquals>): ExpressionResult => {
      const a = ctx.operands[0];
      const b = ctx.operands[1];
      if (a instanceof Literal && b instanceof Expression) return eqLitVsExpr(a, b, ctx, true);
      if (b instanceof Literal && a instanceof Expression) return eqLitVsExpr(b, a, ctx, true);
      ctx.link('deepEqual', deepEqual);
      return new Expression(`!deepEqual(${a},${b})`);
    },
  ] as types.OperatorDefinition<types.ExprNotEquals>,

  [
    '>',
    ['gt'],
    2,
    (expr: types.ExprGreaterThan, ctx) => {
      const [left, right] = binaryOperands(expr, ctx);
      return <any>left > <any>right;
    },
    (ctx: types.OperatorCodegenCtx<types.ExprGreaterThan>): ExpressionResult => {
      return new Expression(`(+(${ctx.operands[0]})||0)>(+(${ctx.operands[1]})||0)`);
    },
  ] as types.OperatorDefinition<types.ExprGreaterThan>,

  [
    '>=',
    ['ge'],
    2,
    (expr: types.ExprGreaterThanOrEqual, ctx) => {
      const [left, right] = binaryOperands(expr, ctx);
      return <any>left >= <any>right;
    },
    (ctx: types.OperatorCodegenCtx<types.ExprGreaterThanOrEqual>): ExpressionResult => {
      return new Expression(`(+(${ctx.operands[0]})||0)>=(+(${ctx.operands[1]})||0)`);
    },
  ] as types.OperatorDefinition<types.ExprGreaterThanOrEqual>,

  [
    '<',
    ['lt'],
    2,
    (expr: types.ExprLessThan, ctx) => {
      const [left, right] = binaryOperands(expr, ctx);
      return <any>left < <any>right;
    },
    (ctx: types.OperatorCodegenCtx<types.ExprLessThan>): ExpressionResult => {
      return new Expression(`(+(${ctx.operands[0]})||0)<(+(${ctx.operands[1]})||0)`);
    },
  ] as types.OperatorDefinition<types.ExprLessThan>,

  [
    '<=',
    ['le'],
    2,
    (expr: types.ExprLessThanOrEqual, ctx) => {
      const [left, right] = binaryOperands(expr, ctx);
      return <any>left <= <any>right;
    },
    (ctx: types.OperatorCodegenCtx<types.ExprLessThanOrEqual>): ExpressionResult => {
      return new Expression(`(+(${ctx.operands[0]})||0)<=(+(${ctx.operands[1]})||0)`);
    },
  ] as types.OperatorDefinition<types.ExprLessThanOrEqual>,
];
