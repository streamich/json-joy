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

  [
    'bool',
    [],
    1,
    (expr: types.ExprBool, ctx) => {
      return !!(ctx.eval(expr[1], ctx));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprBool>): ExpressionResult => {
      const js = `!!${ctx.operands[0]}`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprBool>,

  [
    'num',
    [],
    1,
    (expr: types.ExprNum, ctx) => {
      return util.num(ctx.eval(expr[1], ctx));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprNum>): ExpressionResult => {
      const js = `+(${ctx.operands[0]})||0`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprNum>,

  [
    'str',
    [],
    1,
    (expr: types.ExprStr, ctx) => {
      return util.str(ctx.eval(expr[1], ctx));
    },
    (ctx: types.OperatorCodegenCtx<types.ExprStr>): ExpressionResult => {
      ctx.link('str', util.str);
      const js = `str(${ctx.operands[0]})`;
      return new Expression(js);
    },
  ] as types.OperatorDefinition<types.ExprStr>,
];
