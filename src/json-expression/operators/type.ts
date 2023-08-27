import {Expression, ExpressionResult} from '../codegen-steps';
import * as util from "../util";
import type * as types from "../types";

export const typeOperators: types.OperatorDefinition<any>[] = [
  [
    'type',
    [],
    1,
    (expr: types.ExprNot, ctx) => {
      return util.type(ctx.eval(expr[1], ctx));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprNot>): ExpressionResult => {
      ctx.link('type', util.type);
      const js = `type(${ctx.operands[0]})`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprNot>,
];
