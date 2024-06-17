import * as util from '../util';
import {Expression, ExpressionResult, Literal} from '../codegen-steps';
import type * as types from '../types';

const validateSetOperandCount = (count: number) => {
  if (count < 3) {
    throw new Error('Not enough operands for "o.set" operand.');
  }
  if (count % 2 !== 0) {
    throw new Error('Invalid number of operands for "o.set" operand.');
  }
};

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

  [
    'values',
    [],
    1,
    (expr: types.ExprValues, ctx) => {
      const operand = ctx.eval(expr[1], ctx);
      return util.values(operand);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprValues>): ExpressionResult => {
      ctx.link(util.values, 'values');
      const js = `values(${ctx.operands[0]})`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprValues>,

  [
    'entries',
    [],
    1,
    (expr: types.ExprEntries, ctx) => {
      const operand = ctx.eval(expr[1], ctx);
      return util.entries(operand);
    },
    (ctx: types.OperatorCodegenCtx<types.ExprEntries>): ExpressionResult => {
      ctx.link(util.entries, 'entries');
      const js = `entries(${ctx.operands[0]})`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprEntries>,

  [
    'o.set',
    [],
    -1,
    /**
     * Set one or more properties on an object.
     *
     * ```
     * ['o.set', {},
     *   'a', 1,
     *   'b', ['+', 2, 3],
     * ]
     * ```
     *
     * Results in:
     *
     * ```
     * {
     *   a: 1,
     *   b: 5,
     * }
     * ```
     */
    (expr: types.ExprObjectSet, ctx) => {
      let i = 1;
      const length = expr.length;
      validateSetOperandCount(length);
      let doc = util.asObj(ctx.eval(expr[i++], ctx)) as Record<string, unknown>;
      while (i < length) {
        const prop = util.str(expr[i++]) as string;
        const value = ctx.eval(expr[i++], ctx);
        doc[prop] = value;
      }
      return doc;
    },
    (ctx: types.OperatorCodegenCtx<types.ExprObjectSet>): ExpressionResult => {
      const length = ctx.operands.length;
      validateSetOperandCount(length + 1);
      let i = 0;
      let curr = ctx.operands[i++];
      if (curr instanceof Literal) {
        curr = new Literal(util.asObj(curr.val));
      } else if (curr instanceof Expression) {
        ctx.link(util.asObj, 'asObj');
        curr = new Expression(`asObj(${curr})`);
      }
      ctx.link(util.str, 'str');
      ctx.link(util.setRaw, 'setRaw');
      while (i < length) {
        let prop = ctx.operands[i++];
        if (prop instanceof Literal) {
          prop = new Literal(util.str(prop.val));
        } else if (prop instanceof Expression) {
          prop = new Expression(`str(${prop})`);
        }
        const value = ctx.operands[i++];
        curr = new Expression(`setRaw(${curr}, ${prop}, ${value})`);
      }
      return curr;
    },
  ] as types.OperatorDefinition<types.ExprObjectSet>,
];
