import * as util from '../util';
import {Expression, ExpressionResult} from '../codegen-steps';
import type * as types from '../types';

export const objectOperators: types.OperatorDefinition<any>[] = [
  [
    'keys',
    [],
    1,
    (expr: types.ExprKeys, ctx) => {
      const operand = ctx.eval(expr[1], ctx);
      return util.keys(operand);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprKeys>): ExpressionResult => {
      ctx.link(util.keys, 'keys');
      const js = `keys(${ctx.operands[0]})`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprKeys>,
];
