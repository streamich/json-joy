import * as util from '../util';
import {Expression, ExpressionResult} from '../codegen-steps';
import type * as types from "../types";

const toNum = util.num;

export const arithmeticOperators: types.OperatorDefinition<any>[] = [
  [
    '+',
    ['add'],
    -1,
    (expr: types.ExprPlus, ctx) => {
      return expr.slice(1).reduce((acc, e) => toNum(ctx.eval(e, ctx)) + acc, 0);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprPlus>): ExpressionResult => {
      const js = ctx.operands.map(expr => `(+(${expr})||0)`).join('+');
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprPlus>,

  [
    '-',
    ['subtract'],
    -1,
    (expr: types.ExprMinus, ctx) => {
      return expr.slice(2).reduce((acc, e) => acc - toNum(ctx.eval(e, ctx)), toNum(ctx.eval(expr[1], ctx)));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprMinus>): ExpressionResult => {
      const js = ctx.operands.map(expr => `(+(${expr})||0)`).join('-');
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprMinus>,

  [
    '*',
    ['multiply'],
    -1,
    (expr: types.ExprAsterisk, ctx) => {
      return expr.slice(1).reduce((acc, e) => toNum(ctx.eval(e, ctx)) * acc, 1);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprAsterisk>): ExpressionResult => {
      const js = ctx.operands.map(expr => `(+(${expr})||0)`).join('*');
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprAsterisk>,

  [
    '/',
    ['divide'],
    -1,
    (expr: types.ExprMinus, ctx) => {
      const start = toNum(ctx.eval(expr[1], ctx));
      return expr.slice(2).reduce((acc, e) => util.slash(acc, toNum(ctx.eval(e, ctx))), start);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprMinus>): ExpressionResult => {
      ctx.link('slash', util.slash);
      const params = ctx.operands.map(expr => `(+(${expr})||0)`);
      let last: string = params[0];
      for (let i = 1; i < params.length; i++) last = `slash(${last}, ${params[i]})`;
      return new Expression(last);
    },
  ] as types.OperatorDefinition<types.ExprMinus>,
];
