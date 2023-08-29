import * as util from '../util';
import {Expression, ExpressionResult, Literal} from '../codegen-steps';
import type * as types from '../types';
import {$$deepEqual} from '../../json-equal/$$deepEqual';

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

  [
    'reverse',
    [],
    1,
    (expr: types.ExprReverse, ctx) => {
      const operand1 = ctx.eval(expr[1], ctx);
      const arr = util.asArr(operand1);
      /** @todo use `.toReversed()`, once it is more common. */
      return [...arr].reverse();
    },
    (ctx: types.OperatorCodegenCtx<types.ExprReverse>): ExpressionResult => {
      ctx.link(util.asArr, 'asArr');
      const js = `[...asArr(${ctx.operands[0]})].reverse()`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprReverse>,

  [
    'in',
    [],
    2,
    (expr: types.ExprIn, ctx) => {
      const arr = ctx.eval(expr[1], ctx);
      const val = ctx.eval(expr[2], ctx);
      return util.isInArr(arr, val);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprIn>): ExpressionResult => {
      const arr = ctx.operands[0];
      const val = ctx.operands[1];
      if (val instanceof Literal) {
        const fnJs = $$deepEqual(val.val);
        const d = ctx.const(fnJs);
        ctx.link(util.isInArr2, 'isInArr2');
        const js = `isInArr2((${ctx.operands[0]}),${d})`;
        return new Expression(js);
      }
      ctx.link(util.isInArr, 'isInArr');
      const js = `isInArr((${ctx.operands[0]}),(${ctx.operands[1]}))`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprIn>,

  [
    'fromEntries',
    [],
    1,
    (expr: types.ExprFromEntries, ctx) => {
      const operand1 = ctx.eval(expr[1], ctx);
      return util.fromEntries(operand1);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprFromEntries>): ExpressionResult => {
      ctx.link(util.fromEntries, 'fromEntries');
      const js = `fromEntries(${ctx.operands[0]})`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprFromEntries>,

  [
    'indexOf',
    [],
    2,
    (expr: types.ExprIndexOf, ctx) => {
      const operand1 = ctx.eval(expr[1], ctx);
      const operand2 = ctx.eval(expr[2], ctx);
      return util.indexOf(operand1, operand2);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprIndexOf>): ExpressionResult => {
      ctx.link(util.indexOf, 'indexOf');
      const js = `indexOf((${ctx.operands[0]}),(${ctx.operands[1]}))`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprIndexOf>,
];
