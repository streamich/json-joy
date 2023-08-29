import * as util from '../util';
import {Expression, ExpressionResult} from '../codegen-steps';
import type * as types from '../types';

export const arrayOperators: types.OperatorDefinition<any>[] = [
  [
    'concat',
    ['++'],
    -1,
    (expr: types.ExprConcat, ctx) => {
      const arrays = expr.slice(1).map((e) => ctx.eval(e, ctx));
      return util.concat(arrays);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprConcat>): ExpressionResult => {
      ctx.link(util.concat, 'concat');
      const js = `concat([(${ctx.operands.join('),(')})])`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprConcat>,

  [
    'head',
    [],
    2,
    (expr: types.ExprHead, ctx) => {
      const operand1 = ctx.eval(expr[1], ctx);
      const operand2 = ctx.eval(expr[2], ctx);
      return util.head(operand1, operand2);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprHead>): ExpressionResult => {
      ctx.link(util.head, 'head');
      const js = `head((${ctx.operands[0]}),(${ctx.operands[1]}))`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprHead>,

  [
    'sort',
    [],
    1,
    (expr: types.ExprSort, ctx) => {
      const operand1 = ctx.eval(expr[1], ctx);
      const arr = util.asArr(operand1);
      /** @todo use `.toSorted()`, once it is more common. */
      return [...arr].sort();
    },
    (ctx: types.OperatorCodegenCtx<types.ExprSort>): ExpressionResult => {
      ctx.link(util.asArr, 'asArr');
      const js = `[...asArr(${ctx.operands[0]})].sort()`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprSort>,
];
