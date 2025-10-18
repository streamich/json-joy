import {Expression, type ExpressionResult} from '../codegen-steps';
import * as util from '../util';
import type * as types from '../types';

export const containerOperators: types.OperatorDefinition<any>[] = [
  [
    'len',
    [],
    1,
    (expr: types.ExprStr, ctx) => {
      return util.len(ctx.eval(expr[1], ctx));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprStr>): ExpressionResult => {
      ctx.link(util.len, 'len');
      const js = `len(${ctx.operands[0]})`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprStr>,

  [
    '[]',
    ['member'],
    2,
    (expr: types.ExprMember, ctx) => {
      const container = ctx.eval(expr[1], ctx);
      const index = ctx.eval(expr[2], ctx);
      return util.member(container, index);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprMember>): ExpressionResult => {
      ctx.link(util.member, 'member');
      const js = `member((${ctx.operands[0]}),(${ctx.operands[1]}))`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprMember>,
];
