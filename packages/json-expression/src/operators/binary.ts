import * as util from '../util';
import {Expression, type ExpressionResult} from '../codegen-steps';
import type * as types from '../types';

const binaryOperands = (
  expr: types.BinaryExpression<any>,
  ctx: types.OperatorEvalCtx,
): [left: unknown, right: unknown] => {
  const left = ctx.eval(expr[1], ctx);
  const right = ctx.eval(expr[2], ctx);
  return [left, right];
};

export const binaryOperators: types.OperatorDefinition<any>[] = [
  [
    'u8',
    [],
    2,
    (expr: types.ExprU8, ctx) => {
      const [bin, index] = binaryOperands(expr, ctx);
      return util.u8(bin, index);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprU8>): ExpressionResult => {
      ctx.link(util.u8, 'u8');
      const js = `u8((${ctx.operands[0]}),(${ctx.operands[1]}))`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprU8>,
];
