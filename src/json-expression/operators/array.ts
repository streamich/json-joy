import * as util from '../util';
import {Expression, ExpressionResult} from '../codegen-steps';
import type * as types from '../types';
import {deepEqual} from '../../json-equal/deepEqual';

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
      ctx.link(util.isInArr, 'isInArr');
      const js = `isInArr((${ctx.operands[0]}),(${ctx.operands[1]}))`;
      return new Expression(js);
      // const [, a, b] = expr;
      // const container = this.onExpression(b);
      // const what = this.onExpression(a);
      // if (container instanceof Literal) {
      //   if (!(container.val instanceof Array)) throw new Error('"in" operator expects second operand to be an array.');
      //   if (what instanceof Literal) return new Literal(util.isInContainer(what.val, container.val));
      //   if (container.val.length === 0) return new Literal(false);
      //   if (container.val.length === 1) return this.onExpression(['==', a, toBoxed(container.val[0])]);
      // }
      // this.codegen.link('isInContainer');
      // return new Expression(`isInContainer(${what}, ${container})`);
    },
  ] as types.OperatorDefinition<types.ExprIn>,
];
