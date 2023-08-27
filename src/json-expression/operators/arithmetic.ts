import * as util from '../util';
import type {ExprMinus, ExprPlus, OperatorCodegenCtx, OperatorDefinition} from "../types";
import {Expression, ExpressionResult, Literal} from '../codegen-steps';

const toNum = util.num;

export const arithmeticOperators: OperatorDefinition<any>[] = [
  [
    '+',
    ['add'],
    -1,
    (expr: ExprPlus, ctx) => {
      return expr.slice(1).reduce((acc, e) => util.num(ctx.eval(e, ctx)) + acc, 0);
    },
    (ctx: OperatorCodegenCtx<ExprPlus>): ExpressionResult => {
      const params = ctx.expr.slice(1).map((operand) => {
        const expr = ctx.operand(operand);
        return `(+(${expr})||0)`;
      });
      return new Expression(`${params.join('+')}`);
    },
  ] as OperatorDefinition<ExprPlus>,
  
  [
    '-',
    ['subtract'],
    -1,
    (expr: ExprMinus, ctx) => {
      return expr.slice(2).reduce((acc, e) => acc - toNum(ctx.eval(e, ctx)), toNum(ctx.eval(expr[1], ctx)));
    },
    (ctx: OperatorCodegenCtx<ExprMinus>): ExpressionResult => {
      const params = ctx.expr.slice(1).map((operand) => {
        const expr = ctx.operand(operand);
        return `(+(${expr})||0)`;
      });
      return new Expression(`${params.join('-')}`);
    },
  ] as OperatorDefinition<ExprMinus>,
];
