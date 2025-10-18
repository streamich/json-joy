import {Expression, type ExpressionResult, Literal} from '../codegen-steps';
import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
import {deepEqualCodegen} from '@jsonjoy.com/util/lib/json-equal/deepEqualCodegen';
import * as util from '../util';
import type * as types from '../types';

const eqLitVsExpr = (
  literal: Literal,
  expression: Expression,
  ctx: types.OperatorCodegenCtx<types.Expression>,
  not?: boolean,
): ExpressionResult => {
  const fn = deepEqualCodegen(literal.val);
  const d = ctx.const(fn);
  return new Expression(`${not ? '!' : ''}${d}(${expression})`);
};

const binaryOperands = (
  expr: types.BinaryExpression<any>,
  ctx: types.OperatorEvalCtx,
): [left: unknown, right: unknown] => {
  const left = ctx.eval(expr[1], ctx);
  const right = ctx.eval(expr[2], ctx);
  return [left, right];
};

const ternaryOperands = (
  expr: types.TernaryExpression<any>,
  ctx: types.OperatorEvalCtx,
): [a: unknown, b: unknown, c: unknown] => {
  const a = ctx.eval(expr[1], ctx);
  const b = ctx.eval(expr[2], ctx);
  const c = ctx.eval(expr[3], ctx);
  return [a, b, c];
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
      ctx.link(deepEqual, 'deepEqual');
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
      ctx.link(deepEqual, 'deepEqual');
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
      return new Expression(`(${ctx.operands[0]})>(${ctx.operands[1]})`);
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
      return new Expression(`(${ctx.operands[0]})>=(${ctx.operands[1]})`);
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
      return new Expression(`(${ctx.operands[0]})<(${ctx.operands[1]})`);
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
      return new Expression(`(${ctx.operands[0]})<=(${ctx.operands[1]})`);
    },
  ] as types.OperatorDefinition<types.ExprLessThanOrEqual>,

  [
    'cmp',
    [],
    2,
    (expr: types.ExprCmp, ctx) => {
      const [left, right] = binaryOperands(expr, ctx);
      return util.cmp(left, right);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprCmp>): ExpressionResult => {
      ctx.link(util.cmp, 'cmp');
      return new Expression(`cmp((${ctx.operands[0]}),(${ctx.operands[1]}))`);
    },
  ] as types.OperatorDefinition<types.ExprCmp>,

  [
    '=><=',
    ['between'],
    3,
    (expr: types.ExprBetweenEqEq, ctx) => {
      const [val, min, max] = ternaryOperands(expr, ctx);
      return util.betweenEqEq(val, min, max);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprBetweenEqEq>): ExpressionResult => {
      ctx.link(util.betweenEqEq, 'betweenEqEq');
      return new Expression(`betweenEqEq(${ctx.operands[0]},${ctx.operands[1]},${ctx.operands[2]})`);
    },
  ] as types.OperatorDefinition<types.ExprBetweenEqEq>,

  [
    '><',
    [],
    3,
    (expr: types.ExprBetweenNeNe, ctx) => {
      const [val, min, max] = ternaryOperands(expr, ctx);
      return util.betweenNeNe(val, min, max);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprBetweenNeNe>): ExpressionResult => {
      ctx.link(util.betweenNeNe, 'betweenNeNe');
      return new Expression(`betweenNeNe(${ctx.operands[0]},${ctx.operands[1]},${ctx.operands[2]})`);
    },
  ] as types.OperatorDefinition<types.ExprBetweenNeNe>,

  [
    '=><',
    [],
    3,
    (expr: types.ExprBetweenEqNe, ctx) => {
      const [val, min, max] = ternaryOperands(expr, ctx);
      return util.betweenEqNe(val, min, max);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprBetweenEqNe>): ExpressionResult => {
      ctx.link(util.betweenEqNe, 'betweenEqNe');
      return new Expression(`betweenEqNe(${ctx.operands[0]},${ctx.operands[1]},${ctx.operands[2]})`);
    },
  ] as types.OperatorDefinition<types.ExprBetweenEqNe>,

  [
    '><=',
    [],
    3,
    (expr: types.ExprBetweenNeEq, ctx) => {
      const [val, min, max] = ternaryOperands(expr, ctx);
      return util.betweenNeEq(val, min, max);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprBetweenNeEq>): ExpressionResult => {
      ctx.link(util.betweenNeEq, 'betweenNeEq');
      return new Expression(`betweenNeEq(${ctx.operands[0]},${ctx.operands[1]},${ctx.operands[2]})`);
    },
  ] as types.OperatorDefinition<types.ExprBetweenNeEq>,
];
