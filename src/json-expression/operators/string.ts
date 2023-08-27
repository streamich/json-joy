import {Expression, ExpressionResult} from '../codegen-steps';
import * as util from "../util";
import type * as types from "../types";

const binaryOperands = (
  expr: types.BinaryExpression<any>,
  ctx: types.OperatorEvalCtx,
): [left: unknown, right: unknown] => {
  const left = ctx.eval(expr[1], ctx);
  const right = ctx.eval(expr[2], ctx);
  return [left, right];
};

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
      const [outer, inner] = binaryOperands(expr, ctx);
      return util.contains(outer, inner);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprContains>): ExpressionResult => {
      ctx.link('contains', util.contains);
      const js = `contains(${ctx.operands[0]},${ctx.operands[1]})`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprContains>,

  [
    'starts',
    [],
    2,
    (expr: types.ExprStarts, ctx) => {
      const [outer, inner] = binaryOperands(expr, ctx);
      return util.starts(outer, inner);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprStarts>): ExpressionResult => {
      ctx.link('starts', util.starts);
      const js = `starts(${ctx.operands[0]},${ctx.operands[1]})`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprStarts>,

  [
    'ends',
    [],
    2,
    (expr: types.ExprEnds, ctx) => {
      const [outer, inner] = binaryOperands(expr, ctx);
      return util.ends(outer, inner);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprEnds>): ExpressionResult => {
      ctx.link('ends', util.ends);
      const js = `ends(${ctx.operands[0]},${ctx.operands[1]})`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprEnds>,
];
