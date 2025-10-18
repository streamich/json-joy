import * as util from '../util';
import {Expression, type ExpressionResult} from '../codegen-steps';
import type * as types from '../types';

const toInt = util.int;

export const bitwiseOperators: types.OperatorDefinition<any>[] = [
  [
    '&',
    ['bitAnd'],
    -1,
    (expr: types.ExprBitAnd, ctx) => {
      return expr.slice(2).reduce((acc, e) => acc & toInt(ctx.eval(e, ctx)), toInt(ctx.eval(expr[1], ctx)));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprBitAnd>): ExpressionResult => {
      const js = ctx.operands.map((expr) => `(~~(${expr}))`).join('&');
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprBitAnd>,

  [
    '|',
    ['bitOr'],
    -1,
    (expr: types.ExprBitOr, ctx) => {
      return expr.slice(2).reduce((acc, e) => acc | toInt(ctx.eval(e, ctx)), toInt(ctx.eval(expr[1], ctx)));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprBitOr>): ExpressionResult => {
      const js = ctx.operands.map((expr) => `(~~(${expr}))`).join('|');
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprBitOr>,

  [
    '^',
    ['bitXor'],
    -1,
    (expr: types.ExprBitXor, ctx) => {
      return expr.slice(2).reduce((acc, e) => acc ^ toInt(ctx.eval(e, ctx)), toInt(ctx.eval(expr[1], ctx)));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprBitXor>): ExpressionResult => {
      const js = ctx.operands.map((expr) => `(~~(${expr}))`).join('^');
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprBitXor>,

  [
    '~',
    ['bitNot'],
    1,
    (expr: types.ExprBitNot, ctx) => {
      return ~toInt(ctx.eval(expr[1], ctx));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprBitNot>): ExpressionResult => {
      const js = `~(${ctx.operands[0]})`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprBitNot>,
];
